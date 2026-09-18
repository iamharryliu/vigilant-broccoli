# DEV_TOOLING

## Root Scripts Conventions

- Useful infra-level CLI commands (SSH, logs, deploys, resets, service management) should be added as scripts in the root `package.json`.
- The cheatsheet (`docs/cheatsheet.md`, linked from the README, printed via `scripts/shell/cheatsheet.sh` / `pnpm run cheatsheet`) must reflect the root `package.json` scripts — update it when adding, renaming, or removing scripts. `docs/cheatsheet.md` is the source of truth; `cheatsheet.sh` only prints its fenced code block and must not be edited to add content directly.
- The alias cheatsheet (`docs/cheatsheet-aliases.md`, printed via `scripts/shell/cheatsheet-aliases.sh` / `pnpm run cheatsheet:aliases`, and by the `cheatsheet` shell function in `setup/dotfiles/zsh/aliases/vigilant-broccoli_aliases.sh`) must reflect the aliases and functions under `setup/dotfiles/` — update it when adding, renaming, or removing one. Same rule as above: the markdown is the source of truth and the `.sh` only prints its fenced code block.

## Toolchain

- Tool versions are pinned in the root `mise.toml` (Node via `.nvmrc`); `mise install` from the repo root installs them and `mise activate` in `.rc.zsh`/`.rc.bash` puts them on `PATH` inside the repo. Bump a version there rather than in Homebrew — see [CI.md](./CI.md) for how workflows read the same file.
