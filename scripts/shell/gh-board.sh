#!/usr/bin/env bash
# Usage:
#   gh-board.sh sync   — sync all sub-boards from master using area:* labels

set -euo pipefail

OWNER="iamharryliu"
REPO="iamharryliu/vigilant-broccoli"
MASTER_TITLE="vigilant-broccoli"
AREA_PREFIX="area:"

sync() {
  python3 - <<'PYEOF'
import subprocess, json, sys

OWNER = "iamharryliu"
REPO = "iamharryliu/vigilant-broccoli"
MASTER_TITLE = "vigilant-broccoli"
AREA_PREFIX = "area:"

def gh(*args):
  r = subprocess.run(["gh"] + list(args), capture_output=True, text=True)
  if r.returncode != 0:
    print(f"ERROR: gh {' '.join(args)}\n{r.stderr.strip()}", file=sys.stderr)
    return None
  return r.stdout

# Discover projects
projects = json.loads(gh("project", "list", "--owner", OWNER, "--limit", "50", "--format", "json"))["projects"]
proj_by_title = {p["title"]: p for p in projects}

master = proj_by_title[MASTER_TITLE]
master_num = master["number"]

# Fetch master items with status
master_items = json.loads(gh("project", "item-list", str(master_num), "--owner", OWNER, "--limit", "200", "--format", "json"))["items"]

# Fetch labels for all open issues in one call
issues_raw = json.loads(gh("issue", "list", "--repo", REPO, "--state", "all", "--limit", "200", "--json", "number,url,labels"))
area_by_url = {}
for issue in issues_raw:
  for label in issue["labels"]:
    if label["name"].startswith(AREA_PREFIX):
      area_by_url[issue["url"]] = label["name"][len(AREA_PREFIX):]
      break

# Build sub-board configs keyed by area name
sub_names = {title for title in proj_by_title if title != MASTER_TITLE}
sub_configs = {}
for area_name in sub_names:
  sub = proj_by_title[area_name]
  sub_num = sub["number"]
  sub_id = sub["id"]
  sub_fields = json.loads(gh("project", "field-list", str(sub_num), "--owner", OWNER, "--limit", "50", "--format", "json"))["fields"]
  status_field = next(f for f in sub_fields if f["name"] == "Status")
  status_opts = {opt["name"]: opt["id"] for opt in status_field["options"]}
  sub_items = json.loads(gh("project", "item-list", str(sub_num), "--owner", OWNER, "--limit", "200", "--format", "json"))["items"]
  items_by_url = {i["content"]["url"]: i for i in sub_items if i.get("content", {}).get("url")}
  sub_configs[area_name] = {
    "num": sub_num, "id": sub_id,
    "status_field_id": status_field["id"],
    "status_options": status_opts,
    "items_by_url": items_by_url,
  }

# Track which URLs should be in each sub-board
valid_urls = {a: set() for a in sub_configs}

for item in master_items:
  url = item.get("content", {}).get("url")
  status = item.get("status", "Backlog")
  if not url:
    continue
  area = area_by_url.get(url)
  if not area or area not in sub_configs:
    continue
  valid_urls[area].add(url)
  cfg = sub_configs[area]
  if url in cfg["items_by_url"]:
    sub_item = cfg["items_by_url"][url]
    if sub_item.get("status") != status:
      opt_id = cfg["status_options"].get(status)
      if opt_id:
        gh("project", "item-edit", "--project-id", cfg["id"], "--id", sub_item["id"],
           "--field-id", cfg["status_field_id"], "--single-select-option-id", opt_id)
        print(f"UPDATED [{area}] {url} -> {status}")
  else:
    added = json.loads(gh("project", "item-add", str(cfg["num"]), "--owner", OWNER, "--url", url, "--format", "json"))
    opt_id = cfg["status_options"].get(status)
    if opt_id:
      gh("project", "item-edit", "--project-id", cfg["id"], "--id", added["id"],
         "--field-id", cfg["status_field_id"], "--single-select-option-id", opt_id)
    print(f"ADDED [{area}] {url} -> {status}")

# Remove stale items from sub-boards
for area_name, cfg in sub_configs.items():
  for url, sub_item in cfg["items_by_url"].items():
    if url not in valid_urls[area_name]:
      gh("project", "item-delete", str(cfg["num"]), "--owner", OWNER, "--id", sub_item["id"])
      print(f"REMOVED stale [{area_name}] {url}")

print("Sync complete.")
PYEOF
}

case "${1:-}" in
  sync) sync ;;
  *)
    echo "Usage: $0 sync"
    exit 1
    ;;
esac
