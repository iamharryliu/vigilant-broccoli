#!/bin/bash
set -euo pipefail

SCOPE=${1:?Usage: create-audit-runner.sh <SCOPE>}
MODEL=${SOLVE_MODEL:-sonnet}
REPO_DIR="$HOME/vigilant-broccoli"
META_FILE=/tmp/audit-meta.json
SLUG=$(echo "$SCOPE" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed 's/^-*//;s/-*$//' | cut -c1-40)
BRANCH="agent/audit-${SLUG:-note}-$(date +%s)"
PR_FOOTER='🤖 Generated with [Claude Code](https://claude.com/claude-code)'
FALLBACK_TRAILER='Co-authored-by: Claude <noreply@anthropic.com>'

cd "$REPO_DIR"

git checkout -b "$BRANCH"
BASE_SHA=$(git rev-parse HEAD)
rm -f "$META_FILE"

PROMPT=$(cat <<EOF
You are running non-interactively in a fresh clone of vigilant-broccoli, on a dedicated branch. Audit the codebase and write a concise findings note under docs/audit/ for the following scope:

$SCOPE

Rules:
- Read docs/audit/audit-template.md first and follow its template and rules EXACTLY: sections in order — # Audit title, a one-line blockquote restating the scope with today's date, ## Scope, ## Findings (a markdown table with columns # | Severity | Location | Finding | Remediation, severity one of Critical/High/Medium/Low/Info), ## Recommendations.
- Actually audit: grep the repo for the patterns in scope and inspect the matches. Every finding must cite a concrete path (e.g. path/to/file.ext:12) and a severity. Report only real issues you find — do not speculate. If nothing is found, say so explicitly (a clean audit is a valid result).
- Be brief. Favor the findings table and short sentences over prose. No filler, no preamble.
- Write the note to a NEW file docs/audit/<concise-kebab-slug>.md — pick a short descriptive slug from the scope. Do not modify any file outside docs/audit/ (in particular, do not fix the findings — the note is the deliverable).
- Do not run any git or gh commands and do not commit — branching, committing, pushing, and opening the PR are handled by the calling script.
- When finished, write $META_FILE containing only a JSON object with these string fields:
  - note_path: the repo-relative path of the note you created (e.g. docs/audit/loose-ip-addresses.md)
  - commit_message: capitalized, concise, focused on what was audited, ending with a period
  - co_authored_by: the Co-Authored-By trailer line specified by your environment for the model authoring the commit
  - pr_title: the pull request title
  - pr_summary: markdown bullet points for the PR "## Summary" section
  - pr_test_plan: markdown checklist for the PR "## Test plan" section
EOF
)

claude -p "$PROMPT" --dangerously-skip-permissions --model "$MODEL" \
  --disallowedTools "Bash(git commit:*)" "Bash(git push:*)" "Bash(git checkout:*)" "Bash(git switch:*)" "Bash(gh:*)"

git checkout "$BRANCH"
[ "$(git rev-parse HEAD)" = "$BASE_SHA" ] || git reset --soft "$BASE_SHA"

if [ -z "$(git status --porcelain -- docs/audit)" ]; then
  echo "ERROR: no audit note was written under docs/audit/." >&2
  exit 1
fi
if [ -n "$(git status --porcelain -- ':(exclude)docs/audit')" ]; then
  echo "ERROR: changes outside docs/audit/ were made; only docs/audit/ should change." >&2
  git status --porcelain >&2
  exit 1
fi

read_meta() { jq -r "$1 // empty" "$META_FILE" 2>/dev/null || true; }

NOTE_PATH=$(read_meta .note_path)
COMMIT_MESSAGE=$(read_meta .commit_message)
TRAILER=$(read_meta .co_authored_by)
PR_TITLE=$(read_meta .pr_title)
PR_SUMMARY=$(read_meta .pr_summary)
PR_TEST_PLAN=$(read_meta .pr_test_plan)

if [ -n "$COMMIT_MESSAGE" ]; then
  COMMIT_SUBJECT="docs(audit): ${COMMIT_MESSAGE}"
else
  COMMIT_SUBJECT="docs(audit): Add audit note for ${SCOPE}."
fi

echo "$TRAILER" | grep -Eqi '^co-authored-by: .+ <.+>$' || TRAILER="$FALLBACK_TRAILER"
[ -n "$PR_TITLE" ] || PR_TITLE="$COMMIT_SUBJECT"
[ -n "$PR_SUMMARY" ] || PR_SUMMARY="- Add audit note${NOTE_PATH:+ (${NOTE_PATH})} for: ${SCOPE}"
[ -n "$PR_TEST_PLAN" ] || PR_TEST_PLAN="- [ ] Findings reviewed for accuracy, severity, and actionable remediation"

bash "$REPO_DIR/infrastructure/agent-sandbox/run-pre-commit.sh"

git add docs/audit
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
