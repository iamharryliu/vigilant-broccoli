#!/bin/bash
# Prepares a fresh git worktree for its first commit: installs dependencies (the root postinstall also installs projects/nx-workspace) and builds the gitignored generated files that editors and ad-hoc `tsc` runs need.
set -e

cd "$(git rev-parse --show-toplevel)"

pnpm install
pnpm --dir projects/nx-workspace exec nx run-many -t generate-in-season-produce generate-agentic-workflows
