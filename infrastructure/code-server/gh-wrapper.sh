#!/bin/bash
# Installed as /usr/local/bin/gh, ahead of apt's /usr/bin/gh on PATH, so every
# gh call — including git's `gh auth git-credential` helper — carries the
# GitHub App installation token gh-token reads from the file the
# manual-refresh-code-server-github-token workflow delivers. A GH_TOKEN already
# set in the environment wins, and a missing or expired token falls through to
# unauthenticated gh after gh-token has said why.
GH_BIN=/usr/bin/gh

if [ -z "${GH_TOKEN:-}" ]; then
  if TOKEN=$(gh-token); then
    export GH_TOKEN=$TOKEN
  fi
fi

exec "$GH_BIN" "$@"
