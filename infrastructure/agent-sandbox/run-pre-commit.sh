#!/bin/bash
set -euo pipefail

# Auto-fix the working tree with the same hooks ci-pr-check runs (SKIP mirrors the workflow),
# so agent commits never fail the pre-commit job. First pass auto-fixes; second pass must be
# clean or the caller aborts. Run from the repo root (where .pre-commit-config.yaml lives).
export SKIP=grind-75-tests,lint-staged

# --all-files only covers tracked files, so a brand-new file would pass here and
# then fail the commit-time hooks. Intent-to-add puts untracked, non-ignored
# files in the index without staging their content.
git ls-files --others --exclude-standard -z | xargs -0 -r git add -N --

# Stands in for the skipped lint-staged hook, as ci-pr-check's format step does.
# update-pr-runner points FORMAT_CHANGED_HELPER at a copy taken before checkout,
# since the PR branch may predate the script.
bash "${FORMAT_CHANGED_HELPER:-scripts/shell/format-changed.sh}"

pre-commit run --all-files || pre-commit run --all-files
