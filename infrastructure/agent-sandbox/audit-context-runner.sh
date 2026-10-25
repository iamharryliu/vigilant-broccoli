#!/bin/bash
set -euo pipefail

if [ $# -gt 0 ]; then
  echo "Usage: audit-context-runner.sh" >&2
  exit 1
fi

MODEL=${SOLVE_MODEL:-opus}
REPO_DIR="$HOME/vigilant-broccoli"
META_FILE=/tmp/audit-context-meta.json
BRANCH="agent/audit-context-$(date +%s)"
MAX_CHANGED_FILES=15
PR_FOOTER='🤖 Generated with [Claude Code](https://claude.com/claude-code)'
FALLBACK_TRAILER='Co-authored-by: Claude <noreply@anthropic.com>'

cd "$REPO_DIR"
SKILL_INSTRUCTIONS=$(cat "$REPO_DIR/setup/dotfiles/agent-skills/agentic-pr-create-context-audit/SKILL.md")
# shellcheck source=no-changes.sh
. "$REPO_DIR/infrastructure/agent-sandbox/no-changes.sh"

git checkout -b "$BRANCH"
BASE_SHA=$(git rev-parse HEAD)
rm -f "$META_FILE"

PROMPT=$(cat <<EOF
You are running non-interactively in a fresh clone of vigilant-broccoli, on a dedicated branch. Slim repository agent guidance by removing duplication and incident narrative without losing any context.

Follow these shared task instructions:

$SKILL_INSTRUCTIONS

Sandbox execution rules:
- You are already inside the unattended sandbox mentioned in the skill; complete the task here without launching another sandbox.
- Branching, committing, pushing, and opening the PR are handled by the calling script. Do not run mutating git commands or any gh commands.
- The calling script rejects the run if any file outside the skill's scope changed (only CONTEXT.md files, shared SKILL.md files and root CONTEXT.md Doc Map and required-reading documents, minus notes/, docs/rnd/, docs/learning-timeline.md and TODO.md), if a file was created, deleted, renamed or changed type (including an AGENTS.md or command adapter symlink), if a SKILL.md frontmatter block changed, or if more than $MAX_CHANGED_FILES files changed.
- Check everything the skill covers before choosing what to edit; do not stop after one kind of check. Record anything in scope you did not check or edit as a skipped candidate with the reason.
- The only exception to the skill's output scope is $META_FILE, outside the checkout. Even for a clean run, write the metadata with empty cuts/skipped lists; the calling script exits without opening a PR.

When finished, write $META_FILE containing only a JSON object with these fields:
  - cuts: array of objects {path, cut, retained} for every removed or compressed passage, cut being a short quote or description of what was removed and retained the evidence for each removed fact (the new text that keeps it, the file:line where it already lives, or the code that makes it derivable)
  - skipped: array of objects {path, reason} for candidates you left in place, including every candidate over the file cap
  - commit_message: capitalized, concise, focused on why the guidance needed slimming, ending with a period
  - co_authored_by: the Co-Authored-By trailer line specified by your environment for the model authoring the commit
  - pr_title: the pull request title in the form "<committype>(<scope>): <Message>." (scope omitted when unscoped)
  - pr_summary: markdown for the PR "## Summary" section — one subsection per changed file listing what was cut and, for each removed fact, where it is retained, then a "### Skipped candidates" subsection listing each skipped candidate with its reason
  - pr_next_steps: markdown checklist for the PR "## Next steps" section — what's left for the human (spot-check each cut against its retained evidence, watch CI to green, then merge)
  - pr_suggestions: markdown bullet points for the PR "## Suggestions" section — only optional follow-up for the reviewer (cuts worth a human decision, related cleanups worth a separate PR), or "" when there are none. Never suggest work this scheduled job covers, such as candidates over the cap or areas you did not check: list those as skipped candidates, since the next scheduled run picks them up.
  - pr_concerns: markdown bullet points for the PR "## Concerns" section — problems the reviewer must weigh before merging (risks, known limitations, unverified behavior, unresolved questions, assumptions that may be wrong), or "" when there are none. Keep these out of pr_suggestions, which is only for optional follow-up work
$NO_CHANGES_FIELD
EOF
)

# Auto mode: its classifier blocks exfiltration, credential reads and running downloaded
# code, which the egress firewall cannot stop because GitHub stays reachable and
# GH_TOKEN is in the container environment. SOLVE_PERMISSION_MODE=bypass opts out.
permission_args=(--permission-mode auto)
if [ "${SOLVE_PERMISSION_MODE:-auto}" = bypass ]; then
  permission_args=(--dangerously-skip-permissions)
fi

claude -p "$PROMPT" "${permission_args[@]}" --model "$MODEL" \
  --disallowedTools "Bash(git commit:*)" "Bash(git push:*)" "Bash(git checkout:*)" "Bash(git switch:*)" "Bash(gh:*)"

normalize_meta "$META_FILE"

git checkout "$BRANCH"
[ "$(git rev-parse HEAD)" = "$BASE_SHA" ] || git reset --soft "$BASE_SHA"

# Finding nothing safe to slim is a success: exit before the PR machinery
# rather than opening an empty PR for the owner to close.
if [ -z "$(git status --porcelain)" ]; then
  echo "AUDIT_CLEAN: no guidance could be slimmed without losing context — no PR opened."
  no_changes_report "$META_FILE" || true
  exit 0
fi

git add -A

# The skill's scope is re-checked here. The Doc Map and required-reading links are read from the
# base commit so an edit to root CONTEXT.md cannot widen the run's own scope. notes/, R&D and the learning
# timeline are records by design (the timeline is in the Doc Map), and TODO.md
# belongs to agentic-pr-create-todo-audit.
DOC_MAP=$(git show "$BASE_SHA:CONTEXT.md" | awk '/^## Doc Map/ { in_map = 1; next } /^## / { in_map = 0 } in_map' |
  sed -n 's/^| \[[^]]*\](\.\/\([^)]*\)).*/\1/p')
# Required-reading docs are the ones root CONTEXT.md directs agents to read
# before a class of work ("Read [x](./x.md) before ..."); any other linked doc stays out.
REQUIRED_READING=$(git show "$BASE_SHA:CONTEXT.md" |
  grep -oE 'Read \[[^]]*\]\(\./[^)#]*\.md[^)]*\) before' |
  sed -n 's/^Read \[[^]]*\](\.\/\([^)#]*\.md\).*/\1/p')
in_scope() {
  case "$1" in
    notes/* | docs/rnd/* | docs/learning-timeline.md | TODO.md) return 1 ;;
    CONTEXT.md | */CONTEXT.md) return 0 ;;
  esac
  [[ $1 == setup/dotfiles/agent-skills/*/SKILL.md && $1 != setup/dotfiles/agent-skills/*/*/SKILL.md ]] && return 0
  grep -Fxq -- "$1" <<<"$DOC_MAP" || grep -Fxq -- "$1" <<<"$REQUIRED_READING"
}

