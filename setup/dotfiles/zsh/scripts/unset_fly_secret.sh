#!/bin/bash

usage() {
    echo "Usage: $0 '[secret_name] [secret_name]'..  [app_name](optional)"
    exit 1
}

if [ $# -lt 1 ]; then
    usage
fi

KEY_NAMES="$1"

fly secrets unset $KEY_NAMES --stage
