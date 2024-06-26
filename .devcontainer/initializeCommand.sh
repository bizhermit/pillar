#!/bin/bash

CONT_ENV_FILE=".devcontainer/.env"

ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
  source "$ENV_FILE"
fi

ENV_LOCAL_FILE=".env.local"
if [ -f "$ENV_LOCAL_FILE" ]; then
  {
    echo "# generated by \".devcontainer/initializeCommand.sh\""
    echo "# do not edit"
    echo
    cat "$ENV_FILE"
    echo
    cat "$ENV_LOCAL_FILE"
    echo
  } > "$CONT_ENV_FILE"
else
  {
    echo "# generated by \".devcontainer/initializeCommand.sh\""
    echo "# do not edit"
    echo
    cat "$ENV_FILE"
    echo
  } > "$CONT_ENV_FILE"
fi
