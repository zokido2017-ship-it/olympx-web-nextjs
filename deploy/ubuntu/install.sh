#!/usr/bin/env bash
# Bootstrap Olympx (Next.js + Firebase auth) on Ubuntu 22.04 / 24.04 LTS.
#
# Usage (as a sudo-capable user):
#   git clone <this-repo> /opt/olympx && cd /opt/olympx
#   sudo DOMAIN=app.example.com bash deploy/ubuntu/install.sh
#
# Optional env:
#   APP_DIR   install path          (default: this repository root)
#   APP_USER  systemd user          (default: olympx)
#   DOMAIN    nginx server_name     (default: _)
#   APP_PORT  Next.js listen port   (default: 3000)
#   SKIP_BUILD=1   install packages and configs, skip npm build
#   SKIP_NGINX=1   skip nginx / certbot
#   SKIP_UFW=1     skip firewall rules
set -euo pipefail

if [[ ${EUID} -ne 0 ]]; then
  echo "Run this script with sudo (or as root)." >&2
  exit 1
fi

if [[ -f /etc/os-release ]]; then
  # shellcheck disable=SC1091
  . /etc/os-release
else
  echo "Cannot detect OS. This installer targets Ubuntu 22.04/24.04." >&2
  exit 1
fi

if [[ "${ID:-}" != "ubuntu" ]]; then
  echo "This installer is written for Ubuntu (detected: ${ID:-unknown})." >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

APP_DIR="${APP_DIR:-$REPO_ROOT}"
APP_USER="${APP_USER:-olympx}"
APP_GROUP="${APP_GROUP:-$APP_USER}"
APP_PORT="${APP_PORT:-3000}"
DOMAIN="${DOMAIN:-_}"
NODE_MAJOR="${NODE_MAJOR:-22}"

echo "==> Installing Olympx into ${APP_DIR}"
echo "    user=${APP_USER}  port=${APP_PORT}  domain=${DOMAIN}"

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y --no-install-recommends \
  ca-certificates curl git build-essential python3 \
  nginx ufw

if [[ "${SKIP_NGINX:-0}" != "1" ]]; then
  apt-get install -y --no-install-recommends certbot python3-certbot-nginx
fi

need_node=0
if [[ ! -x /usr/bin/node ]]; then
  need_node=1
else
  bin_major="$(/usr/bin/node -p "process.versions.node.split('.')[0]")"
  if [[ "${bin_major}" -lt 20 ]]; then
    need_node=1
  fi
fi

if [[ "${need_node}" -eq 1 ]]; then
  echo "==> Installing Node.js ${NODE_MAJOR}.x into /usr/bin (NodeSource)"
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi

/usr/bin/node -v
/usr/bin/npm -v

major="$(/usr/bin/node -p "process.versions.node.split('.')[0]")"
if [[ "${major}" -lt 20 ]]; then
  echo "Node.js 20+ is required (found $(/usr/bin/node -v))." >&2
  exit 1
fi

# Small VPS builds often OOM without swap.
mem_kb="$(awk '/MemTotal/ {print $2}' /proc/meminfo)"
if [[ "${mem_kb}" -lt 1800000 ]] && ! swapon --show | grep -q .; then
  echo "==> RAM is under 2 GiB; adding a 2 GiB swapfile for Next.js builds"
  if [[ ! -f /swapfile ]]; then
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
  fi
  swapon /swapfile || true
  if ! grep -q '^/swapfile ' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
fi

if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  echo "==> Creating system user ${APP_USER}"
  useradd --system --home-dir "${APP_DIR}" --shell /usr/sbin/nologin "${APP_USER}"
fi

mkdir -p "${APP_DIR}"
chown -R "${APP_USER}:${APP_GROUP}" "${APP_DIR}"

