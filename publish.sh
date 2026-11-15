#!/usr/bin/env bash
# Publica os arquivos deste diretório no repositório indicado. Requer Git autenticado.
set -euo pipefail
cd "$(dirname "$0")"
REMOTE_URL="https://github.com/andreaselias/minecraft-tier-by-tier.git"
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init -b main
fi
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi
git add -A
if ! git diff --cached --quiet; then
  git commit -m "feat: add Tier by Tier Bedrock progression web app"
fi
git push -u origin main
printf '\nEnviado! Ative Settings > Pages > Build and deployment > GitHub Actions.\n'
