#!/bin/bash

# Check if both arguments are provided
if [ $# -ne 2 ]; then
    echo "Usage: $0 <key_name> <key_value>"
    exit 1
fi

KEY_NAME="$1"
KEY_VALUE="$2"

# Set secret using fly command
fly secrets set "$KEY_NAME=\"$KEY_VALUE\"" --stage
