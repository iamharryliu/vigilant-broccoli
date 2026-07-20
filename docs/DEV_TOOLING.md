# DEV_TOOLING

## Root Scripts Conventions

- Useful infra-level CLI commands (SSH, logs, deploys, resets, service management) should be added as scripts in the root `package.json`.
- The cheatsheet (`docs/cheatsheet.md`, linked from the README, printed via `scripts/shell/cheatsheet.sh` / `pnpm run cheatsheet`) must reflect the root `package.json` scripts — update it when adding, renaming, or removing scripts. `docs/cheatsheet.md` is the source of truth; `cheatsheet.sh` only prints its fenced code block and must not be edited to add content directly.
