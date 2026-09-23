#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../config.sh"
source "${SCRIPT_DIR}/../../lib/ssh-secrets.sh"
source "${SCRIPT_DIR}/../../lib/oci-local-config.sh"

sync_oci_config_from_vault
