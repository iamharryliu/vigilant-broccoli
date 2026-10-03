# Codex

```sh
codex # open the terminal UI in the current directory
codex "Explain this project" # start a chat with an initial prompt
codex -C ~/code/app "Fix the bug" # use another workspace root
codex -i screenshot.png "Recreate this UI" # attach an image to the first prompt
codex --search "Check current docs, then update this integration" # enable live web search
codex --worktree "Prototype this separately" # isolate work in a managed Git worktree

# SETUP
npm install -g @openai/codex@latest # install or update the npm-distributed CLI
brew upgrade --cask codex # update the Homebrew cask install
codex update # update through the Codex updater when supported by the install channel
codex --version
codex doctor --summary # grouped health check for auth, config, runtime, and terminal setup
codex completion zsh # generate shell completions for zsh

# AUTH
codex login
codex login --device-auth # sign in from a remote or headless machine
codex login status # show the active auth source
printenv OPENAI_API_KEY | codex login --with-api-key # store an API key without shell-history exposure
codex logout

# SESSION CONTROL
codex resume
codex resume --last # continue the most recent interactive session
codex resume --all # show sessions from every working directory
codex fork --last "Try another approach" # branch the latest session into a new chat
codex agents # browse sessions on the shared local app-server daemon
codex queue --thread <session-id-or-name> --message "Run the tests again" # queue work on an existing session
codex archive <session-id-or-name> # hide a saved session without deleting it
codex unarchive <session-id-or-name> # restore an archived session
codex delete <session-id-or-name> # permanently remove a saved session

# NON-INTERACTIVE
codex exec "Fix the failing lint rule" # run Codex without opening the TUI
codex e "Summarize this repository" # short alias for codex exec
printf '%s\n' "Write a release note from git diff" | codex exec - # read the prompt from stdin
codex exec --json "Run tests and report failures" # stream events as JSONL for scripts
codex exec -o codex-result.md "Document this module" # write the final answer to a file
codex exec --ephemeral "Try a one-off investigation" # avoid persisting session files
codex exec resume --last "Continue with the next likely fix" # resume the latest exec session

# REVIEW
codex review --uncommitted # review staged, unstaged, and untracked changes
codex review --base main # review current branch against main
codex review --commit <sha> # review the changes introduced by one commit
codex exec review --base main # run the same review flow non-interactively

# SETTINGS
codex -s read-only "Audit this code" # allow reads only
codex -s workspace-write "Implement this change" # allow writes inside the workspace
codex --approve-for-me "Run the migration and tests" # route approvals through automatic review
codex --ask-for-approval never "Run without prompting me" # return failures to Codex instead of asking
codex -c 'model="<model>"' "Use a one-off model override" # override config.toml for this run
codex --strict-config # fail if config.toml has unsupported fields

# SLASH COMMANDS
/status # inspect chat id, model, workspace, context, and rate limits
/permissions # adjust sandbox and approval boundaries mid-session
/model # choose the active model for the chat
/plan # toggle plan mode before implementation
/goal <objective> # set a durable objective Codex keeps working toward
/goal pause # pause the active goal without deleting it
/goal resume # resume a paused goal
/goal clear # remove the active goal
/review # review local changes or compare against a base branch
/compact # compress a long chat context
/fork # copy the current chat into a new chat
/side <question> # ask a temporary side question without disrupting the main chat
/fast # toggle the model's Fast service tier when available
/init # scaffold AGENTS.md instructions for the current project
/mcp # inspect connected MCP servers

# MCP, PLUGINS, AND FEATURES
codex mcp list
codex mcp get <name> # inspect one configured MCP server
codex mcp add <name> -- <command> <args> # add a local stdio MCP server
codex mcp add <name> --url <url> # add a streamable HTTP MCP server
codex mcp login <name> # authenticate an MCP server when it supports login
codex plugin list
codex plugin add <plugin>@<marketplace> # install a plugin from a configured marketplace
codex plugin remove <plugin> # uninstall a plugin and remove its local cache
codex features list # list feature flags and their effective state
codex features enable <feature> # persistently enable a feature in config.toml
codex features disable <feature> # persistently disable a feature in config.toml

# CLOUD AND DESKTOP
codex app # launch the ChatGPT desktop app
codex cloud list # list Codex Cloud tasks
codex cloud exec "Fix the bug in the cloud" # submit a new cloud task without opening the TUI
codex cloud status <task-id>
codex cloud diff <task-id> # show the cloud task patch as a unified diff
codex cloud apply <task-id> # apply a cloud task patch locally
codex apply <task-id> # apply the latest diff produced by a Codex agent
```
