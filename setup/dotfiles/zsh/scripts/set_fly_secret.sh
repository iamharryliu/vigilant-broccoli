#!/bin/bash

usage() {
    echo "Usage: $0 '[secret_name]=[value] [secret_name]=[value]..' [app_name](optional)"
    exit 1
}

if [ $# -lt 1 ]; then
    usage
fi

KVP="$1"

if [ -n "$2" ]; then
    USE_APP="--app $2"
else
    USE_APP=""
fi

fly secrets set $KVP $USE_APP --stage
