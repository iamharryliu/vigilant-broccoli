# VM Disk Cleanup

Quick reference for safely freeing disk space on a Linux VM with running applications.

## Check Disk Usage First

```bash
df -h                              # overall disk usage
du -sh /* 2>/dev/null | sort -rh   # top-level dirs by size
du -sh /home/*/ | sort -rh         # per-user home dirs
```

## Safe to Clean (no app impact)

### npm cache

```bash
npm cache clean --force   # often 1-5GB
```

### apt cache

```bash
sudo apt clean            # downloaded package files, ~100-200MB
```

### systemd journal logs

```bash
sudo journalctl --vacuum-time=7d   # keep last 7 days
```

### Docker (if applicable)

```bash
docker system prune -f             # stopped containers, dangling images
docker image prune -a -f           # all unused images (larger)
```

## Use Caution

| Target         | Risk       | Notes                                                              |
| -------------- | ---------- | ------------------------------------------------------------------ |
| `node_modules` | Medium     | Only remove if you can re-install; don't touch production app dirs |
| `.nvm`         | High       | Node runtime lives here — removal breaks node                      |
| snap revisions | Medium     | `snap list --all` then `snap remove --revision` old ones           |
| log files      | Low-Medium | Truncate, don't delete: `> /var/log/somefile.log`                  |

## Avoid on Live VMs

- Modifying running app directories
- Removing swap (`/swapfile`)
- Clearing `/tmp` without checking for active sockets/locks

## After Cleanup

```bash
df -h /   # confirm free space recovered
```
