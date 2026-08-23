#!/bin/bash
# mysql-backup-s3.sh: Perform MySQL backup and upload to S3

set -euo pipefail

# Get directory where this script resides
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Determine project root and load environment variables
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
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

# Track backup state and logging actor
USE_DOCKER=false
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
    meta="{\"backup_type\":\"${BACKUP_TYPE:-unknown}\""
    meta="${meta},\"backup_size\":\"${HUMAN_SIZE:-unknown}\""
  else
    local escaped_err
    escaped_err=$(echo "${error_msg}" | sed 's/"/\\"/g' | tr -d '\n')
    meta="{\"backup_type\":\"${BACKUP_TYPE:-unknown}\""
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
  query="${query}'run_backup', 'database', '${status}', '${meta}');"

  echo "Logging backup status to database..."

  local m_host m_port
  m_host=$(echo "${MYSQL_ADDRESS:-db:3306}" | cut -d':' -f1)
  m_port=$(echo "${MYSQL_ADDRESS:-db:3306}" | cut -d':' -f2)
  m_port="${DATABASE_PORT:-${m_port:-3306}}"

  if [ "${USE_DOCKER:-false}" = "true" ]; then
    docker exec -e MYSQL_PWD="${MYSQL_PWD}" "${BACKUP_CONTAINER_NAME}" \
      mysql -u root "${MYSQL_DB_NAME}" -e "${query}" || \
      echo "Warning: Failed to write audit log to DB"
  else
    mysql -h "${m_host}" -P "${m_port}" -u root "${MYSQL_DB_NAME}" \
      -e "${query}" || echo "Warning: Failed to write audit log to DB"
  fi
}

cleanup() {
  local exit_code=$?
  if [ "$SUCCESS" = "false" ]; then
    log_to_db "fail" \
      "Backup process terminated unexpectedly with exit code ${exit_code}"
  fi
  # Clean up temp files
  if [ -n "${TEMP_BACKUP_GZ:-}" ]; then
    rm -f "${TEMP_BACKUP_GZ}" "${TEMP_BACKUP_GZ}.sha256" "${REPORT_FILE:-}"
  fi
}
trap cleanup EXIT

# Determine backup type and retention days based on current date
# if not passed as environment variables.
DAY_OF_WEEK=$(date +%u)  # 1=Monday, 7=Sunday
DAY_OF_MONTH=$(date +%d)

if [ "${BACKUP_TYPE:-}" = "" ]; then
  if [ "$DAY_OF_MONTH" = "01" ]; then
    BACKUP_TYPE="monthly"
    RETENTION_DAYS=365
  elif [ "$DAY_OF_WEEK" = "7" ]; then
    BACKUP_TYPE="weekly"
    RETENTION_DAYS=84
  else
    BACKUP_TYPE="daily"
    RETENTION_DAYS=30
  fi
else
  # Use provided values
  BACKUP_TYPE="${BACKUP_TYPE}"
  RETENTION_DAYS="${RETENTION_DAYS:-30}"
fi

echo "Backup Type: ${BACKUP_TYPE} (Retention: ${RETENTION_DAYS} days)"

# Verify required environment variables
if [ -z "${MYSQL_ROOT_PASSWORD:-}" ] || \
   [ -z "${MYSQL_DB_NAME:-}" ] || \
   [ -z "${BACKUP_CONTAINER_NAME:-}" ] || \
   [ -z "${BACKUP_S3_BUCKET:-}" ]; then
  echo "Error: Required environment variables are missing."
  exit 1
fi

# Configure AWS credentials if provided in env
if [ -n "${AWS_ACCESS_KEY_ID:-}" ]; then
  export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}"
fi
if [ -n "${AWS_SECRET_ACCESS_KEY:-}" ]; then
  export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}"
fi
if [ -n "${AWS_REGION:-}" ]; then
  export AWS_DEFAULT_REGION="${AWS_REGION}"
fi

# Export MYSQL_PWD for secure database commands without -p option
export MYSQL_PWD="${MYSQL_ROOT_PASSWORD}"