FORBIDDEN=$(git diff --cached --name-only | while IFS= read -r path; do
  in_scope "$path" || echo "$path"
done)
if [ -n "$FORBIDDEN" ]; then
  echo "ERROR: the audit touched paths outside its scope:" >&2
  echo "$FORBIDDEN" >&2
  exit 1
fi

# A tool that rewrites a symlink as a regular file shows up as a typechange;
# slimming edits existing files in place, so creations and deletions fail too.
NOT_IN_PLACE=$(git diff --cached --no-renames --name-status --diff-filter=ADT)
if [ -n "$NOT_IN_PLACE" ]; then
  echo "ERROR: the audit created, deleted or changed the type of files it may only edit in place:" >&2
  echo "$NOT_IN_PLACE" >&2
  exit 1
fi

# Frontmatter name/description define the slash commands; a byte change renames
# or re-describes an operation, which slimming must never do.
frontmatter() { awk 'NR == 1 && $0 != "---" { exit } { print } NR > 1 && $0 == "---" { exit }'; }
FRONTMATTER_CHANGED=$(git diff --cached --name-only -- 'setup/dotfiles/agent-skills/*/SKILL.md' | while IFS= read -r path; do
  [ "$(git show "$BASE_SHA:$path" | frontmatter)" = "$(git show ":$path" | frontmatter)" ] || echo "$path"
done)
if [ -n "$FRONTMATTER_CHANGED" ]; then
  echo "ERROR: the audit changed SKILL.md frontmatter:" >&2
  echo "$FRONTMATTER_CHANGED" >&2
  exit 1
