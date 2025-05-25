#!/bin/bash
set -e

if [[ -z "$SSH_KEY" || -z "$EC2_USER" || -z "$EC2_IP" || -z "$REMOTE_PATH" || -z "$REPO_URL" || -z "$APP_NAME" || -z "$NODE_ENV" || -z "$GIT_BRANCH" || -z "$NATS_SERVERS" || -z "$DATABASE_URL" ]]; then
  echo "Faltan variables de entorno necesarias."
  exit 1
fi

# Load utility functions to pass to the remote environment
source "$(dirname "$0")/deploy-utils.sh"

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_IP" "
  $(typeset -f install_node_and_pm2)
  $(typeset -f ensure_remote_path)
  install_node_and_pm2
  ensure_remote_path --path $REMOTE_PATH
  cd $REMOTE_PATH
  if [ ! -d .git ]; then
    git clone $REPO_URL .
    git checkout $GIT_BRANCH
  else
    git fetch
    git checkout $GIT_BRANCH
    git pull
  fi
  npm ci
  npm run docker:start
  npm run build
  echo \"NODE_ENV=$NODE_ENV\" > .env
  echo \"PORT=3006\" >> .env
  echo \"NATS_SERVERS=$NATS_SERVERS\" >> .env
  echo \"DATABASE_URL=$DATABASE_URL\" >> .env
  pm2 restart $APP_NAME || pm2 start dist/main.js --name $APP_NAME
"
