#!/usr/bin/env bash
set -euo pipefail

FRONTEND_URL="${1:-}"
ADMIN_FRONTEND_URL="${2:-}"
API_HEALTH_URL="${3:-}"

if [[ -n "$FRONTEND_URL" ]]; then
  bash .github/workflows/scripts/health-check.sh "$FRONTEND_URL" 180 5
fi

if [[ -n "$ADMIN_FRONTEND_URL" ]]; then
  bash .github/workflows/scripts/health-check.sh "$ADMIN_FRONTEND_URL" 180 5
fi

if [[ -n "$API_HEALTH_URL" ]]; then
  bash .github/workflows/scripts/health-check.sh "$API_HEALTH_URL" 180 5
fi

echo "Smoke tests passed"
