#!/bin/bash
set -e

PROFILE_REPO="iamharryliu/iamharryliu"
SECRETS_REPO="iamharryliu/vigilant-broccoli"
SECRET_NAME="PROFILE_REPO_DEPLOY_KEY"
KEY_TITLE="vigilant-broccoli profile sync"

echo "Capturing current deploy key IDs..."
OLD_KEY_IDS=$(gh api "repos/${PROFILE_REPO}/keys" --jq '.[].id')

KEY_DIR=$(mktemp -d)
trap 'rm -rf "$KEY_DIR"' EXIT

echo "Generating new deploy key..."
ssh-keygen -t ed25519 -N "" -C "$KEY_TITLE" -f "${KEY_DIR}/key" -q

echo "Adding new deploy key to ${PROFILE_REPO}..."
gh api -X POST "repos/${PROFILE_REPO}/keys" \
  -f title="$KEY_TITLE" \
  -f key="$(cat "${KEY_DIR}/key.pub")" \
  -F read_only=false > /dev/null

echo "Verifying new key against GitHub..."
if ! GIT_SSH_COMMAND="ssh -i ${KEY_DIR}/key -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" \
  git ls-remote "git@github.com:${PROFILE_REPO}.git" HEAD > /dev/null; then
  echo "ERROR: New deploy key failed verification; old keys left untouched"
  exit 1
fi

echo "Updating ${SECRET_NAME} secret on ${SECRETS_REPO}..."
gh secret set "$SECRET_NAME" --repo "$SECRETS_REPO" < "${KEY_DIR}/key"

echo "Revoking previous deploy keys..."
for KEY_ID in $OLD_KEY_IDS; do
  echo "Deleting deploy key (ID: ${KEY_ID})..."
  gh api -X DELETE "repos/${PROFILE_REPO}/keys/${KEY_ID}"
done

echo "✓ Profile repo deploy key rotated successfully"