if [[ ! -f "${APP_DIR}/.env.production" ]]; then
  echo "==> Creating ${APP_DIR}/.env.production from .env.example"
  if [[ -f "${APP_DIR}/.env.example" ]]; then
    sudo -u "${APP_USER}" cp "${APP_DIR}/.env.example" "${APP_DIR}/.env.production"
  else
    echo "Missing .env.example in ${APP_DIR}" >&2
    exit 1
  fi
  echo
  echo "Edit Firebase keys before a production-ready build:"
  echo "  sudo -u ${APP_USER} nano ${APP_DIR}/.env.production"
  echo
fi

chmod 640 "${APP_DIR}/.env.production" || true
chown "${APP_USER}:${APP_GROUP}" "${APP_DIR}/.env.production"

chmod +x "${APP_DIR}/scripts/run-production.sh" "${APP_DIR}/deploy/ubuntu/install.sh" "${APP_DIR}/deploy/ubuntu/update.sh"

if [[ "${SKIP_BUILD:-0}" != "1" ]]; then
  echo "==> npm ci && npm run build (as ${APP_USER})"
  sudo -u "${APP_USER}" bash -c "cd '${APP_DIR}' && /usr/bin/npm ci && /usr/bin/npm run build"
fi

echo "==> Installing systemd unit"
unit_tmp="$(mktemp)"
sed \
  -e "s#/opt/olympx#${APP_DIR}#g" \
  -e "s#User=olympx#User=${APP_USER}#g" \
  -e "s#Group=olympx#Group=${APP_GROUP}#g" \
  -e "s#PORT=3000#PORT=${APP_PORT}#g" \
  "${SCRIPT_DIR}/olympx.service" > "${unit_tmp}"
install -m 0644 "${unit_tmp}" /etc/systemd/system/olympx.service
rm -f "${unit_tmp}"

systemctl daemon-reload
systemctl enable olympx.service
if [[ "${SKIP_BUILD:-0}" != "1" ]]; then
  systemctl restart olympx.service
fi

if [[ "${SKIP_NGINX:-0}" != "1" ]]; then
  echo "==> Configuring nginx"
  nginx_tmp="$(mktemp)"
  sed \
    -e "s#__SERVER_NAME__#${DOMAIN}#g" \
    -e "s#127.0.0.1:3000#127.0.0.1:${APP_PORT}#g" \
    "${SCRIPT_DIR}/nginx.conf" > "${nginx_tmp}"
  install -m 0644 "${nginx_tmp}" /etc/nginx/sites-available/olympx
  rm -f "${nginx_tmp}"
  ln -sfn /etc/nginx/sites-available/olympx /etc/nginx/sites-enabled/olympx
  if [[ -e /etc/nginx/sites-enabled/default ]]; then
    rm -f /etc/nginx/sites-enabled/default
  fi
  nginx -t
  systemctl enable --now nginx
  systemctl reload nginx
fi

if [[ "${SKIP_UFW:-0}" != "1" ]]; then
  echo "==> Configuring UFW (SSH + HTTP/HTTPS)"
  ufw allow OpenSSH
  ufw allow 'Nginx Full'
  ufw --force enable
fi

echo
echo "============================================================"
echo "Olympx is installed."
echo
echo "Service:  sudo systemctl status olympx"
echo "Logs:     sudo journalctl -u olympx -f"
echo "App dir:  ${APP_DIR}"
echo "Env file: ${APP_DIR}/.env.production"
echo
echo "1. Put Firebase web config in .env.production"
echo "   (Console → Project settings → Your apps → Web)."
echo "2. Rebuild so NEXT_PUBLIC_* values are baked in:"
echo "     sudo bash ${APP_DIR}/deploy/ubuntu/update.sh"
echo "3. Firebase Console → Authentication → Settings → Authorized domains"
echo "   add: ${DOMAIN}  (and your server hostname)."
echo "4. Point DNS A/AAAA records at this server, then:"
echo "     sudo certbot --nginx -d ${DOMAIN}"
echo "============================================================"
