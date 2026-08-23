#!/bin/bash
# mysql-restore.sh: Restore MySQL database from a .sql.gz file

set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <path-to-backup.sql.gz>"
  exit 1
fi

RESTORE_FILE="$1"

if [ ! -f "${RESTORE_FILE}" ]; then
  echo "Error: Backup file not found at ${RESTORE_FILE}"
  exit 1
fi

# Determine script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Load environment variables
ENV_FILE="${PROJECT_ROOT}/.env"
trim() {
  echo "$1" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//'
}

if [ -f "${ENV_FILE}" ]; then
  echo "Loading environment variables from ${ENV_FILE}..."
  while IFS= read -r line || [ -n "$line" ]; do
    trimmed=$(trim "$line")
    if [[ -n "$trimmed" && ! "$trimmed" =~ ^# ]]; then
      if [[ "$trimmed" == *"="* ]]; then
        var_name=$(trim "${trimmed%%=*}")
        var_val=$(trim "${trimmed#*=}")
        if [[ "$var_val" =~ ^\'.*\'$ ]] || \
           [[ "$var_val" =~ ^\".*\"$ ]]; then
          var_val="${var_val:1:-1}"
        fi
        export "${var_name}"="${var_val}"
      fi
    fi
  done < "${ENV_FILE}"
fi

# Track restore state and logging actor
SUCCESS=false
ACTOR="${BACKUP_ACTOR:-system/manual}"

log_to_db() {
  local status="$1"
  local error_msg="${2:-}"

  if [ "${SKIP_DB_LOG:-false}" = "true" ]; then
    return 0
  fi

  # Build metadata JSON
  local meta
  if [ "$status" = "success" ]; then
    meta="{\"restore_file\":\"$(basename "${RESTORE_FILE}")\""
  else
    local escaped_err
    escaped_err=$(echo "${error_msg}" | sed 's/"/\\"/g' | tr -d '\n')
    meta="{\"restore_file\":\"$(basename "${RESTORE_FILE}")\""
    meta="${meta},\"error\":\"${escaped_err}\""
  fi

  if [ -n "${CLIENT_IP:-}" ]; then
    meta="${meta},\"ip\":\"${CLIENT_IP}\""
  fi
  if [ -n "${USER_AGENT:-}" ]; then
    local escaped_ua
    escaped_ua=$(echo "${USER_AGENT}" | sed 's/"/\\"/g')
    meta="${meta},\"user_agent\":\"${escaped_ua}\""
  fi
  meta="${meta}}"

  local query="INSERT INTO audit_logs (actor, action, target, "
  query="${query}status, metadata) VALUES ('${ACTOR}', "
  query="${query}'restore_backup', 'database', '${status}', '${meta}');"

  echo "Logging restore status to database..."

  local m_host m_port
  m_host=$(echo "${MYSQL_ADDRESS:-db:3306}" | cut -d':' -f1)
  m_port=$(echo "${MYSQL_ADDRESS:-db:3306}" | cut -d':' -f2)
  m_port="${DATABASE_PORT:-${m_port:-3306}}"

  if command -v docker &> /dev/null && \
     docker ps | grep -q "${BACKUP_CONTAINER_NAME:-}"; then
    docker exec -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" \
      "${BACKUP_CONTAINER_NAME}" \
      mysql -u root "${MYSQL_DB_NAME}" -e "${query}" || \
      echo "Warning: Failed to write audit log to DB"
  else
    mysql -h "${m_host}" -P "${m_port}" \
      -u root -p"${MYSQL_ROOT_PASSWORD}" \
      "${MYSQL_DB_NAME}" -e "${query}" || \
      echo "Warning: Failed to write audit log to DB"
  fi
}

cleanup() {
  local exit_code=$?
  if [ "$SUCCESS" = "false" ]; then
    log_to_db "fail" \
      "Restore process terminated unexpectedly with exit code ${exit_code}"
  fi
}
trap cleanup EXIT

# Verify required environment variables
if [ -z "${MYSQL_ROOT_PASSWORD:-}" ] || \
   [ -z "${MYSQL_DB_NAME:-}" ]; then
  echo "Error: Required database environment variables are missing."
  exit 1
fi

echo "Restoring database from ${RESTORE_FILE}..."

# Check if docker is available and BACKUP_CONTAINER_NAME is running
if command -v docker &> /dev/null && \
   docker ps | grep -q "${BACKUP_CONTAINER_NAME:-}"; then
  echo "Restoring via Docker exec..."
  gunzip -c "${RESTORE_FILE}" | \
    docker exec -i "${BACKUP_CONTAINER_NAME}" \
    mysql -u root -p"${MYSQL_ROOT_PASSWORD}" "${MYSQL_DB_NAME}"
else
  echo "Restoring via TCP connection..."
  # Parse host and port
  MYSQL_HOST=$(echo "${MYSQL_ADDRESS:-db:3306}" | cut -d':' -f1)
  MYSQL_PORT=$(echo "${MYSQL_ADDRESS:-db:3306}" | cut -d':' -f2)
  MYSQL_PORT="${DATABASE_PORT:-${MYSQL_PORT:-3306}}"
  
  gunzip -c "${RESTORE_FILE}" | \
    mysql -h "${MYSQL_HOST}" -P "${MYSQL_PORT}" \
    -u root -p"${MYSQL_ROOT_PASSWORD}" "${MYSQL_DB_NAME}"
fi

SUCCESS=true
log_to_db "success"
echo "Database restore completed successfully!"
