#!/bin/bash
# promote-to-primary.sh: Promote fallback MySQL databases to primary write mode
# Usage: ./promote-to-primary.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${PROJECT_ROOT}/.env"

trim() {
  echo "$1" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//'
}

if [ -f "${ENV_FILE}" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    trimmed=$(trim "$line")
    if [[ -n "$trimmed" && ! "$trimmed" =~ ^# ]]; then
      if [[ "$trimmed" == *"="* ]]; then
        var_name=$(trim "${trimmed%%=*}")
        var_val=$(trim "${trimmed#*=}")
        if [[ "$var_val" =~ ^\'.*\'$ ]] || [[ "$var_val" =~ ^\".*\"$ ]]; then
          var_val="${var_val:1:-1}"
        fi
        export "${var_name}"="${var_val}"
      fi
    fi
  done < "${ENV_FILE}"
fi

IDP_DB_CONTAINER="${IDP_DB_CONTAINER:-unified_access_database}"
PORTAL_DB_CONTAINER="${PORTAL_DB_CONTAINER:-one_portal_database}"
MYSQL_ROOT_PW="${MYSQL_ROOT_PASSWORD:-}"

if [ -z "${MYSQL_ROOT_PW}" ]; then
  echo "Error: MYSQL_ROOT_PASSWORD is not set." >&2
  exit 1
fi

echo "[Promotion] Starting database promotion on Fallback server..."

# 1. Promote Identity Provider Database
if docker ps --format '{{.Names}}' | grep -q "^${IDP_DB_CONTAINER}$"; then
  echo "[Promotion] Promoting ${IDP_DB_CONTAINER} to write mode..."
  docker exec -i "${IDP_DB_CONTAINER}" mysql -uroot -p"${MYSQL_ROOT_PW}" <<SQL
STOP REPLICA;
RESET REPLICA ALL;
SET GLOBAL read_only = OFF;
SET GLOBAL super_read_only = OFF;
SQL
  echo "[Promotion] ${IDP_DB_CONTAINER} successfully promoted."
else
  echo "[Promotion Warning] Container ${IDP_DB_CONTAINER} not running." >&2
fi

# 2. Promote One Portal Database
if docker ps --format '{{.Names}}' | grep -q "^${PORTAL_DB_CONTAINER}$"; then
  echo "[Promotion] Promoting ${PORTAL_DB_CONTAINER} to write mode..."
  docker exec -i "${PORTAL_DB_CONTAINER}" mysql -uroot -p"${MYSQL_ROOT_PW}" <<SQL
STOP REPLICA;
RESET REPLICA ALL;
SET GLOBAL read_only = OFF;
SET GLOBAL super_read_only = OFF;
SQL
  echo "[Promotion] ${PORTAL_DB_CONTAINER} successfully promoted."
else
  echo "[Promotion Warning] Container ${PORTAL_DB_CONTAINER} not running." >&2
fi

echo "[Promotion] Database promotion complete. Standby instances are now primary."