# Check if docker is available and BACKUP_CONTAINER_NAME is running
USE_DOCKER=false
if command -v docker &> /dev/null && \
   docker ps | grep -q "${BACKUP_CONTAINER_NAME}"; then
  USE_DOCKER=true
fi

# Step 1: Test database connection
if [ "$USE_DOCKER" = "true" ]; then
  echo "Testing database connection via Docker exec..."
  if ! docker exec -e MYSQL_PWD="${MYSQL_PWD}" "${BACKUP_CONTAINER_NAME}" \
    mysql -u root -e "SELECT 1" >/dev/null 2>&1; then
    echo "Database connection failed through docker exec"
    exit 1
  fi
else
  echo "Testing database connection via TCP..."
  # Parse host and port
  MYSQL_HOST=$(echo "${MYSQL_ADDRESS:-db:3306}" | cut -d':' -f1)
  MYSQL_PORT=$(echo "${MYSQL_ADDRESS:-db:3306}" | cut -d':' -f2)
  MYSQL_PORT="${DATABASE_PORT:-${MYSQL_PORT:-3306}}"
  if ! mysql -h "${MYSQL_HOST}" -P "${MYSQL_PORT}" \
    -u root -e "SELECT 1" >/dev/null 2>&1; then
    echo "Database connection failed on host ${MYSQL_HOST}:${MYSQL_PORT}"
    exit 1
  fi
fi
echo "Connection test passed!"

# Step 3: Create MySQL Dump
echo "Creating database backup..."
TEMP_BACKUP_GZ="/tmp/prod-backup-$$.sql.gz"

# Ensure clean state
rm -f "${TEMP_BACKUP_GZ}"

if [ "$USE_DOCKER" = "true" ]; then
  docker exec -e MYSQL_PWD="${MYSQL_PWD}" "${BACKUP_CONTAINER_NAME}" \
    mysqldump -u root "${MYSQL_DB_NAME}" | gzip > "${TEMP_BACKUP_GZ}"
else
  mysqldump -h "${MYSQL_HOST}" -P "${MYSQL_PORT}" \
    -u root "${MYSQL_DB_NAME}" | gzip > "${TEMP_BACKUP_GZ}"
fi

if [ ! -f "${TEMP_BACKUP_GZ}" ]; then
  echo "Backup file creation failed!"
  exit 1
fi

# Verify backup size
FILE_SIZE=$(stat -f%z "${TEMP_BACKUP_GZ}" 2>/dev/null || \
            stat -c%s "${TEMP_BACKUP_GZ}" 2>/dev/null)
echo "Backup file size: ${FILE_SIZE} bytes"

if [ "${FILE_SIZE}" -lt 1000 ]; then
  echo "Backup file is too small (${FILE_SIZE} bytes)!"
  exit 1
fi

HUMAN_SIZE=$(du -h "${TEMP_BACKUP_GZ}" | cut -f1)
echo "Backup created successfully - ${HUMAN_SIZE}"

# Generate checksum
echo "Generating checksum..."
sha256sum "${TEMP_BACKUP_GZ}" > "${TEMP_BACKUP_GZ}.sha256"

# Define destination paths in S3
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
DATE_PATH=$(date +"%Y/%m/%d")

FILE="backup-${BACKUP_TYPE}-${TIMESTAMP}.sql.gz"
CHECKSUM_FILE="${FILE}.sha256"

DEST_PREFIX="s3://${BACKUP_S3_BUCKET}/mysql-backups/${BACKUP_TYPE}s"
DEST="${DEST_PREFIX}/${DATE_PATH}/${FILE}"
DEST_CHECKSUM="${DEST_PREFIX}/${DATE_PATH}/${CHECKSUM_FILE}"

echo "Uploading ${BACKUP_TYPE} backup to S3..."
echo "   Destination: ${DEST}"

# S3 upload options
S3_OPTS="--storage-class STANDARD --sse AES256"

