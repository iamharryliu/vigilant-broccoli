#!/bin/bash
set -euo pipefail

SCOPE=${1:-}
MODEL=${SOLVE_MODEL:-sonnet}
REPO_DIR="$HOME/vigilant-broccoli"
META_FILE=/tmp/audit-todo-meta.json
BRANCH="agent/todo-audit-$(date +%s)"
PR_FOOTER='🤖 Generated with [Claude Code](https://claude.com/claude-code)'
FALLBACK_TRAILER='Co-authored-by: Claude <noreply@anthropic.com>'

cd "$REPO_DIR"

git checkout -b "$BRANCH"
BASE_SHA=$(git rev-parse HEAD)
rm -f "$META_FILE"

if [ -n "$SCOPE" ]; then
  SCOPE_RULE="- Audit ONLY the rows in these TODO.md sections: $SCOPE. Leave every other section byte-identical."
else
  SCOPE_RULE="- Audit every row in every section."
fi

PROMPT=$(cat <<EOF
You are running non-interactively in a fresh clone of vigilant-broccoli, on a dedicated branch. Audit the repo root TODO.md for entries that no longer match the codebase, and correct it in place.

Every row was accurate when written. The repo has moved since. Your job is to re-verify each row against the tree as it exists right now and bring the file back into agreement with reality.

$SCOPE_RULE

For each row, reach exactly one verdict, and gather the evidence BEFORE deciding:
1. RESOLVED — the condition the row describes no longer exists (the guard was added, the dependency dropped, the file deleted with nothing replacing it). Delete the whole row.
2. DRIFTED — the condition still exists, but the row misdescribes it: a moved or renamed file, a stale line number, a count that has changed, a claim whose scope is now narrower or wider than the row states. Rewrite only the inaccurate parts of the Description / Recommended Fix cells.
3. ACCURATE — still true as written. Leave the row byte-identical.

Verification rules — these decide the quality of the whole run:
- Never judge a row from its own wording. Open the files it cites and read the surrounding code.
- A file that is missing at the cited path is NOT evidence of RESOLVED. Search for it by basename and by symbol name first — most such rows are DRIFTED (the code moved), not resolved. Check "git log --oneline -5 -- <path>" to see whether it was deleted or relocated.
- Treat a path that is generated or gitignored as not a source of truth: check .gitignore and the build targets before citing one.
- Only mark RESOLVED when you have positively confirmed the fix exists — a guard you can read, a dependency absent from package.json, a setting changed. "I could not find the problem" is not confirmation.
- When a row bundles several claims and only some are now false, it is DRIFTED: narrow the row to the claims that still hold rather than deleting it.
- Line numbers cited as "path:12" must be re-checked and corrected even when the surrounding claim is accurate.

Editing rules:
- docs/todo-pattern.md is the source of truth for the file's structure, columns, priority values, row rules, and the machine-read id contract. Re-read it before editing and follow it exactly.
- NEVER change, reuse or renumber an existing 6-hex id. Ids are stable handles that "pnpm agentic:task:solve <id>" resolves; a changed id breaks it.
- Do not add new rows. Finding an unrelated new problem is out of scope for this audit — that is what /create-todo-task is for. Mention it in the PR summary instead.
- Do not change a row's Priority unless the row's own evidence changed (e.g. the blast radius is now provably smaller). Priority is the owner's call, not a tidying opportunity.
- Keep each row on one physical line, keep the id in the leading cell, write multi-step fixes with "<br>", and escape a literal pipe inside a cell.
- Preserve section order, the Table of Contents, and each section's priority ordering. If deleting rows empties a section, keep the section and its header.
- Do not touch any file besides TODO.md.
- Do not run any git or gh commands and do not commit — branching, committing, pushing, and opening the PR are handled by the calling script.

It is a perfectly good outcome to find nothing wrong. If every row is ACCURATE, make no edit to TODO.md at all and still write the meta file with empty resolved/drifted lists — the calling script will exit cleanly without opening a PR. Do not invent a change to justify the run.

When finished, write $META_FILE containing only a JSON object with these fields:
  - resolved: array of objects {id, reason} for rows you deleted, reason citing the evidence that the condition is gone
  - drifted: array of objects {id, change} for rows you rewrote, change naming what was wrong
  - accurate_count: number of rows you verified as still accurate
  - commit_message: capitalized, concise, focused on why the correction was needed, ending with a period
  - co_authored_by: the Co-Authored-By trailer line specified by your environment for the model authoring the commit
  - pr_title: the pull request title
  - pr_summary: markdown bullet points for the PR "## Summary" section, listing each resolved and drifted row by id with its evidence
  - pr_test_plan: markdown checklist for the PR "## Test plan" section
EOF
)

