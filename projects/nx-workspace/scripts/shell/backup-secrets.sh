#!/bin/bash
set -euo pipefail

source "$NX_DIR/.env"

TIMESTAMP=$(date -u +%Y-%m-%d)
FOLDER_NAME="vb-vault-secrets"
ITEM_NAME="vb-vault-secrets-$TIMESTAMP"

export BW_SESSION=$(bw unlock --passwordenv BW_PASSWORD --raw)
bw sync > /dev/null

# Fetch vault secrets directly to variable (no local file)
cd "$NX_DIR"
NOTES=$(npx tsx scripts/backup-vault-secrets.ts)

# Get or create folder
FOLDER_ID=$(bw list folders | jq -r ".[] | select(.name == \"$FOLDER_NAME\") | .id")
if [ -z "$FOLDER_ID" ]; then
  FOLDER_ID=$(jq -n --arg name "$FOLDER_NAME" '{name: $name}' | bw encode | bw create folder | jq -r '.id')
  echo "✓ Created Bitwarden folder: $FOLDER_NAME"
fi

# Create or update timestamped secure note in folder
BW_ITEMS=$(bw list items --search "$ITEM_NAME" --folderid "$FOLDER_ID" 2>/dev/null || echo "[]")
EXISTING_ID=$(echo "$BW_ITEMS" | jq -r ".[] | select(.name == \"$ITEM_NAME\") | .id")
if [ -n "$EXISTING_ID" ]; then
  bw get item "$EXISTING_ID" | jq --arg notes "$NOTES" '.notes = $notes' | bw encode | bw edit item "$EXISTING_ID" > /dev/null
  echo "✓ Updated Bitwarden secure note: $ITEM_NAME"
else
  ITEM_JSON=$(jq -n \
    --arg name "$ITEM_NAME" \
    --arg notes "$NOTES" \
    --arg folderId "$FOLDER_ID" \
    '{type: 2, secureNote: {type: 0}, name: $name, notes: $notes, folderId: $folderId}')
  echo "$ITEM_JSON" | bw encode | bw create item > /dev/null
  echo "✓ Created Bitwarden secure note: $ITEM_NAME"
fi

# Export Bitwarden vault (encrypted, now includes vault secrets)
bw export --password "$BW_PASSWORD" --format encrypted_json --output ~/resilio-sync/backup/bitwarden/bitwarden-backup-$TIMESTAMP.json
echo "✓ Bitwarden vault exported (encrypted)"
