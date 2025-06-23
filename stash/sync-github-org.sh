#!/bin/bash
set -e

DELETE_MISSING_TEAM=false
DRY_RUN=false

get_team_and_subteams() {
  local org="$1"
  local team_slug="$2"

  echo "$team_slug"

  # Get subteams
  subteams=$(gh api "orgs/$org/teams/$team_slug/teams?per_page=100" --jq '.[].slug')

  for sub in $subteams; do
    get_team_and_subteams "$org" "$sub"
  done
}

while [[ "$1" == -* ]]; do
  case "$1" in
    -d|--delete-missing-team)
      DELETE_MISSING_TEAM=true
      shift ;;
    -n|--dry-run)
      DRY_RUN=true
      shift ;;
    -*)
      echo "Unknown option: $1"
      exit 1 ;;
  esac
done

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 [-d|--delete-missing-team] [-n|--dry-run] teams.json"
  exit 1
fi

JSON_FILE="$1"
ORG=$(jq -r '.organizationName' "$JSON_FILE")

if [ -z "$ORG" ]; then
  echo "Missing organizationName in JSON"
  exit 1
fi

echo "🔄 Syncing GitHub teams and members for org: $ORG"

echo "📥 Fetching existing teams from GitHub..."
# Cache all existing teams info (slug, id, parent_id)
GITHUB_TEAMS_JSON=$(gh api orgs/"$ORG"/teams --paginate)

# Helper function to run or echo commands in dry-run mode
run_cmd() {
  if $DRY_RUN; then
    echo "[dry-run] $*"
  else
    eval "$@"
  fi  
}

# Find team ID by slug
get_team_id() {
  local slug=$1
  echo "$GITHUB_TEAMS_JSON" | jq -r --arg slug "$slug" '.[] | select(.slug == $slug) | .id'
}

# Find parent team ID for a given slug
get_parent_team_id() {
  local slug=$1
  echo "$GITHUB_TEAMS_JSON" | jq -r --arg slug "$slug" '.[] | select(.slug == $slug) | .parent?.id // empty'
}

# Convert team name to slug format
to_slug() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' ' '-'
}

# Recursive function to sync a team and its subteams
sync_team() {
  local team_name="$1"
  local parent_team_id="$2"
  local jq_path="$3"

  local team_slug
  team_slug=$(to_slug "$team_name")
  local existing_team_id
  existing_team_id=$(get_team_id "$team_slug")
  if [ -z "$existing_team_id" ]; then
    echo "➕ Creating team: $team_name (parent_team_id=$parent_team_id)"
    if [ -z "$parent_team_id" ]; then
      run_cmd "gh api orgs/$ORG/teams -f name=\"$team_name\" -f privacy=\"closed\" > /dev/null"
    else
      run_cmd "gh api orgs/$ORG/teams -f name=\"$team_name\" -f privacy=\"closed\" -F parent_team_id=$parent_team_id > /dev/null"

    fi
    # Refresh teams cache after creation
    GITHUB_TEAMS_JSON=$(gh api orgs/"$ORG"/teams --paginate)
    existing_team_id=$(get_team_id "$team_slug")
  else
    echo "✅ Team exists: $team_name"
  fi

  # Sync members
  local json_members
  json_members=$(jq -r "$jq_path.members[].username" "$JSON_FILE")

  # Get existing members for this team slug
  local existing_members
  existing_members=$(gh api "orgs/$ORG/teams/$team_slug/members" --paginate | jq -r '.[].login')

  # Remove members not in JSON
  for member in $existing_members; do
    if ! echo "$json_members" | grep -qx "$member"; then
      echo "❌ Removing member not in JSON: $member from team $team_name"
      run_cmd "gh api orgs/$ORG/teams/$team_slug/memberships/$member -X DELETE"
    fi
  done

  # Add/update members
  local members_count
  members_count=$(jq "$jq_path.members | length" "$JSON_FILE")
  if [ "$members_count" -gt 0 ]; then
    jq -c "$jq_path.members[]" "$JSON_FILE" | while read -r member_json; do
      local username
      username=$(echo "$member_json" | jq -r '.username')
      local role
      role=$(echo "$member_json" | jq -r '.role')
      echo "👤 Syncing member: $username as $role in team $team_name"
      run_cmd "gh api orgs/$ORG/teams/$team_slug/memberships/$username -X PUT -f role=$role" > /dev/null
    done
  fi

  # Recursively sync nested teams
  local subteams_count
  subteams_count=$(jq "$jq_path | has(\"team\") and (.team | length > 0)" "$JSON_FILE")
  if [ "$subteams_count" = "true" ]; then
    local subteam_names
    subteam_names=$(jq -r "$jq_path.team | keys[]" "$JSON_FILE")
    for subteam_name in $subteam_names; do
      sync_team "$subteam_name" "$existing_team_id" "$jq_path.team[\"$subteam_name\"]"
    done
  fi

  local repos_count
  repos_count=$(jq "$jq_path | has(\"repositories\") and (.repositories | length > 0)" "$JSON_FILE")
  if [ "$repos_count" = "true" ]; then
    jq -c "$jq_path.repositories[]" "$JSON_FILE" | while read -r repo_json; do
      local repo_name
      repo_name=$(echo "$repo_json" | jq -r '.name')
      local permission
      permission=$(echo "$repo_json" | jq -r '.permission')
      echo "📦 Granting '$permission' access to repo '$repo_name' for team $team_name"
      echo "gh api orgs/$ORG/teams/$team_slug/repos/$ORG/$repo_name -X PUT -f permission=$permission"
      # run_cmd "gh api orgs/$ORG/teams/$team_slug/repos/$ORG/$repo_name -X PUT -f permission=$permission"
    done
  fi
}

