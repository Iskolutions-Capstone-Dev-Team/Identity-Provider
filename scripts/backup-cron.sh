#!/bin/bash
# backup-cron.sh: Wrapper script for running backups via cron

set -euo pipefail

# Get directory where this script resides
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Define log file path
LOG_DIR="${PROJECT_ROOT}/logs"
LOG_FILE="${LOG_DIR}/backup.log"

# Create log directory if it doesn't exist
mkdir -p "${LOG_DIR}"

# Redirect all stdout and stderr to the log file, and also to console
exec > >(tee -a "${LOG_FILE}") 2>&1

echo "=== Backup Run Started: $(date) ==="

# Load environment variables
ENV_FILE="${PROJECT_ROOT}/.env"

# Trim function to clean environment values
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
        # Strip enclosing quotes if any
        if [[ "$var_val" =~ ^\'.*\'$ ]] || \
           [[ "$var_val" =~ ^\".*\"$ ]]; then
          var_val="${var_val:1:-1}"
        fi
        export "${var_name}"="${var_val}"
      fi
    fi
  done < "${ENV_FILE}"
else
  echo "Warning: .env file not found at ${ENV_FILE}"
fi

# Run the backup script
BACKUP_SCRIPT="${SCRIPT_DIR}/mysql-backup-s3.sh"
if [ -f "${BACKUP_SCRIPT}" ]; then
  chmod +x "${BACKUP_SCRIPT}"
  rc=0
  "${BACKUP_SCRIPT}" || rc=$?
  if [ "$rc" -ne 0 ]; then
    echo "BACKUP FAILED!"
    echo "Please check the log output for details."
    echo "Escalate to Project Leader if not resolved within 4 hours."
    echo "=== Backup Run Failed (exit code ${rc}): $(date) ==="
    exit 255
  fi
else
  echo "Error: Backup script not found at ${BACKUP_SCRIPT}"
  exit 1
fi

echo "=== Backup Run Completed Successfully: $(date) ==="
