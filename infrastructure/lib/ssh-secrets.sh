#!/bin/bash
#
# Sends secret values to a remote command over stdin (base64-encoded, one per
# line) instead of interpolating them into `--command`/argv strings, so they
# never show up in `ps` or `/proc/*/cmdline` for the ssh/gcloud process on
# either end. The remote script references each secret as a plain shell
# variable ($NAME) — the decode happens before the script body runs. If the
# stdin channel doesn't deliver (e.g. a tunneled ssh session not forwarding
# it), each read/decode aborts the remote script immediately instead of
# falling through with $NAME exported as an empty string — a blank secret
# must never reach a `vault kv patch`/`put` call downstream.

_secrets_prelude() {
  while [ "$#" -ge 2 ]; do
    echo "IFS= read -r __b64_${1} || { echo 'ssh-secrets: stdin closed early reading ${1} (secret transport failed)' >&2; exit 1; }"
    echo "export ${1}=\$(base64 -d <<<\"\$__b64_${1}\")"
    echo "[ -n \"\$${1}\" ] || { echo 'ssh-secrets: ${1} decoded empty, aborting rather than continuing with a blank secret' >&2; exit 1; }"
    shift 2
  done
}

_secrets_payload() {
  while [ "$#" -ge 2 ]; do
    # `tr -d '\n'` guards against BSD/macOS base64, which (unlike GNU) always
    # appends its own trailing newline regardless of -w — without stripping
    # it, the extra blank line desyncs every read after the first, silently
    # shifting each subsequent secret onto the wrong $NAME (or empty).
    printf '%s' "$2" | base64 -w 0 | tr -d '\n'
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
