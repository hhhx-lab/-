#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REMOTE="${KULI_REMOTE:-kuly}"
REMOTE_APP_DIR="${KULI_REMOTE_APP_DIR:-/opt/kuly/app}"
SITE_URL="${KULI_SITE_URL:-https://kuly.com.cn}"

echo "==> Deploying Kuli to ${REMOTE}:${REMOTE_APP_DIR}"
echo "==> Site URL: ${SITE_URL}"

rsync -az --delete \
  --exclude='.git/' \
  --exclude='.codex/' \
  --exclude='.DS_Store' \
  --exclude='node_modules/' \
  --exclude='apps/api/.venv/' \
  --exclude='apps/api/data/' \
  --exclude='apps/api/__pycache__/' \
  --exclude='scripts/__pycache__/' \
  --exclude='.env' \
  --exclude='apps/api/.env' \
  --exclude='apps/web/.env' \
  "${ROOT_DIR}/" "${REMOTE}:${REMOTE_APP_DIR}/"

ssh "${REMOTE}" \
  "KULI_APP_DIR='${REMOTE_APP_DIR}' KULI_SITE_URL='${SITE_URL}' bash -s" <<'REMOTE_SCRIPT'
set -euo pipefail

cd "${KULI_APP_DIR}"
export PATH="${HOME}/.local/bin:${PATH}"
export UV_DEFAULT_INDEX="${UV_DEFAULT_INDEX:-https://mirrors.cloud.tencent.com/pypi/simple}"
export UV_HTTP_TIMEOUT="${UV_HTTP_TIMEOUT:-120}"

if [ ! -f .env ]; then
  echo "ERROR: ${KULI_APP_DIR}/.env does not exist. Refusing to deploy without server env." >&2
  exit 1
fi

echo "==> Backup database and uploads"
if command -v /usr/local/bin/kuly-backup >/dev/null 2>&1; then
  /usr/local/bin/kuly-backup
else
  echo "WARN: /usr/local/bin/kuly-backup not found; skipping backup"
fi

echo "==> Install Node dependencies"
npm ci

echo "==> Install Python dependencies"
uv sync --project apps/api --no-dev

echo "==> Load server env"
set -a
. ./.env
set +a

echo "==> Build Nuxt web"
npm run build

echo "==> Run database migrations"
npm run db:migrate

echo "==> Rebuild knowledge index"
PYTHONPATH=apps/api uv run --project apps/api python scripts/index_knowledge.py

echo "==> Restart services"
sudo systemctl restart kuly-api kuly-worker kuly-web
sleep 3
systemctl is-active kuly-api kuly-worker kuly-web nginx postgresql redis-server

echo "==> Verify local API"
curl -fsS http://127.0.0.1:8000/api/health >/dev/null

echo "==> Verify public API"
curl -fsS "${KULI_SITE_URL}/api/health" >/dev/null

echo "==> Deploy finished"
REMOTE_SCRIPT

echo "==> Done: ${SITE_URL}"
