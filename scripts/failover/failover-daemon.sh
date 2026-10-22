#!/bin/bash
# failover-daemon.sh: Background daemon monitoring Primary server health
# Usage: ./failover-daemon.sh

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

LOCK_FILE="${FAILOVER_LOCK_FILE:-/var/run/failover_triggered.lock}"
CHECK_INTERVAL="${FAILOVER_CHECK_INTERVAL:-15}"
FAILURE_THRESHOLD="${FAILOVER_FAILURE_THRESHOLD:-3}"
PROBE_TIMEOUT="${FAILOVER_PROBE_TIMEOUT:-5}"

PRIMARY_IDP_URL="${PRIMARY_IDP_HEALTH_URL:-}"
PRIMARY_PORTAL_URL="${PRIMARY_PORTAL_HEALTH_URL:-}"
FALLBACK_IP_ADDR="${FALLBACK_IP:-}"
WEBHOOK_URL="${ALERT_WEBHOOK_URL:-}"

if [ -z "${PRIMARY_IDP_URL}" ] && [ -z "${PRIMARY_PORTAL_URL}" ]; then
  echo "Error: Neither PRIMARY_IDP_HEALTH_URL nor PRIMARY_PORTAL_HEALTH_URL is configured." >&2
  exit 1
fi

if [ -f "${LOCK_FILE}" ]; then
  echo "[Watcher] Failover lock file exists at ${LOCK_FILE}. Fallback is already active."
  echo "[Watcher] Remove ${LOCK_FILE} after manual recovery to resume monitoring."
  exit 0
fi

notify() {
  local message="$1"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ${message}"
  if [ -n "${WEBHOOK_URL}" ]; then
    curl -s -H "Content-Type: application/json" -X POST \
      -d "{\"content\":\"${message}\"}" "${WEBHOOK_URL}" || true
  fi
}

probe_endpoint() {
  local url="$1"
  if [ -z "${url}" ]; then
    return 0
  fi
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "${PROBE_TIMEOUT}" "${url}" || echo "000")
  if [ "${code}" = "200" ]; then
    return 0
  else
    echo "Probe failed for ${url} (HTTP ${code})" >&2
    return 1
  fi
}

echo "[Watcher] Starting monitoring of primary endpoints..."
echo "[Watcher] Primary IdP Health: ${PRIMARY_IDP_URL:-N/A}"
echo "[Watcher] Primary Portal Health: ${PRIMARY_PORTAL_URL:-N/A}"
echo "[Watcher] Interval: ${CHECK_INTERVAL}s, Threshold: ${FAILURE_THRESHOLD} consecutive failures"

CONSECUTIVE_FAILURES=0

while true; do
  idp_ok=true
  portal_ok=true

  if [ -n "${PRIMARY_IDP_URL}" ]; then
    if ! probe_endpoint "${PRIMARY_IDP_URL}"; then
      idp_ok=false
    fi
  fi

  if [ -n "${PRIMARY_PORTAL_URL}" ]; then
    if ! probe_endpoint "${PRIMARY_PORTAL_URL}"; then
      portal_ok=false
    fi
  fi

  if [ "${idp_ok}" = true ] && [ "${portal_ok}" = true ]; then
    if [ "${CONSECUTIVE_FAILURES}" -gt 0 ]; then
      notify "[INFO] Primary health restored after ${CONSECUTIVE_FAILURES} failed probe(s). Resetting counter."
      CONSECUTIVE_FAILURES=0
    fi
  else
    CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
    echo "[Watcher] Primary health check failed (${CONSECUTIVE_FAILURES}/${FAILURE_THRESHOLD})..."

    if [ "${CONSECUTIVE_FAILURES}" -ge "${FAILURE_THRESHOLD}" ]; then
      notify "[CRITICAL] Primary server sustained ${CONSECUTIVE_FAILURES} consecutive health check failures. Initiating automated failover to Fallback (${FALLBACK_IP_ADDR})."

      # Step 1: Promote local databases to Primary (read-write mode)
      if [ -x "${SCRIPT_DIR}/promote-to-primary.sh" ]; then
        echo "[Watcher] Running promote-to-primary.sh..."
        "${SCRIPT_DIR}/promote-to-primary.sh"
      else
        echo "[Watcher Error] promote-to-primary.sh not found or not executable!" >&2
      fi

      # Step 2: Switch DNS records via Spaceship API
      if [ -x "${SCRIPT_DIR}/spaceship-dns-switch.sh" ]; then
        echo "[Watcher] Running spaceship-dns-switch.sh..."
        "${SCRIPT_DIR}/spaceship-dns-switch.sh" "${FALLBACK_IP_ADDR}"
      else
        echo "[Watcher Error] spaceship-dns-switch.sh not found or not executable!" >&2
      fi

      # Step 3: Write lock file to enforce sticky failover
      mkdir -p "$(dirname "${LOCK_FILE}")"
      echo "Failover triggered at $(date '+%Y-%m-%d %H:%M:%S') by failover-daemon.sh" > "${LOCK_FILE}"

      notify "[INFO] FAILOVER COMPLETE: Fallback server is now active and Spaceship DNS records are pointed to ${FALLBACK_IP_ADDR}."
      exit 0
    fi
  fi

  sleep "${CHECK_INTERVAL}"
done
