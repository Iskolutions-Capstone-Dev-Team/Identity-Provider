#!/bin/bash
# mysql-replica-setup.sh: Initialize GTID replication on Fallback MySQL instances
# Usage: ./mysql-replica-setup.sh

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

PRIMARY_IP="${PRIMARY_IP:-}"
REPL_USER="${REPL_USER:-repl}"
REPL_PASSWORD="${REPL_PASSWORD:-}"
MYSQL_ROOT_PW="${MYSQL_ROOT_PASSWORD:-}"
IDP_DB_CONTAINER="${IDP_DB_CONTAINER:-unified_access_database}"
PORTAL_DB_CONTAINER="${PORTAL_DB_CONTAINER:-one_portal_database}"

if [ -z "${PRIMARY_IP}" ] || [ -z "${REPL_PASSWORD}" ] || [ -z "${MYSQL_ROOT_PW}" ]; then
  echo "Error: PRIMARY_IP, REPL_PASSWORD, and MYSQL_ROOT_PASSWORD must be configured." >&2
  exit 1
fi

echo "[Replication Setup] Configuring Fallback databases as read-only replicas of ${PRIMARY_IP}..."

# Setup IdP Database Replication (Port 3360 on primary)
if docker ps --format '{{.Names}}' | grep -q "^${IDP_DB_CONTAINER}$"; then
  echo "[Replication Setup] Configuring ${IDP_DB_CONTAINER}..."
  docker exec -i "${IDP_DB_CONTAINER}" mysql -uroot -p"${MYSQL_ROOT_PW}" <<SQL
STOP REPLICA;
SET GLOBAL read_only = ON;
SET GLOBAL super_read_only = ON;
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST='${PRIMARY_IP}',
  SOURCE_PORT=3360,
  SOURCE_USER='${REPL_USER}',
  SOURCE_PASSWORD='${REPL_PASSWORD}',
  SOURCE_AUTO_POSITION=1;
START REPLICA;
SQL
  echo "[Replication Setup] Replication started for ${IDP_DB_CONTAINER}."
fi

# Setup One Portal Database Replication (Port 3361 on primary)
if docker ps --format '{{.Names}}' | grep -q "^${PORTAL_DB_CONTAINER}$"; then
  echo "[Replication Setup] Configuring ${PORTAL_DB_CONTAINER}..."
  docker exec -i "${PORTAL_DB_CONTAINER}" mysql -uroot -p"${MYSQL_ROOT_PW}" <<SQL
STOP REPLICA;
SET GLOBAL read_only = ON;
SET GLOBAL super_read_only = ON;
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST='${PRIMARY_IP}',
  SOURCE_PORT=3361,
  SOURCE_USER='${REPL_USER}',
  SOURCE_PASSWORD='${REPL_PASSWORD}',
  SOURCE_AUTO_POSITION=1;
START REPLICA;
SQL
  echo "[Replication Setup] Replication started for ${PORTAL_DB_CONTAINER}."
fi

echo "[Replication Setup] Verification:"
docker exec -i "${IDP_DB_CONTAINER}" mysql -uroot -p"${MYSQL_ROOT_PW}" -e \
  "SHOW REPLICA STATUS\G" | grep -E "Replica_IO_Running|Replica_SQL_Running|Seconds_Behind_Source" || true
