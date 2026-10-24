FROM node:24-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl git gnupg openssh-client iproute2 procps less \
    iptables ipset dnsutils \
    zsh tmux vim neovim fzf ripgrep jq lsof zip unzip \
    python3 python3-pip python3-venv \
    && rm -rf /var/lib/apt/lists/* \
    && pip3 install --no-cache-dir --break-system-packages pre-commit

RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update && apt-get install -y --no-install-recommends gh \
    && rm -rf /var/lib/apt/lists/*

# Claude Code reads the AGENTS.md context adapters directly only from 2.1.277.
RUN npm install -g '@anthropic-ai/claude-code@>=2.1.277' @openai/codex pnpm@11.9.0

# mise.run resolves the pinned release from github.com; build time is outside the egress firewall.
ARG MISE_VERSION=v2026.10.10
RUN curl -fsSL https://mise.run | MISE_VERSION="$MISE_VERSION" MISE_INSTALL_PATH=/usr/local/bin/mise sh

# bash stays the login shell: the runners exec bash scripts, and the entrypoint wires both rc files.
RUN useradd -m -s /bin/bash agent

COPY init-firewall.sh entrypoint.sh solve-todo-runner.sh pr-increments.sh commit-subject.sh no-changes.sh /usr/local/bin/
RUN chmod 755 /usr/local/bin/init-firewall.sh /usr/local/bin/entrypoint.sh /usr/local/bin/solve-todo-runner.sh /usr/local/bin/pr-increments.sh /usr/local/bin/commit-subject.sh /usr/local/bin/no-changes.sh

WORKDIR /home/agent
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["sleep", "infinity"]
