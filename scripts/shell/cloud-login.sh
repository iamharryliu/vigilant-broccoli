#!/bin/bash
# Checks login status for each cloud CLI and only re-authenticates the ones signed out.
set -e

check_and_login() {
  local name="$1" check_cmd="$2" login_script="$3"
  if eval "$check_cmd" >/dev/null 2>&1; then
    echo "✓ $name already logged in"
  else
    echo "→ $name not logged in, running pnpm $login_script"
    pnpm "$login_script"
  fi
}

check_and_login "GCP" "gcloud auth application-default print-access-token" "gcp:login"
check_and_login "AWS" "aws sts get-caller-identity --profile AdministratorAccess-841376026547" "aws:login"
check_and_login "GitHub CLI" "gh auth status" "gh:login"
check_and_login "npm" "npm whoami" "npm:login"
check_and_login "Fly.io" "flyctl auth whoami" "fly:login"
