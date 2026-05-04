Sync sub-boards to reflect the master board `vigilant-broccoli` for owner iamharryliu.

Run:

```bash
./scripts/shell/gh-board.sh sync
```

The script routes issues to sub-boards based on `area:*` labels (e.g. `area:vb-manager-next`, `area:infrastructure`). It will:

1. Add issues to their matching sub-board if missing
2. Update `Status` on sub-board items if it differs from master
3. Remove sub-board items whose issue no longer carries that area label

Issues with `area:misc` or no area label stay on master only.

After the script completes, report a summary of what was added, updated, and removed.
