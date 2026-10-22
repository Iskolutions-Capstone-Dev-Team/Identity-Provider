#!/bin/bash
# spaceship-dns-switch.sh: Update domain A-records via Spaceship REST API
# Usage: ./spaceship-dns-switch.sh [TARGET_IP]

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

# Validation of required variables
: "${SPACESHIP_API_KEY:?Error: SPACESHIP_API_KEY is not set}"
: "${SPACESHIP_API_SECRET:?Error: SPACESHIP_API_SECRET is not set}"
: "${FAILOVER_DOMAIN:?Error: FAILOVER_DOMAIN is not set in .env}"

TARGET_IP="${1:-${FALLBACK_IP:-}}"
if [ -z "${TARGET_IP}" ]; then
  echo "Error: Target IP not specified and FALLBACK_IP is not set." >&2
  exit 1
fi

IDP_SUBDOMAIN="${IDP_SUBDOMAIN:-@}"
PORTAL_SUBDOMAIN="${PORTAL_SUBDOMAIN:-portal}"
DNS_TTL="${DNS_TTL:-60}"
MANAGE_PORTAL_DNS="${MANAGE_PORTAL_DNS:-false}"

API_URL="https://spaceship.dev/api/v1/dns/records/${FAILOVER_DOMAIN}"

# -------------------------------------------------------------
# 1. Clean up stale A-records to prevent multi-record duplication
# -------------------------------------------------------------
PYTHON_BIN=""
if python3 -c 'exit(0)' 2>/dev/null; then
  PYTHON_BIN="python3"
elif py -c 'exit(0)' 2>/dev/null; then
  PYTHON_BIN="py"
elif python -c 'exit(0)' 2>/dev/null; then
  PYTHON_BIN="python"
fi

if [ -n "${PYTHON_BIN}" ]; then
  echo "[Spaceship DNS] Querying existing records to remove stale A-records..."
  CURRENT_RESP=$(curl -s -w "\n%{http_code}" -X GET "${API_URL}?take=100&skip=0" \
    -H "X-API-Key: ${SPACESHIP_API_KEY}" \
    -H "X-API-Secret: ${SPACESHIP_API_SECRET}")

  GET_CODE=$(echo "${CURRENT_RESP}" | tail -n1)
  GET_BODY=$(echo "${CURRENT_RESP}" | sed '$d')

  if [ "${GET_CODE}" -ge 200 ] && [ "${GET_CODE}" -lt 300 ]; then
    DELETE_PAYLOAD=$("${PYTHON_BIN}" -c '
import sys, json

try:
    data = json.loads(sys.argv[1])
    target = sys.argv[2]
    manage_portal = sys.argv[3].lower() == "true"
    idp_sub = sys.argv[4]
    portal_sub = sys.argv[5]

    managed = [idp_sub]
    if manage_portal:
        managed.append(portal_sub)

    stale = []
    for item in data.get("items", []):
        if item.get("type") == "A" and item.get("name") in managed:
            if item.get("address") != target:
                stale.append({
                    "type": "A",
                    "name": item.get("name"),
                    "address": item.get("address")
                })
    print(json.dumps(stale))
except Exception as e:
    sys.stderr.write(f"Error parsing records: {e}\n")
    print("[]")
' "${GET_BODY}" "${TARGET_IP}" "${MANAGE_PORTAL_DNS}" "${IDP_SUBDOMAIN}" "${PORTAL_SUBDOMAIN}")

    STALE_COUNT=$("${PYTHON_BIN}" -c 'import sys, json; print(len(json.loads(sys.argv[1])))' "${DELETE_PAYLOAD}" 2>/dev/null || echo "0")

    if [ "${STALE_COUNT}" -gt 0 ]; then
      echo "[Spaceship DNS] Found ${STALE_COUNT} stale record(s) to delete: ${DELETE_PAYLOAD}"
      DEL_RESP=$(curl -s -w "\n%{http_code}" -X DELETE "${API_URL}" \
        -H "X-API-Key: ${SPACESHIP_API_KEY}" \
        -H "X-API-Secret: ${SPACESHIP_API_SECRET}" \
        -H "Content-Type: application/json" \
        -d "${DELETE_PAYLOAD}")
      DEL_CODE=$(echo "${DEL_RESP}" | tail -n1)
      if [ "${DEL_CODE}" -ge 200 ] && [ "${DEL_CODE}" -lt 300 ]; then
        echo "[Spaceship DNS] Successfully deleted stale record(s) (HTTP ${DEL_CODE})"
      else
        echo "[Spaceship DNS Warning] Stale record deletion returned HTTP ${DEL_CODE}; continuing with update..." >&2
      fi
    else
      echo "[Spaceship DNS] No stale records found for managed subdomain(s)."
    fi
  else
    echo "[Spaceship DNS Warning] Failed to fetch current records (HTTP ${GET_CODE}); proceeding directly to update..." >&2
  fi
else
  echo "[Spaceship DNS Warning] Python not found; skipping stale record cleanup..." >&2
fi

# -------------------------------------------------------------
# 2. Add / Update target IP record
# -------------------------------------------------------------
echo "[Spaceship DNS] Updating records for ${FAILOVER_DOMAIN} -> ${TARGET_IP}..."

if [ "${MANAGE_PORTAL_DNS}" = "true" ]; then
  PAYLOAD=$(cat <<EOF
{
  "items": [
    {
      "type": "A",
      "name": "${IDP_SUBDOMAIN}",
      "address": "${TARGET_IP}",
      "ttl": ${DNS_TTL}
    },
    {
      "type": "A",
      "name": "${PORTAL_SUBDOMAIN}",
      "address": "${TARGET_IP}",
      "ttl": ${DNS_TTL}
    }
  ]
}
EOF
)
else
  PAYLOAD=$(cat <<EOF
{
  "items": [
    {
      "type": "A",
      "name": "${IDP_SUBDOMAIN}",
      "address": "${TARGET_IP}",
      "ttl": ${DNS_TTL}
    }
  ]
}
EOF
)
fi

RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "${API_URL}" \
  -H "X-API-Key: ${SPACESHIP_API_KEY}" \
  -H "X-API-Secret: ${SPACESHIP_API_SECRET}" \
  -H "Content-Type: application/json" \
  -d "${PAYLOAD}")

HTTP_CODE=$(echo "${RESPONSE}" | tail -n1)
BODY=$(echo "${RESPONSE}" | sed '$d')

if [ "${HTTP_CODE}" -ge 200 ] && [ "${HTTP_CODE}" -lt 300 ]; then
  echo "[Spaceship DNS] Successfully updated A-records to ${TARGET_IP} (HTTP ${HTTP_CODE})"
else
  echo "[Spaceship DNS] Failed to update DNS (HTTP ${HTTP_CODE}): ${BODY}" >&2
  exit 1
fi