# Start sync for top-level teams
top_level_teams=$(jq -r '.team | keys[]' "$JSON_FILE")
for team in $top_level_teams; do
  sync_team "$team" "" ".team[\"$team\"]"
done

# Optionally delete missing teams if flag set
if $DELETE_MISSING_TEAM; then
  echo "🗑️ Deleting teams missing from JSON..."

  ROOT_TEAM=$(jq -r '.team | keys[0]' "$JSON_FILE")

  # Step 2: Use variable inside jq (with --arg)
  get_child_slugs() {
    jq -r --arg root "$ROOT_TEAM" '
      def get_slugs:
        to_entries[] |
        .key as $key |
        [$key] +
        (if .value.team != {} then (.value.team | get_slugs) else [] end);

    # Always include root; add child slugs only if they exist
    (
      [$root] +
      (if .team[$root].team != {} then
         (.team[$root].team | get_slugs)
       else
         []
       end)
    ) | flatten | .[]
    ' "$JSON_FILE"
  }

  JSON_CHILD_SLUGS=$(get_child_slugs)
  GITHUB_CHILD_SLUGS=$(get_team_and_subteams "$ORG" "$ROOT_TEAM")

  for existing_slug in $GITHUB_CHILD_SLUGS; do
    if ! echo "$JSON_CHILD_SLUGS" | grep -qx "$existing_slug"; then
      echo "🗑️ Deleting missing child team: $existing_slug"
      run_cmd "gh api orgs/$ORG/teams/$existing_slug -X DELETE"
    fi
  done
fi

# # Sync teams and members, no deletions, live run
# ./sync-teams.sh teams.json

# # Sync and delete missing teams, live run
# ./sync-teams.sh --delete-missing-team teams.json

# # Dry run (simulate) sync with deletions
# ./sync-teams.sh --delete-missing-team --dry-run teams.json

# # Dry run without deleting missing teams
# ./sync-teams.sh --dry-run teams.json


# {
#   "organizationName": "my-org",
#   "team": {
#     "engineering": {
#       "members": [
#         { "username": "octocat", "role": "maintainer" },
#         { "username": "hubot", "role": "member" }
#       ]
#     },
#     "design": {
#       "members": [
#         { "username": "alice", "role": "member" }
#       ]
#     }
#   }
# }