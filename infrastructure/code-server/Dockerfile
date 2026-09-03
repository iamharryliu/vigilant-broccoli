# code-server with this repo's toolchain baked in.
#
# The toolchain used to be installed by a /custom-cont-init.d script that ran
# on every container start, so ~1GB of apt/npm downloads (Node, google-cloud-cli,
# claude-code) was re-fetched whenever the container was recreated -- the
# install lands in the image filesystem, which any redeploy discards. Baking it
# here means a recreate pulls a cached image layer instead.
#
# Built for linux/arm64 (the VM is an OCI Ampere A1) by
# .github/workflows/deploy-code-server-image.yml.
#
# Upstream is pinned by multi-arch index digest rather than :latest so a
# rebuild can't silently pick up a new code-server. Refresh with:
#   docker buildx imagetools inspect lscr.io/linuxserver/code-server:latest
FROM lscr.io/linuxserver/code-server@sha256:973c87625ae2509d184de32e0eaf366c5593817bd512cfcc4f3b72091fea88e3

ENV DEBIAN_FRONTEND=noninteractive

# Copied in rather than inlined so editing the list rebuilds the image -- the
# workflow watches this path.
COPY setup/linux/apt-packages.txt /tmp/apt-packages.txt

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    curl \
    git \
    gnupg \
    ca-certificates \
  && xargs apt-get install -y --no-install-recommends < /tmp/apt-packages.txt \
  && rm -f /tmp/apt-packages.txt \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg \
    | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg \
  && echo 'deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main' \
    > /etc/apt/sources.list.d/google-cloud-sdk.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends google-cloud-cli \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g @anthropic-ai/claude-code \
  && npm cache clean --force

# Gives the abc service account a usable login shell in the code-server
# terminal; carried over from the old custom-init script.
RUN usermod -s /bin/bash abc
