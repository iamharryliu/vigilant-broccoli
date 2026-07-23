Run the standard git workflow to ship the current changes: branch, commit, push, and open a PR.

1. Check `git status` and `git diff` (staged and unstaged) to see what's changed. Stage only the files created or edited during this session (via this conversation's own Write/Edit/Bash calls) — never `git add -A` or `git add .`, and never stage files that were already modified/untracked before this session started, even if they look related. If unsure whether a file was touched this session, leave it unstaged and ask rather than guessing from the diff content.
2. Pick a commit type for the change: `feat`, `fix`, `ci`, `chore`, `docs`, `refactor`, `enhancement`, `security`, or `infrastructure` (match existing usage in `git log` — don't invent a new type unless nothing fits).
3. Determine the target branch:
   - If the conversation already checked out or discussed a specific non-main branch for these changes (e.g. a PR branch fetched via `gh pr checkout` earlier in the session), commit there directly — do not create a new branch.
   - Otherwise, if currently on `main` (or another shared base branch), create a new branch from it named `<committype>/<short-kebab-case-description>` (e.g. `fix/null-pointer-on-login`, `feat/csv-export-button`).
4. Commit the staged changes with a message in the form `<committype>(<scope>): <Message>.` — scope is the affected app/service/lib name (e.g. `api`, `web`, `auth-service`) and is omitted when the change isn't scoped to one; the message is capitalized, concise, focused on why not what, and ends with a period. End the commit message with the `Co-Authored-By:` trailer specified by the environment for the model authoring the commit — do not hardcode a model name here, since it changes as models are released.
5. Push the branch. If it already tracks a remote (e.g. an existing PR branch reused per step 3), a plain `git push` suffices; otherwise push with `-u origin <branch>`.
6. If an open PR already exists for this branch (`gh pr view <branch>`), skip creating a new one — the push in step 5 updates it. Otherwise open a PR with `gh pr create`, using a HEREDOC body with a `## Summary` (bullet points) and `## Test plan` (checklist) section, ending with the Claude Code footer.
7. Return the PR URL.
8. Switch back to the original branch so any other in-progress work there is undisturbed.

Follow this repo's git safety conventions: never force-push, never skip hooks, never amend existing commits, and never push/commit/open a PR unless this command was explicitly invoked.
