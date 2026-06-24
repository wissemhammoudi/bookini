#!/usr/bin/env bash
set -euo pipefail

URL="${1:-}"
TIMEOUT_SECONDS="${2:-180}"
INTERVAL_SECONDS="${3:-5}"

if [[ -z "$URL" ]]; then
  echo "health-check.sh requires a URL argument"
  exit 1
fi

deadline=$((SECONDS + TIMEOUT_SECONDS))

while (( SECONDS < deadline )); do
  if curl -fsS "$URL" >/dev/null 2>&1; then
    echo "Health check passed: $URL"
    exit 0
  fi

  echo "Waiting for healthy endpoint: $URL"
  sleep "$INTERVAL_SECONDS"
done

echo "Health check failed after ${TIMEOUT_SECONDS}s: $URL"
exit 1