# Build metadata safely under line limits
META_STR="backup-type=${BACKUP_TYPE},"
META_STR="${META_STR}created=$(date -Iseconds),"
META_STR="${META_STR}retention-days=${RETENTION_DAYS}"

aws s3 cp "${TEMP_BACKUP_GZ}" "${DEST}" ${S3_OPTS} \
  --metadata "${META_STR}"

aws s3 cp "${TEMP_BACKUP_GZ}.sha256" "${DEST_CHECKSUM}" ${S3_OPTS}

echo "Backup uploaded successfully: ${FILE}"

# Step 4: GFS Retention Policy
echo "Cleaning up old backups based on GFS retention policy..."

# Clean Daily backups - keep 30
echo "   Cleaning daily backups (keeping 30)..."
aws s3 ls \
  "s3://${BACKUP_S3_BUCKET}/mysql-backups/dailys/" \
  --recursive 2>/dev/null \
  | grep '\.sql\.gz$' \
  | sort -r \
  | awk 'NR>30 {print $4}' \
  | while read -r file; do
      echo "      Deleting: $file and its checksum"
      aws s3 rm "s3://${BACKUP_S3_BUCKET}/$file"
      aws s3 rm "s3://${BACKUP_S3_BUCKET}/${file}.sha256"
    done || true

# Clean Weekly backups - keep 12
echo "   Cleaning weekly backups (keeping 12)..."
aws s3 ls \
  "s3://${BACKUP_S3_BUCKET}/mysql-backups/weeklys/" \
  --recursive 2>/dev/null \
  | grep '\.sql\.gz$' \
  | sort -r \
  | awk 'NR>12 {print $4}' \
  | while read -r file; do
      echo "      Deleting: $file and its checksum"
      aws s3 rm "s3://${BACKUP_S3_BUCKET}/$file"
      aws s3 rm "s3://${BACKUP_S3_BUCKET}/${file}.sha256"
    done || true

# Clean Monthly backups - keep 12
echo "   Cleaning monthly backups (keeping 12)..."
aws s3 ls \
  "s3://${BACKUP_S3_BUCKET}/mysql-backups/monthlys/" \
  --recursive 2>/dev/null \
  | grep '\.sql\.gz$' \
  | sort -r \
  | awk 'NR>12 {print $4}' \
  | while read -r file; do
      echo "      Deleting: $file and its checksum"
      aws s3 rm "s3://${BACKUP_S3_BUCKET}/$file"
      aws s3 rm "s3://${BACKUP_S3_BUCKET}/${file}.sha256"
    done || true

echo "Retention policy applied successfully"

# Step 5: Generate Backup Report
REPORT_FILE="/tmp/backup-report.txt"
echo "Backup Report - $(date)" > "${REPORT_FILE}"
echo "========================" >> "${REPORT_FILE}"
echo "Backup Type: ${BACKUP_TYPE}" >> "${REPORT_FILE}"
echo "Backup Size: ${HUMAN_SIZE}" >> "${REPORT_FILE}"
echo "Checksum: $(cat "${TEMP_BACKUP_GZ}.sha256")" >> "${REPORT_FILE}"
echo "S3 Bucket: ${BACKUP_S3_BUCKET}" >> "${REPORT_FILE}"
echo "Status: success" >> "${REPORT_FILE}"

aws s3 cp "${REPORT_FILE}" \
  "s3://${BACKUP_S3_BUCKET}/reports/backup-$(date +%Y-%m-%d).txt" \
  --sse AES256 || true

# Step 6: Write latest backup status to local file
LOGS_DIR="${SCRIPT_DIR}/../logs"
mkdir -p "${LOGS_DIR}"
cat <<EOF > "${LOGS_DIR}/latest-backup.json"
{
  "timestamp": "$(date -Iseconds)",
  "status": "success",
  "type": "${BACKUP_TYPE}",
  "size": "${HUMAN_SIZE}"
}
EOF

SUCCESS=true
log_to_db "success"
echo "Local cleanup completed"
