#!/bin/bash
set -euo pipefail

GCLOUD_ACCOUNT="harryliu1995@gmail.com"
GCLOUD_PROJECT="vigilant-broccoli"

CURRENT_ACCOUNT=$(gcloud config get-value account 2>/dev/null)
if [ "$CURRENT_ACCOUNT" != "$GCLOUD_ACCOUNT" ]; then
  echo "Error: gcloud account is '$CURRENT_ACCOUNT', expected '$GCLOUD_ACCOUNT'. Run: gcp:login" >&2
  exit 1
fi

CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" != "$GCLOUD_PROJECT" ]; then
  echo "Error: gcloud project is '$CURRENT_PROJECT', expected '$GCLOUD_PROJECT'. Run: gcp:login" >&2
  exit 1
fi

ADC_FILE="$HOME/.config/gcloud/application_default_credentials.json"
if [ ! -f "$ADC_FILE" ] || ! grep -q '"authorized_user"' "$ADC_FILE" 2>/dev/null; then
  echo "Error: application-default credentials not configured. Run: gcp:login" >&2
  exit 1
fi

TIMESTAMP=$(date -u +%Y-%m-%d)
VAULT_FOLDER_NAME="vb-vault-secrets"

export BITWARDEN_PASSWORD=$(gcloud secrets versions access latest --secret="BITWARDEN_PASSWORD")
export BW_SESSION=$(bw unlock --passwordenv BITWARDEN_PASSWORD --raw)
bw sync > /dev/null

cd "$NX_DIR"
NOTES=$(NODE_EXTRA_CA_CERTS=./scripts/vault-ca.crt npx tsx scripts/backup-vault-secrets.ts)

MAX_NOTE_LENGTH=5000

upsert_bw_note() {
  local item_name="$1"
  local notes="$2"
  local folder_id="$3"

  local existing_id
  existing_id=$(bw list items --search "$item_name" --folderid "$folder_id" 2>/dev/null | jq -r ".[] | select(.name == \"$item_name\") | .id")

  if [ -n "$existing_id" ]; then
    bw get item "$existing_id" | jq --arg notes "$notes" '.notes = $notes' | bw encode | bw edit item "$existing_id" > /dev/null
    echo "✓ Updated Bitwarden secure note: $item_name"
  else
    jq -n \
      --arg name "$item_name" \
      --arg notes "$notes" \
      --arg folderId "$folder_id" \
      '{type: 2, secureNote: {type: 0}, name: $name, notes: $notes, folderId: $folderId}' | bw encode | bw create item > /dev/null
    echo "✓ Created Bitwarden secure note: $item_name"
  fi
}

get_or_create_folder() {
  local folder_name="$1"
  local folder_id
  folder_id=$(bw list folders | jq -r ".[] | select(.name == \"$folder_name\") | .id")
  if [ -z "$folder_id" ]; then
    folder_id=$(jq -n --arg name "$folder_name" '{name: $name}' | bw encode | bw create folder | jq -r '.id')
    echo "✓ Created Bitwarden folder: $folder_name" >&2
  fi
  echo "$folder_id"
}

upsert_chunked_note() {
  local base_name="$1"
  local contents="$2"
  local folder_id="$3"

  local total_length=${#contents}
  if [ "$total_length" -le "$MAX_NOTE_LENGTH" ]; then
    upsert_bw_note "$base_name-$TIMESTAMP" "$contents" "$folder_id"
  else
    local part=1
    local offset=0
    while [ "$offset" -lt "$total_length" ]; do
      local chunk="${contents:$offset:$MAX_NOTE_LENGTH}"
      upsert_bw_note "$base_name-$TIMESTAMP-part$part" "$chunk" "$folder_id"
      offset=$((offset + MAX_NOTE_LENGTH))
      part=$((part + 1))
    done
  fi
}

backup_csv_to_bitwarden() {
  local file="$1"
  local base_name="$2"

  if [ ! -f "$file" ]; then
    return
  fi

  local csv_contents
  csv_contents=$(cat "$file")

  local csv_folder_id
  csv_folder_id=$(get_or_create_folder "$base_name")

  upsert_chunked_note "$base_name" "$csv_contents" "$csv_folder_id"
}

VAULT_FOLDER_ID=$(get_or_create_folder "$VAULT_FOLDER_NAME")
upsert_chunked_note "$VAULT_FOLDER_NAME" "$NOTES" "$VAULT_FOLDER_ID"

backup_csv_to_bitwarden "$HOME/Desktop/Passwords.csv" "apple-passwords"
backup_csv_to_bitwarden "$HOME/Desktop/Chrome Passwords.csv" "chrome-passwords"

# Export Bitwarden vault (encrypted, now includes vault secrets)
BITWARDEN_BACKUP_DIR="$HOME/resilio-sync/backup/bitwarden"
bw export --password "$BITWARDEN_PASSWORD" --format encrypted_json --output "$BITWARDEN_BACKUP_DIR/bitwarden-backup-$TIMESTAMP.json"
echo "✓ Bitwarden vault exported (encrypted)"

ls -1t "$BITWARDEN_BACKUP_DIR"/bitwarden-backup-*.json | tail -n +6 | xargs rm -f --
