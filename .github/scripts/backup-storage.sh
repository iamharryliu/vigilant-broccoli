#!/usr/bin/env bash
# Mirrors every nightly backup into GCS and Cloudflare R2 so one provider's
# account, billing or outage problem never loses every copy at once.
#
#   backup-storage.sh upload <file> <prefix> <suffix>     both providers, then prune each to BACKUP_KEEP
#   backup-storage.sh latest <gcs|r2> <prefix> <suffix>   print the newest object name
#   backup-storage.sh download <gcs|r2> <prefix> <suffix> <dest>
#
# Object names are <prefix><YYYY-MM-DD><suffix>; the date stamp is what
# freshness checks and lexical "newest" ordering rely on.
#
# R2 needs CLOUDFLARE_ACCOUNT_ID, BACKUP_R2_ACCESS_KEY_ID and
# BACKUP_R2_SECRET_ACCESS_KEY (Vault kv/data/secrets); GCS needs an
# authenticated gcloud.
set -uo pipefail

BUCKET=vigilant-broccoli-backup
BACKUP_KEEP=${BACKUP_KEEP:-7}

r2() {
  if [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ] || [ -z "${BACKUP_R2_ACCESS_KEY_ID:-}" ] || [ -z "${BACKUP_R2_SECRET_ACCESS_KEY:-}" ]; then
    echo "::error::R2 backup credentials missing; check the Vault import step and that pnpm tf:post-apply synced BACKUP_R2_*" >&2
    return 1
  fi
  AWS_ACCESS_KEY_ID="$BACKUP_R2_ACCESS_KEY_ID" \
    AWS_SECRET_ACCESS_KEY="$BACKUP_R2_SECRET_ACCESS_KEY" \
    AWS_DEFAULT_REGION=auto \
    AWS_REQUEST_CHECKSUM_CALCULATION=when_required \
    AWS_RESPONSE_CHECKSUM_VALIDATION=when_required \
    aws --endpoint-url "https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com" "$@"
}

# Sorted object names (no bucket or scheme) matching <prefix><date><suffix>.
list() {
  local provider=$1 prefix=$2 suffix=$3 names
  case "$provider" in
    gcs) names=$(gcloud storage ls "gs://${BUCKET}/${prefix}*${suffix}" 2> /dev/null | sed "s|^gs://${BUCKET}/||") ;;
    r2) names=$(r2 s3api list-objects-v2 --bucket "$BUCKET" --prefix "$prefix" --query 'Contents[].Key' --output text | tr '\t' '\n') || return 1 ;;
    *)
      echo "::error::unknown backup provider: $provider" >&2
      return 1
      ;;
  esac
  printf '%s\n' "$names" | grep -E "^${prefix}[0-9]{4}-[0-9]{2}-[0-9]{2}${suffix//./\\.}$" | sort || true
}

latest() {
  local name
  name=$(list "$@" | tail -1) || return 1
  [ -n "$name" ] || {
    echo "::error::no $2*$3 backup in $1" >&2
    return 1
  }
  echo "$name"
}

download() {
  local provider=$1 prefix=$2 suffix=$3 dest=$4 name
  name=$(latest "$provider" "$prefix" "$suffix") || return 1
  echo "Restoring ${provider}:${BUCKET}/${name}"
  case "$provider" in
    gcs) gcloud storage cp "gs://${BUCKET}/${name}" "$dest" ;;
    r2) r2 s3 cp --no-progress "s3://${BUCKET}/${name}" "$dest" ;;
  esac
}

put() {
  local provider=$1 file=$2 name=$3
  case "$provider" in
    gcs) gcloud storage cp "$file" "gs://${BUCKET}/${name}" ;;
    r2) r2 s3 cp --no-progress "$file" "s3://${BUCKET}/${name}" ;;
  esac
}

remove() {
  local provider=$1 name=$2
  case "$provider" in
    gcs) gcloud storage rm "gs://${BUCKET}/${name}" ;;
    r2) r2 s3 rm "s3://${BUCKET}/${name}" ;;
  esac
}

prune() {
  local provider=$1 prefix=$2 suffix=$3 names count name
  names=$(list "$provider" "$prefix" "$suffix") || return 1
  count=$(printf '%s\n' "$names" | grep -c . || true)
  [ "$count" -gt "$BACKUP_KEEP" ] || return 0
  for name in $(printf '%s\n' "$names" | head -n "$((count - BACKUP_KEEP))"); do
    remove "$provider" "$name" || return 1
  done
}

# Each provider runs to completion even when the other fails; the job still
# fails afterwards so a one-sided outage is never silent.
upload() {
  local file=$1 prefix=$2 suffix=$3 name provider status=0
  name="${prefix}$(date -u +%Y-%m-%d)${suffix}"
  for provider in gcs r2; do
    if put "$provider" "$file" "$name" && prune "$provider" "$prefix" "$suffix"; then
      echo "Uploaded ${provider}:${BUCKET}/${name} (keeping last ${BACKUP_KEEP})"
    else
      echo "::error::${provider} backup of ${name} failed"
      status=1
    fi
  done
  return $status
}

command=${1:-}
shift || true
case "$command" in
  upload | latest | download) "$command" "$@" ;;
  *)
    echo "usage: $0 upload|latest|download ..." >&2
    exit 2
    ;;
esac
