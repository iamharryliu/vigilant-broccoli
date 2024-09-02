# Google Workspace

- [Pricing](https://workspace.google.com/pricing)

## GAM

### Reference

- [GAM](https://github.com/GAM-team/GAM)

  - [Wiki](https://github.com/GAM-team/GAM/wiki/GoogleDriveManagement#creating-and-uploading-drive-files-for-users)
  - [GAM Directory Commands](https://github.com/GAM-team/GAM/wiki/GAM3DirectoryCommands)
  - [GAM Drive Transfer](https://github.com/GAM-team/GAM/wiki/Data-Transfers#request-a-data-transfer)
  - [GAM Discussion](https://groups.google.com/g/google-apps-manager)

- [GYB](https://github.com/GAM-team/got-your-back)
  - [Wiki](https://github.com/GAM-team/got-your-back/wiki)
  - [Performing a Backup](https://github.com/GAM-team/got-your-back/wiki#performing-a-backup)
  - [Performing a Restore](https://github.com/GAM-team/got-your-back/wiki#performing-a-restore)
- [Reuse GAM](https://groups.google.com/g/google-apps-manager/c/DsWO3PKSAAM)

### Commands

```
alias gam="~/bin/gam/gam"
alias gyb="~/bin/gyb/gyb"

gam oauth info

gam info user
gam print users
gam info user EMAIL
gam delete user EMAIL

gam print transferapps
gam create datatransfer FROM_EMAIL gdrive TO_EMAIL privacy_level shared,private

gyb --email EMAIL --action backup --local-folder FOLDER  --spam-trash --search QUERY --service-account
gyb --email EMAIL --action estimate --local-folder FOLDER  --spam-trash --search QUERY --service-account
gyb --email EMAIL --action restore --local-folder FOLDER --service-account
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
