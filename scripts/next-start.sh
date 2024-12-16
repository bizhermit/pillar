#!/bin/bash

ENV_FILE=".env"
ENV_LOCAL_FILE=".env.local"

source "$ENV_FILE"

if [ -f "$ENV_LOCAL_FILE" ]; then
  source "$ENV_LOCAL_FILE"
fi

if [ -z "$FRONTEND_PORT" ]; then
  export FRONTEND_PORT=3000
fi

npm run clean && npm run build && npx next start -p $FRONTEND_PORT
