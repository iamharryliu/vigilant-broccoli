Run the standard git workflow to ship the current changes: branch, commit, push, and open a PR.

1. Check `git status` and `git diff` (staged and unstaged) to see what's changed. Stage only the files created or edited during this session (via this conversation's own Write/Edit/Bash calls) — never `git add -A` or `git add .`, and never stage files that were already modified/untracked before this session started, even if they look related. If unsure whether a file was touched this session, leave it unstaged and ask rather than guessing from the diff content.
2. If currently on `main` (or another shared base branch), create a new branch from it with a short kebab-case name that describes the change.
3. Commit the staged changes with a concise message focused on why, not what, ending with:
   Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
4. Push the branch with `-u origin <branch>`.
5. Open a PR with `gh pr create`, using a HEREDOC body with a `## Summary` (bullet points) and `## Test plan` (checklist) section, ending with the Claude Code footer.
6. Return the PR URL.
7. Switch back to the original branch so any other in-progress work there is undisturbed.

Follow this repo's git safety conventions: never force-push, never skip hooks, never amend existing commits, and never push/commit/open a PR unless this command was explicitly invoked.
