#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# DigitalOcean Droplet Initialization Script
# Usage (run on a fresh droplet after copying this file or via curl):
#   bash droplet-init.sh <GITHUB_REPO_URL> <CLONE_DIR> <OPENAI_KEY>
# Example:
#   bash droplet-init.sh https://github.com/gatteoelmo/knowledge-poc.git /var/www/knowledge-poc sk-xxxx
# ============================================================================

if [ $# -lt 3 ]; then
  echo "Usage: $0 <GITHUB_REPO_URL> <TARGET_DIR> <OPENAI_API_KEY>"
  exit 1
fi

REPO_URL="$1"
TARGET_DIR="$2"
OPENAI_API_KEY="$3"
NODE_VERSION="20"  # LTS

echo "🚀 Starting droplet initialization for repo: $REPO_URL"

# --- Update system ---
echo "📦 Updating system packages..."
apt-get update -y && apt-get upgrade -y

# --- Install basic tools ---
echo "📦 Installing base utilities..."
apt-get install -y curl git ufw python3 python3-pip unzip

# --- Install Node.js ---
echo "📦 Installing Node.js v$NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | bash -
apt-get install -y nodejs build-essential

echo "✅ Node: $(node -v) | NPM: $(npm -v)"

# --- Install PM2 ---
echo "📦 Installing PM2 process manager..."
npm install -g pm2

# --- Install Ollama ---
echo "📦 Installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh || echo "⚠️ Ollama install script exited with non-zero status; continuing"

# Pull embedding model
echo "📦 Pulling embedding model (nomic-embed-text)..."
ollama pull nomic-embed-text || echo "⚠️ Ollama model pull failed; ensure ollama service running"

# --- Clone repository ---
echo "📁 Cloning repository into $TARGET_DIR ..."
mkdir -p "$TARGET_DIR"
if [ -d "$TARGET_DIR/.git" ]; then
  echo "ℹ️ Target directory already has a git repo; skipping clone"
else
  git clone "$REPO_URL" "$TARGET_DIR"
fi

cd "$TARGET_DIR"

echo "🔐 Setting up environment file (.env)..."
if [ ! -f .env ]; then
  if [ -f .env.production.example ]; then
    cp .env.production.example .env
  else
    touch .env
  fi
  sed -i "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$OPENAI_API_KEY|" .env || echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> .env
fi

# --- Install backend dependencies ---
echo "📦 Installing backend dependencies..."
npm install --production

# --- Install frontend dependencies & build ---
if [ -d frontend ]; then
  echo "📦 Installing frontend dependencies..."
  pushd frontend
  npm install --production
  echo "🛠 Building frontend..."
  if npm run build 2>/dev/null; then
    echo "✅ Frontend build complete"
  else
    echo "⚠️ Frontend build script not found; using dev server under PM2"
  fi
  popd
else
  echo "⚠️ No frontend directory found; skipping"
fi

# --- Generate vectorstore (documents) ---
if [ -d data/source ]; then
  echo "📚 Generating vectorstore from documents..."
  npm run setup || echo "⚠️ Setup script failed; check dependencies or document formats"
else
  echo "ℹ️ data/source directory not present; skipping document processing"
fi

# --- Firewall configuration ---
echo "🔒 Configuring UFW firewall..."
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3001/tcp
ufw allow 5173/tcp
ufw --force enable

echo "✅ Firewall rules applied"

# --- Nginx optional setup ---
if ! command -v nginx >/dev/null 2>&1; then
  echo "📦 Installing Nginx (optional reverse proxy)..."
  apt-get install -y nginx
fi

# Provide nginx example if not present
if [ ! -d deploy ]; then
  mkdir deploy
fi
if [ ! -f deploy/nginx.conf.example ]; then
  cat > deploy/nginx.conf.example <<'NGINX'
server {
    listen 80;
    server_name _;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /health {
        proxy_pass http://localhost:3001/health;
    }

    location / {
        root /var/www/knowledge-poc/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
NGINX
fi

echo "🗂 Creating logs directory..."
mkdir -p logs

# --- Start processes with PM2 ---
echo "🚀 Starting processes with PM2..."
if [ -f ecosystem.config.cjs ]; then
  pm2 start ecosystem.config.cjs || echo "⚠️ PM2 start failed; falling back to manual start"
else
  echo "⚠️ ecosystem.config.cjs not found; starting backend manually"
  pm2 start server/index.js --name knowledge-backend
  if [ -d frontend/dist ]; then
    pm2 serve frontend/dist 5173 --name knowledge-frontend
  fi
fi

pm2 save
pm2 startup | tail -n 1 | bash || echo "⚠️ pm2 startup command failed"

echo "✅ Initialization complete"
echo "Health check: curl http://$(curl -s ifconfig.me)/health"
echo "Frontend:    http://$(curl -s ifconfig.me)"
echo "API:         http://$(curl -s ifconfig.me)/api"
