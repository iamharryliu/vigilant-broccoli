#!/bin/bash
#
# Sends secret values to a remote command over stdin (base64-encoded, one per
# line) instead of interpolating them into `--command`/argv strings, so they
# never show up in `ps` or `/proc/*/cmdline` for the ssh/gcloud process on
# either end. The remote script references each secret as a plain shell
# variable ($NAME) — the decode happens before the script body runs.

_secrets_prelude() {
  while [ "$#" -ge 2 ]; do
    echo "IFS= read -r __b64_${1}"
    echo "export ${1}=\$(base64 -d <<<\"\$__b64_${1}\")"
    shift 2
  done
}

_secrets_payload() {
  while [ "$#" -ge 2 ]; do
    printf '%s' "$2" | base64 -w 0
    printf '\n'
    shift 2
  done
}

# gcloud_ssh_secrets VM ZONE SCRIPT [NAME VALUE]...
gcloud_ssh_secrets() {
  local vm="$1" zone="$2" script="$3"
  shift 3
  local prelude
  prelude="$(_secrets_prelude "$@")"
  _secrets_payload "$@" | gcloud compute ssh "$vm" \
    --zone="$zone" \
    --tunnel-through-iap \
    --command="$prelude
$script"
}

# ssh_secrets "SSH_OPTS" TARGET SCRIPT [NAME VALUE]...
ssh_secrets() {
  local ssh_opts="$1" target="$2" script="$3"
  shift 3
  local prelude
  prelude="$(_secrets_prelude "$@")"
  _secrets_payload "$@" | ssh $ssh_opts "$target" "$prelude
$script"
}
