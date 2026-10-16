# Zed

Personal Zed settings migrated from the local VS Code configuration.

## Table of Contents

- [Setup](#setup)
- [Workspace shortcuts](#workspace-shortcuts)
- [Workflow differences](#workflow-differences)

## Setup

- Install: `brew install --cask zed` (also included in `setup/mac/Brewfile`).
- Settings: `setup/mac/install.sh` links this directory's `settings.json` to `~/.config/zed/settings.json` when no settings file exists. Existing settings are preserved.
- Shortcuts: the VS Code base keymap provides familiar bindings.
- Appearance: Source Code Pro at 14px, weight 500, with One Light replacing Quiet Light.
- Saving: autosave after one second; automatic formatting stays off except for Python.
- Python: install Black in your selected Python environment and ensure `black` is on Zed's PATH. Python formatting uses Black, with Ruff import sorting disabled. Terminal virtual environment activation stays manual.
- CLI: run `cli: install cli binary` from Zed's command palette if `zed` is missing from PATH.
- Optional default terminal editor: add `export EDITOR="zed --wait"` and `export VISUAL="$EDITOR"` to your personal shell configuration.

## Workspace shortcuts

- Reload shell aliases with `source ~/.zsh_aliases`.
- `zedws` opens the repository.
- `zedwsls` lists the existing saved workspace names.
- `zedws vb` or `zedwsn 1` opens the repository and journal folders together in a new Zed window.
- `fzfzed` opens a selected file, including paths containing spaces.
- `zedws` reads the folder paths from the existing strict JSON `.code-workspace` files; their VS Code settings are not imported. Relative paths resolve from the workspace file's directory.

## Workflow differences

- JavaScript, TypeScript, TSX, Python, and Go have built-in language support. Use Zed's Extensions panel for additional languages and themes.
- VS Code extensions are not imported. Git, diagnostics, terminal, and Markdown preview have Zed equivalents; Peacock colors, TODO Tree, Rainbow CSV, and enhanced Markdown preview need individual evaluation.
- ESLint fixes are not automatically enabled in this initial configuration. [Zed's JavaScript guide](https://zed.dev/docs/languages/javascript#eslint) documents `code_actions_on_format`; enable this deliberately after checking the project's ESLint setup.
- Run existing pnpm/Nx commands in the integrated terminal. Use the `claude` CLI there for the existing Claude workflow, or configure an external agent separately in Zed.
- VS Code installation, settings, extensions, and shortcuts remain available during the transition.
- References: [VS Code migration](https://zed.dev/docs/migrate/vs-code), [settings](https://zed.dev/docs/reference/all-settings), [CLI](https://zed.dev/docs/reference/cli), [Python formatting](https://zed.dev/docs/languages/python).
