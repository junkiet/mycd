#!/bin/bash
set -e

SERVER="ecs-user@47.243.249.21"
REMOTE_DIR="/var/www/mycoindeck.com"

cd "$(cd "$(dirname "$0")" && pwd)"

echo "Building..."
rm -rf .next && npm run build

echo "Uploading to server..."
rsync -avz \
  --exclude node_modules \
  --exclude .git \
  --exclude .DS_Store \
  .next/ $SERVER:$REMOTE_DIR/.next/

rsync -avz public/ $SERVER:$REMOTE_DIR/public/
rsync -avz locales/ $SERVER:$REMOTE_DIR/locales/

# Preserve src/i18n directory structure
ssh $SERVER "mkdir -p $REMOTE_DIR/src/i18n"
rsync -avz src/i18n/ $SERVER:$REMOTE_DIR/src/i18n/

rsync -avz \
  package.json \
  package-lock.json \
  next.config.ts \
  $SERVER:$REMOTE_DIR/

echo "Installing dependencies on server..."
ssh $SERVER "cd $REMOTE_DIR && npm install --production"

echo "Restarting server..."
ssh $SERVER "cd $REMOTE_DIR && (pm2 restart mycoindeck 2>/dev/null || pm2 start npm --name mycoindeck -- start)"

echo "Done!"
ssh $SERVER "pm2 status mycoindeck"
