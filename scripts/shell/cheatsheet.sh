#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
sed -n '/^```$/,/^```$/p' "$SCRIPT_DIR/../../docs/cheatsheet.md" | sed '1d;$d'
