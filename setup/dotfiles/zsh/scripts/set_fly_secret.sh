#!/bin/bash

usage() {
    echo "Usage: $0 <key_name> <key_value> [app_name]"
    exit 1
}

if [ $# -lt 2 ]; then
    usage
fi

KEY_NAME="$1"
KEY_VALUE="$2"

if [ -n "$3" ]; then
    USE_APP="--app $3"
else
    USE_APP=""
fi

fly secrets set "${KEY_NAME}=${KEY_VALUE}" $USE_APP --stage
