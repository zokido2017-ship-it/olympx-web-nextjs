#!/usr/bin/env bash
# Pull, rebuild, and restart Olympx on Ubuntu.
#
# Usage:
#   sudo bash deploy/ubuntu/update.sh
#   sudo APP_DIR=/opt/olympx bash /opt/olympx/deploy/ubuntu/update.sh
set -euo pipefail

if [[ ${EUID} -ne 0 ]]; then
  echo "Run this script with sudo (or as root)." >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
APP_DIR="${APP_DIR:-$REPO_ROOT}"
APP_USER="${APP_USER:-olympx}"

if [[ ! -d "${APP_DIR}" ]]; then
  echo "APP_DIR does not exist: ${APP_DIR}" >&2
  exit 1
fi

echo "==> Updating ${APP_DIR}"

if [[ -d "${APP_DIR}/.git" ]]; then
  echo "==> git pull"
  sudo -u "${APP_USER}" git -C "${APP_DIR}" pull --ff-only
fi

if [[ ! -f "${APP_DIR}/.env.production" ]]; then
  echo "Missing ${APP_DIR}/.env.production — copy .env.example and fill Firebase keys." >&2
  exit 1
fi

echo "==> npm ci && npm run build"
sudo -u "${APP_USER}" bash -c "cd '${APP_DIR}' && /usr/bin/npm ci && /usr/bin/npm run build"

systemctl restart olympx.service
systemctl --no-pager --full status olympx.service || true

echo
echo "Updated. Tail logs with: sudo journalctl -u olympx -f"