claude -p "$PROMPT" --dangerously-skip-permissions --model "$MODEL" \
  --disallowedTools "Bash(git commit:*)" "Bash(git push:*)" "Bash(git checkout:*)" "Bash(git switch:*)" "Bash(gh:*)"

git checkout "$BRANCH"
[ "$(git rev-parse HEAD)" = "$BASE_SHA" ] || git reset --soft "$BASE_SHA"

if [ -n "$(git status --porcelain -- ':(exclude)TODO.md')" ]; then
  echo "ERROR: changes outside TODO.md were made; only TODO.md should change." >&2
  git status --porcelain >&2
  exit 1
fi

# An audit that finds nothing is a success, not a no-op failure: exit before the
# PR machinery rather than opening an empty PR for the owner to close.
if [ -z "$(git status --porcelain -- TODO.md)" ]; then
  echo "AUDIT_CLEAN: every TODO.md row still matches the codebase — no PR opened."
  exit 0
fi

read_meta() { jq -r "$1 // empty" "$META_FILE" 2>/dev/null || true; }

COMMIT_MESSAGE=$(read_meta .commit_message)
TRAILER=$(read_meta .co_authored_by)
PR_TITLE=$(read_meta .pr_title)
PR_SUMMARY=$(read_meta .pr_summary)
PR_TEST_PLAN=$(read_meta .pr_test_plan)
RESOLVED_COUNT=$(read_meta '.resolved | length')
DRIFTED_COUNT=$(read_meta '.drifted | length')

# Every id present before the run must still be present unless the agent listed
# it as resolved: a row silently dropped by a bad table rewrite is invisible in
# review once the diff is large, and the id is the only handle solve-todo has.
mapfile -t BEFORE_IDS < <(git show "$BASE_SHA:TODO.md" | grep -oE '^\| [0-9a-f]{6} \|' | grep -oE '[0-9a-f]{6}' | sort)
mapfile -t AFTER_IDS < <(grep -oE '^\| [0-9a-f]{6} \|' TODO.md | grep -oE '[0-9a-f]{6}' | sort)
mapfile -t CLAIMED_IDS < <(jq -r '.resolved[]?.id // empty' "$META_FILE" 2>/dev/null | sort)
UNEXPLAINED=$(comm -23 <(comm -23 <(printf '%s\n' "${BEFORE_IDS[@]}") <(printf '%s\n' "${AFTER_IDS[@]}")) <(printf '%s\n' "${CLAIMED_IDS[@]}"))
if [ -n "$UNEXPLAINED" ]; then
  echo "ERROR: these TODO ids vanished without being reported as resolved:" >&2
  echo "$UNEXPLAINED" >&2
  exit 1
fi

NEW_IDS=$(comm -13 <(printf '%s\n' "${BEFORE_IDS[@]}") <(printf '%s\n' "${AFTER_IDS[@]}"))
if [ -n "$NEW_IDS" ]; then
  echo "ERROR: the audit added or renumbered TODO ids, which breaks the solve handle:" >&2
  echo "$NEW_IDS" >&2
  exit 1
fi

if [ -n "$COMMIT_MESSAGE" ]; then
  COMMIT_SUBJECT="docs: ${COMMIT_MESSAGE}"
else
  COMMIT_SUBJECT="docs: Realign TODO.md with the current codebase."
fi

echo "$TRAILER" | grep -Eqi '^co-authored-by: .+ <.+>$' || TRAILER="$FALLBACK_TRAILER"
[ -n "$PR_TITLE" ] || PR_TITLE="$COMMIT_SUBJECT"
[ -n "$PR_SUMMARY" ] || PR_SUMMARY="- Removed ${RESOLVED_COUNT:-0} resolved and corrected ${DRIFTED_COUNT:-0} drifted TODO.md rows."
[ -n "$PR_TEST_PLAN" ] || PR_TEST_PLAN="- [ ] Each removed row confirmed genuinely resolved against the cited files"

bash "$REPO_DIR/infrastructure/agent-sandbox/run-pre-commit.sh"

git add TODO.md
git commit -m "$COMMIT_SUBJECT" -m "$TRAILER"
git push -u origin "$BRANCH"

PR_BODY=$(cat <<EOF
## Summary

$PR_SUMMARY

## Test plan

$PR_TEST_PLAN

$PR_FOOTER
EOF
)

gh pr create --title "$PR_TITLE" --body "$PR_BODY"
