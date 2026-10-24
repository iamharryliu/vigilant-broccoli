#!/bin/bash
# Greps the parts of the two inventories that can be checked mechanically and
# prints one candidate per line; the agentic inventory audit judges and fixes
# them. Reads names only: secret values are never fetched or printed.
#
#   MISSING_SECRET <name>   referenced by a workflow or Terraform, absent from the secret inventory
#   STALE_SECRET <name>     in the secret inventory, referenced nowhere else
#   STALE_VALUE <value>     base value in the fork identity inventory, found nowhere else
#   UNLISTED_VALUE <value>  identity-shaped value in code that the fork inventory never mentions
#
# Always exits 0; the last line is INVENTORY_DRIFT_CLEAN or INVENTORY_DRIFT_CANDIDATES=<n>.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

SECRET_DOC=docs/infrastructure/secret-management.md
FORK_DOC=docs/fork-identity-inventory.md
COUNT=0

report() {
  printf '%s %s\n' "$1" "$2"
  COUNT=$((COUNT + 1))
}

# Both docs quote the values they track, so they never count as a reference.
referenced_outside() {
  git grep -qF -e "$1" -- . ":(exclude)$SECRET_DOC" ":(exclude)$FORK_DOC" ':(exclude)*pnpm-lock.yaml'
}

section_rows() {
  awk -v heading="$2" '/^## /{in_section = ($0 == "## " heading)} in_section && /^\| /' "$1"
}

INVENTORY_NAMES=$(section_rows "$SECRET_DOC" "Secret Inventory" | awk -F'|' '{print $2}' | grep -oE '`[A-Z][A-Z0-9_]*\*?`' | tr -d '`' | sort -u || true)

REFERENCED_NAMES=$( {
  git grep -hoE 'kv/(data/)?[a-z-]+ [A-Z][A-Z0-9_]+ \|' -- .github | awk '{print $2}'
  git grep -hoE 'secret_id += +"[A-Z][A-Z0-9_]+"' -- 'infrastructure/terraform/*.tf' | grep -oE '[A-Z][A-Z0-9_]+'
} | sort -u || true)

while IFS= read -r name; do
  [ -n "$name" ] || continue
  covered=false
  while IFS= read -r entry; do
    case "$entry" in
      *'*') [[ "$name" == "${entry%\*}"* ]] && covered=true ;;
      *) [ "$name" = "$entry" ] && covered=true ;;
    esac
  done <<<"$INVENTORY_NAMES"
  # TEST_SECRET only backs the GCP Secret Manager smoke workflow.
  [ "$name" = TEST_SECRET ] && covered=true
  $covered || report MISSING_SECRET "$name"
done <<<"$REFERENCED_NAMES"

while IFS= read -r entry; do
  [ -n "$entry" ] || continue
  referenced_outside "${entry%\*}" || report STALE_SECRET "$entry"
done <<<"$INVENTORY_NAMES"

BASE_VALUES=$(section_rows "$FORK_DOC" "Base Values" | awk -F'|' 'NR > 2 {print $3}' | grep -oE '`[^`]+`' | tr -d '`' | sort -u || true)

while IFS= read -r value; do
  [ -n "$value" ] || continue
  referenced_outside "$value" || report STALE_VALUE "$value"
done <<<"$BASE_VALUES"

# Shapes of the account-scoped values the doc tracks; hostnames and app names are too free-form to grep.
IDENTITY_PATTERNS=(
  'team_[A-Za-z0-9]{20,}'
  'arn:aws:iam::[0-9]{12}'
  '[a-z0-9-]+\.ts\.net'
  '[a-z0-9]{20}\.supabase\.co'
  '[A-Za-z0-9._%+-]+@gmail\.com'
)

for pattern in "${IDENTITY_PATTERNS[@]}"; do
  while IFS= read -r value; do
    [ -n "$value" ] || continue
    key=$value
    # Tailnet hostnames are listed by their tailnet suffix, not each machine.
    [[ "$value" == *.ts.net ]] && key=$(printf '%s' "$value" | awk -F. '{print $(NF-1)"."$NF}')
    grep -qF -- "$key" "$FORK_DOC" || report UNLISTED_VALUE "$value"
  done < <(git grep -hoE "$pattern" -- . ":(exclude)docs" ':(exclude)notes' ':(exclude)history' ':(exclude)*pnpm-lock.yaml' ':(exclude)*.md' | sort -u || true)
done

if [ "$COUNT" -eq 0 ]; then
  echo "INVENTORY_DRIFT_CLEAN"
else
  echo "INVENTORY_DRIFT_CANDIDATES=$COUNT"
fi
