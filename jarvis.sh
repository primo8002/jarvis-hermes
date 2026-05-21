#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [ ! -d node_modules ]; then
  npm install
fi
npm run build >/dev/null
JARVIS_PERMISSION_MODE="${JARVIS_PERMISSION_MODE:-bypass}" NODE_ENV=production npm start
