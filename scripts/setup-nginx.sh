#!/usr/bin/env bash
${TRACE:+set -x}
set -euo pipefail

# setup-nginx.sh
# Installs and configures Nginx as a reverse proxy for the knowledge-poc project.
# Safe to re-run; it validates and reloads only when needed.

# =============================
# Usage:
#   bash scripts/setup-nginx.sh               # basic install & configure
#   BASIC_AUTH_USER=user BASIC_AUTH_PASS=pass bash scripts/setup-nginx.sh  # with basic auth
#
# Env Vars (override defaults):
#   PROJECT_DIR      Path to project (default: $HOME/knowledge-poc)
#   SITE_NAME        Nginx site name (default: knowledge-poc)
#   NGINX_CONF_SRC   Source config file (default: $PROJECT_DIR/deploy/nginx.conf.example)
#   ENABLE_AUTH      If set to '1', require BASIC_AUTH_USER/PASS (default: auto when both provided)
# =============================

PROJECT_DIR="${PROJECT_DIR:-$HOME/knowledge-poc}"
SITE_NAME="${SITE_NAME:-knowledge-poc}"
NGINX_CONF_SRC="${NGINX_CONF_SRC:-$PROJECT_DIR/deploy/nginx.conf.example}"
TARGET_CONF="/etc/nginx/sites-available/${SITE_NAME}.conf"
LINK_CONF="/etc/nginx/sites-enabled/${SITE_NAME}.conf"
AUTH_FILE="/etc/nginx/.htpasswd-${SITE_NAME}"

echo "[INFO] Project dir: $PROJECT_DIR"
echo "[INFO] Site name: $SITE_NAME"
echo "[INFO] Nginx source config: $NGINX_CONF_SRC"

if [[ ! -f "$NGINX_CONF_SRC" ]]; then
  echo "[ERROR] Source Nginx config not found at $NGINX_CONF_SRC" >&2
  exit 1
fi

if ! command -v apt-get >/dev/null 2>&1; then
  echo "[ERROR] This script is intended for Debian/Ubuntu (apt-get not found)." >&2
  exit 1
fi

echo "[STEP] Installing Nginx and apache2-utils (for htpasswd)..."
sudo apt-get update -y
sudo apt-get install -y nginx apache2-utils

# Prepare config (ensure correct home path substitution if placeholder user path present)
TMP_CONF="/tmp/${SITE_NAME}.conf.tmp"
ROOT_PATH="/home/$(whoami)/knowledge-poc/frontend/dist"

# Replace any generic /home/<anything>/knowledge-poc path with actual user path
sed -E "s#/home/[^/]+/knowledge-poc/frontend/dist#${ROOT_PATH//#/\\/}#g" "$NGINX_CONF_SRC" > "$TMP_CONF"

ENABLE_AUTH_FLAG=0
if [[ "${ENABLE_AUTH:-}" == "1" ]]; then
  ENABLE_AUTH_FLAG=1
elif [[ -n "${BASIC_AUTH_USER:-}" && -n "${BASIC_AUTH_PASS:-}" ]]; then
  ENABLE_AUTH_FLAG=1
fi

if [[ $ENABLE_AUTH_FLAG -eq 1 ]]; then
  if [[ -z "${BASIC_AUTH_USER:-}" || -z "${BASIC_AUTH_PASS:-}" ]]; then
    echo "[ERROR] ENABLE_AUTH requested but BASIC_AUTH_USER/PASS not both set." >&2
    exit 1
  fi
  echo "[STEP] Creating basic auth credentials..."
  sudo htpasswd -b -c "$AUTH_FILE" "$BASIC_AUTH_USER" "$BASIC_AUTH_PASS"
  # Inject auth directives (uncomment lines beginning with '# auth-option:')
  sed -i "s|# auth-option:|auth_basic |g" "$TMP_CONF"
  sed -i "s|# auth-basic-user-file:|auth_basic_user_file ${AUTH_FILE};|g" "$TMP_CONF"
  echo "[INFO] Basic auth enabled (user: $BASIC_AUTH_USER)"
else
  echo "[INFO] Basic auth not enabled. Set BASIC_AUTH_USER & BASIC_AUTH_PASS to enable."
fi

echo "[STEP] Installing site config -> $TARGET_CONF"
sudo cp "$TMP_CONF" "$TARGET_CONF"
rm -f "$TMP_CONF"

echo "[STEP] Enabling site..."
sudo ln -sf "$TARGET_CONF" "$LINK_CONF"
if [[ -f /etc/nginx/sites-enabled/default ]]; then
  echo "[STEP] Removing default site";
  sudo rm -f /etc/nginx/sites-enabled/default
fi

echo "[STEP] Testing Nginx configuration syntax..."
sudo nginx -t

echo "[STEP] Reloading Nginx..."
sudo systemctl reload nginx || sudo systemctl restart nginx

echo "[INFO] Nginx status:"
sudo systemctl --no-pager status nginx | grep -E "Loaded:|Active:" || true

echo "[STEP] Quick verification (HTTP 200 expected for /)..."
if command -v curl >/dev/null 2>&1; then
  curl -I --max-time 5 http://localhost/ || echo "[WARN] Curl check failed; verify manually."
else
  echo "[INFO] curl not installed; skipping HTTP check."
fi

echo "[DONE] Nginx setup complete. If you enabled auth, test with: curl -u $BASIC_AUTH_USER:http://your_server_ip/"
echo "[NEXT] To enable HTTPS run: bash scripts/setup-ssl.sh (after setting DOMAIN env var)"
