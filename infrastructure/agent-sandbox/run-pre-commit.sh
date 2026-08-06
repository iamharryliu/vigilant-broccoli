#!/bin/bash
set -euo pipefail

# Auto-fix the working tree with the same hooks ci-pr-check runs (SKIP mirrors the workflow),
# so agent commits never fail the pre-commit job. First pass auto-fixes; second pass must be
# clean or the caller aborts. Run from the repo root (where .pre-commit-config.yaml lives).
export SKIP=grind-75-tests,lint-staged

pre-commit run --all-files || pre-commit run --all-files
