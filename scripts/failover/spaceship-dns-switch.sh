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

echo "[Spaceship DNS] Updating records for ${FAILOVER_DOMAIN} -> ${TARGET_IP}..."

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

API_URL="https://api.spaceship.com/v1/dns/records/${FAILOVER_DOMAIN}"

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
