## Machine Setup

Choose your operating system for setup instructions:

- **[macOS Setup](./macos-setup.md)** — Homebrew, Git, and macOS-specific preferences
- **[Linux Setup](./linux-setup.md)** — Git installation for Debian/Ubuntu and Fedora/RHEL

### Quick Start

Once you have the repo cloned, run:

```bash
cd ~/vigilant-broccoli && pnpm local:install:machine-setup
```

This automatically detects your OS and runs the appropriate setup script.

### Claude Code and Codex

Context adapters are committed symlinks, so a clone already carries them. The dotfile setup installs the shared workflows for both agents as individual symlinks into your home directory. Only `CONTEXT.md` and the shared skills are maintained as sources. To install or refresh those links:

```bash
bash setup/common/agent-skills.sh
```

Use Claude's `/audit-note <scope>` or Codex's `$audit-note <scope>`. Existing skills and caches are preserved; conflicting entries are reported for manual resolution. See [agent setup](../agent-support.md) for the shared source, installation paths, and context discovery. Start a new agent session after setup to load the repository context.

Setup also symlinks `~/.codex/config.toml` to `setup/dotfiles/.codex/config.toml`, which raises Codex's instruction limit past the root context's size. It replaces an existing `~/.codex/config.toml`, so move any local Codex settings you want to keep into the dotfile first.
