#!/bin/bash
set -euo pipefail

# Runs Prettier over the files changed since a base ref, plus untracked files,
# without node_modules: agent sandboxes and the ci-pr-check format job have no
# workspace install, so the lint-staged hook cannot run there. Uses the
# lockfile's Prettier version so output matches the hook's.
#   $1 base ref (default HEAD)  $2 --check to fail when formatting changed anything
# Run from the repo root.
BASE=${1:-HEAD}
CHECK=0
[ "${2:-}" != --check ] || CHECK=1

# Mirrors the root lint-staged glob in package.json.
FORMAT_PATTERN='\.(js|jsx|ts|tsx|json|html|css|scss|md)$'

PRETTIER_VERSION=$(awk '/^  prettier@/ { sub(/^  prettier@/, ""); sub(/:.*/, ""); print; exit }' pnpm-lock.yaml)

# Prettier exits 2 on an explicitly passed symlink, as in format-staged.sh.
FILES=()
while IFS= read -r -d '' file; do
  if [ -f "$file" ] && [ ! -L "$file" ]; then FILES+=("$file"); fi
done < <(
  { git diff -z --name-only --diff-filter=ACMR "$BASE" --; git ls-files -z --others --exclude-standard; } |
    grep -zE "$FORMAT_PATTERN" || true
)

[ "${#FILES[@]}" -gt 0 ] || exit 0

if [ "$CHECK" = 0 ]; then
  exec npx --yes "prettier@$PRETTIER_VERSION" --write "${FILES[@]}"
fi

# Check mode formats in place and then restores every file, comparing against
# a copy taken first so uncommitted edits are never reported as formatting.
ORIGINALS=$(mktemp -d)
EXPECTED=$(mktemp -d)
trap 'rm -rf "$ORIGINALS" "$EXPECTED"' EXIT
for file in "${FILES[@]}"; do
  mkdir -p "$ORIGINALS/$(dirname "$file")"
  cp "$file" "$ORIGINALS/$file"
done

npx --yes "prettier@$PRETTIER_VERSION" --write "${FILES[@]}"
for file in "${FILES[@]}"; do
  mkdir -p "$EXPECTED/$(dirname "$file")"
  cp "$file" "$EXPECTED/$file"
  cp "$ORIGINALS/$file" "$file"
done

# Prettier pads Markdown tables but committed tables are compact (the mdtable
# filter), and a checkout with the filter has padded working files, so both
# sides are compacted before comparing. The compact hook is not reused: it
# leaves the working file alone wherever the filter is configured.
compact_markdown_tables() {
  node --input-type=module -e '
import { readFileSync, writeFileSync } from "node:fs";
import { compactMarkdownTables } from "./scripts/node/md-table-compact.mjs";
for (const file of process.argv.slice(1)) {
  writeFileSync(file, compactMarkdownTables(readFileSync(file, "utf8")));
}' "$@"
}
MARKDOWN=()
for file in "${FILES[@]}"; do
  [[ $file != *.md ]] || MARKDOWN+=("$ORIGINALS/$file" "$EXPECTED/$file")
done
[ "${#MARKDOWN[@]}" -eq 0 ] || compact_markdown_tables "${MARKDOWN[@]}"

git --no-pager diff --no-index -- "$ORIGINALS" "$EXPECTED" || {
  echo "ERROR: changed files are not Prettier-formatted; run \`bash scripts/shell/format-changed.sh origin/main\` and commit the result." >&2
  exit 1
}