fi

CHANGED_COUNT=$(git diff --cached --name-only | wc -l)
if [ "$CHANGED_COUNT" -gt "$MAX_CHANGED_FILES" ]; then
  echo "ERROR: $CHANGED_COUNT files changed, over the $MAX_CHANGED_FILES-file cap that keeps an audit reviewable." >&2
  exit 1
fi

# shellcheck source=commit-subject.sh
. "$REPO_DIR/infrastructure/agent-sandbox/commit-subject.sh"
read_meta() { jq -r "$1 // empty" "$META_FILE" 2>/dev/null || true; }

COMMIT_MESSAGE=$(normalize_commit_message "$(read_meta .commit_message)")
TRAILER=$(read_meta .co_authored_by)
PR_TITLE=$(normalize_pr_title "$(read_meta .pr_title)")
PR_SUMMARY=$(read_meta .pr_summary)
PR_NEXT_STEPS=$(read_meta .pr_next_steps)
PR_CONCERNS=$(read_meta .pr_concerns)
PR_SUGGESTIONS=$(read_meta .pr_suggestions)
CUT_COUNT=$(read_meta '.cuts | length')
SKIPPED_COUNT=$(read_meta '.skipped | length')

if [ -n "$COMMIT_MESSAGE" ]; then
  COMMIT_SUBJECT="docs(agents): ${COMMIT_MESSAGE}"
else
  COMMIT_SUBJECT="docs(agents): Slim duplicated and narrative agent guidance without losing context."
fi

echo "$TRAILER" | grep -Eqi '^co-authored-by: .+ <.+>$' || TRAILER="$FALLBACK_TRAILER"
[ -n "$PR_TITLE" ] || PR_TITLE="$COMMIT_SUBJECT"
[ -n "$PR_SUMMARY" ] || PR_SUMMARY="- Slimmed ${CUT_COUNT:-0} passages and skipped ${SKIPPED_COUNT:-0} candidates across ${CHANGED_COUNT} files."
[ -n "$PR_NEXT_STEPS" ] || PR_NEXT_STEPS="- [ ] Spot-check each cut against where its facts are retained, then merge once CI is green"

bash "$REPO_DIR/infrastructure/agent-sandbox/run-pre-commit.sh"

git add -A
SKIP=$SKIP_COMMIT_HOOKS git commit -m "$COMMIT_SUBJECT" -m "$TRAILER"
git push -u origin "$BRANCH"

if [ -n "${GITHUB_ACTIONS:-}" ]; then
  HISTORY_SOURCE="GitHub Actions"
else
  HISTORY_SOURCE="Docker sandbox (local)"
fi

PR_BODY=$(CURRENT_BODY="$PR_FOOTER" PR_SUMMARY="$PR_SUMMARY" PR_NEXT_STEPS="$PR_NEXT_STEPS" PR_CONCERNS="$PR_CONCERNS" PR_SUGGESTIONS="$PR_SUGGESTIONS" \
  HISTORY_SOURCE="$HISTORY_SOURCE" HISTORY_COMMAND="agentic-pr-create-context-audit" \
  HISTORY_PROMPT="Slim duplicated and narrative agent guidance without losing context." \
  HISTORY_SUMMARY="$COMMIT_SUBJECT" HISTORY_DATE="$(date -u +%Y-%m-%d)" \
  python3 "$REPO_DIR/infrastructure/agent-sandbox/merge-pr-body.py")

PR_URL=$(gh pr create --title "$PR_TITLE" --body "$PR_BODY")
echo "$PR_URL"
printf 'PR_URL::%s\n' "$PR_URL"
emit_pr_files "$BASE_SHA"
