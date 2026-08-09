# Google Workspace

- [Pricing](https://workspace.google.com/pricing)

## GAM

### Reference

- [GAM](https://github.com/GAM-team/GAM)

  - [Wiki](https://github.com/GAM-team/GAM/wiki/GoogleDriveManagement#creating-and-uploading-drive-files-for-users)
  - [GAM Directory Commands](https://github.com/GAM-team/GAM/wiki/GAM3DirectoryCommands)
  - GAM Drive Handling
    - [GAM Drive Transfer](https://github.com/GAM-team/GAM/wiki/Data-Transfers#request-a-data-transfer)
    - [Driv File Querying](https://developers.google.com/drive/api/guides/search-files)
  - [Admin Handling](https://github.com/GAM-team/GAM/wiki/Managing-Admins)
  - [GAM Discussion](https://groups.google.com/g/google-apps-manager)

- [GYB](https://github.com/GAM-team/got-your-back)
  - [Wiki](https://github.com/GAM-team/got-your-back/wiki)
  - [Performing a Backup](https://github.com/GAM-team/got-your-back/wiki#performing-a-backup)
  - [Performing a Restore](https://github.com/GAM-team/got-your-back/wiki#performing-a-restore)
- [Reuse GAM](https://groups.google.com/g/google-apps-manager/c/DsWO3PKSAAM)

### Install

Interactive install (prompts for Google Cloud project creation + OAuth consent in a browser) — use this the _first_ time either tool is set up for the domain:

```bash
bash <(curl -s -S -L https://git.io/gam-install)      # GAM: new install
bash <(curl -s -S -L https://git.io/gam-install) -l   # GAM: update to latest version

bash <(curl -s -S -L https://git.io/gyb-install)      # GYB: new install
bash <(curl -s -S -L https://git.io/gyb-install) -l   # GYB: update to latest version
```

Non-interactive install (binary only, skips project creation + auth) — use this on any _additional_ machine where you'll copy over an existing setup's credentials instead (see [Copying Credentials to a New Machine](#copying-credentials-to-a-new-machine)):

```bash
# GAM7 → installs straight to ~/bin/gam/gam (matches alias gam="~/bin/gam/gam")
bash <(curl -s -S -L https://git.io/gam-install) -d ~/bin/gam -s -l -p false

# GYB → installs to ~/bin/gyb/gyb (matches alias gyb="~/bin/gyb/gyb")
bash <(curl -s -S -L https://git.io/gyb-install) -d ~/bin -l -p false
```

- `-l` — install/upgrade only; exits right after printing `version`, never enters the interactive project-creation/OAuth flow.
- `-s` (GAM only) — strips the `gam7/` wrapper folder so the binary lands at `$target_dir/gam` instead of `$target_dir/gam7/gam`.
- `-p false` — skip touching shell profile files (leave as-is if you already have the `gam`/`gyb` aliases below set up manually).
- Both installers auto-detect OS/arch (macOS arm64/x86_64, Linux glibc variant); override with `-o`/`-a` if needed.

```bash
alias gam="~/bin/gam/gam"
alias gyb="~/bin/gyb/gyb"
```

### Config Files & Credentials

| Tool | Location     | File                                                             | What it is                                                                                                                            |
| ---- | ------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| GAM  | `~/.gam/`    | `client_secrets.json`                                            | OAuth client ID/secret for the registered Cloud project (app identity, not user-specific).                                            |
| GAM  | `~/.gam/`    | `oauth2.txt`                                                     | The authorized admin's OAuth token — this **is** the logged-in admin session GAM acts as.                                             |
| GAM  | `~/.gam/`    | `oauth2service.json`                                             | Service account key enabling domain-wide delegation (impersonate any user within granted scopes).                                     |
| GAM  | `~/.gam/`    | `gam.cfg`                                                        | Settings. Contains **absolute host paths** (`config_dir`, `cache_dir`, `drive_dir`) — not portable as-is between machines, see below. |
| GYB  | `~/bin/gyb/` | `client_secrets.json`                                            | OAuth client ID/secret for GYB's registered Cloud project.                                                                            |
| GYB  | `~/bin/gyb/` | `oauth2service.json`                                             | Service account key for domain-wide delegation — use with `--service-account` on every command.                                       |
| GYB  | `~/bin/gyb/` | `<impersonated-email>.cfg` (e.g. `serviceaccount@elva11.se.cfg`) | Cached OAuth2 credential for one specific impersonated address, used when _not_ passing `--service-account`.                          |
| GYB  | `~/bin/gyb/` | `lastcheck.txt`, `nobrowser.txt`                                 | Local-only state (update-check timestamp, headless-mode flag) — no need to copy between machines.                                     |

`oauth2.txt`, `oauth2service.json`, and any `*.cfg` credential file are secrets — treat them like admin passwords (`chmod 600`, never commit them).

> **Nuance:** the per-email `.cfg` OAuth cache (e.g. `serviceaccount@elva11.se.cfg`) can go stale (`invalid_grant: Bad Request` on every command) independent of which machine it's on — it failed identically on the original machine and a freshly-copied one. Domain-wide delegation via `oauth2service.json` + `--service-account` bypassed it entirely and worked immediately (verify with `gyb --email EMAIL --action check-service-account --service-account`). Prefer `--service-account` over the cached per-email token for this reason.

### Copying Credentials to a New Machine

To use the same authorized identity for GAM/GYB from a second machine (no need to redo OAuth consent or domain-wide delegation setup):

1. Install the binaries locally with the non-interactive install commands above — this creates a fresh `~/.gam/` (with a default `gam.cfg`) and `~/bin/gyb/`.
2. Copy the credential files listed in the table above from the source machine over SSH, e.g.:
   ```bash
   scp user@source-host:~/.gam/{client_secrets.json,oauth2.txt,oauth2service.json,gam.cfg} ~/.gam/
   scp "user@source-host:~/bin/gyb/{client_secrets.json,oauth2service.json,serviceaccount@elva11.se.cfg}" ~/bin/gyb/
   chmod 600 ~/.gam/{client_secrets.json,oauth2.txt,oauth2service.json,gam.cfg} ~/bin/gyb/{client_secrets.json,oauth2service.json,serviceaccount@elva11.se.cfg}
   ```
3. Patch the absolute paths in the copied `gam.cfg` to match the new machine's home directory:
   ```bash
   sed -i '' \
     -e "s|^cache_dir = .*|cache_dir = $HOME/.gam/gamcache|" \
     -e "s|^config_dir = .*|config_dir = $HOME/.gam|" \
     -e "s|^drive_dir = .*|drive_dir = $HOME/Downloads|" \
     ~/.gam/gam.cfg
   ```
   (`sed -i ''` is macOS/BSD syntax; drop the `''` on Linux/GNU sed.)
4. Verify:
   ```bash
   gam version                              # confirms binary + config load
   gam info domain                          # confirms oauth2.txt is a valid admin session
   gyb --version
   gyb --email EMAIL --action check-service-account --service-account   # confirms domain-wide delegation
   ```

Avoid staging copied secrets under a world-writable path like `/tmp` for longer than the copy step — move them into their final `chmod 600` location immediately and delete any staging copy.

### Commands

```
gam oauth info

gam info user
gam info user EMAIL
gam print users
gam print users allfields
gam print admins
gam print admins role _SEED_ADMIN_ROLE
gam info user EMAIL
gam delete user EMAIL
gam undelete user EMAIL

gam print transferapps
gam create datatransfer FROM_EMAIL gdrive TO_EMAIL privacy_level shared,private

gyb --email EMAIL --action estimate --spam-trash --search QUERY --service-account
gyb --email EMAIL --action backup --local-folder FOLDER  --spam-trash --search QUERY --service-account
gyb --email EMAIL --action restore --local-folder FOLDER --service-account

gam user USER_EMAIL create calendar summary "summary"
gam user USER_EMAIL show calendars
gam calendar CALENDAR_ID show settings
gam calendar calendar_id show events
gam calendar CALENDAR_ID update event EVENT_ID summary "new summary"
gam user CALENDAR_ID delete calendar


```

## Domain Wide Delegation

- [Delegating domain-wide authority to the service account](https://developers.google.com/identity/protocols/oauth2/service-account#delegatingauthority)
- [Domain Wide Delegation](https://admin.google.com/ac/accountchooser?continue=https://admin.google.com/ac/owl/domainwidedelegation) - Accessible with an admin user.

### Scopes

```
https://mail.google.com,
https://www.googleapis.com/auth/apps.alerts,
https://www.googleapis.com/auth/calendar,
https://www.googleapis.com/auth/chat.bot
https://www.googleapis.com/auth/gmail.settings.basic,https://www.googleapis.com/auth/cloud-identity,
https://www.googleapis.com/auth/contacts,
https://www.googleapis.com/auth/drive,
https://www.googleapis.com/auth/drive.activity,
https://www.googleapis.com/auth/ediscovery,
https://www.googleapis.com/auth/gmail.settings.sharing,
https://www.googleapis.com/auth/keep,
https://www.googleapis.com/auth/photoslibrary.readonly,
https://www.googleapis.com/auth/spreadsheets,
https://www.googleapis.com/auth/tasks,
https://www.googleapis.com/auth/userinfo.email
```

- Workspace Contact - Google Admin Console > Search for contact sharing
