#!/bin/bash
set -euo pipefail

# Prettier exits 2 on an explicitly passed symbolic link, and .prettierignore
# does not suppress it, so the tracked CLAUDE.md/AGENTS.md adapters would fail
# the lint-staged hook on any commit that touches them. Formatting the
# CONTEXT.md they point at covers their content.
FILES=()
for file in "$@"; do
    [ -L "$file" ] || FILES+=("$file")
done

[ "${#FILES[@]}" -eq 0 ] || exec npx prettier --write "${FILES[@]}"
