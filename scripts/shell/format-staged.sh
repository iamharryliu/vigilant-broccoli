#!/bin/bash
set -euo pipefail

# Prettier exits 2 on an explicitly passed symbolic link, and .prettierignore
# does not suppress it, so the tracked AGENTS.md adapters would fail
# the lint-staged hook on any commit that touches them. Formatting the
# CONTEXT.md they point at covers their content.
FILES=()
for file in "$@"; do
    [ -L "$file" ] || FILES+=("$file")
done

[ "${#FILES[@]}" -eq 0 ] && exit 0
npx prettier --write "${FILES[@]}"

# Prettier pads Markdown tables, but they are kept compact everywhere.
MARKDOWN=()
for file in "${FILES[@]}"; do
    [[ $file != *.md ]] || MARKDOWN+=("$file")
done
[ "${#MARKDOWN[@]}" -eq 0 ] || node "$(dirname "$0")/../node/md-table-compact.mjs" --write "${MARKDOWN[@]}"
