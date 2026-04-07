# Infrastructure

## Personal Infrastructure

### Secret Management

- Google Password Manager - Browser Password
- Apple Password Manager - iOS Passwords
- Hashicorp Vault - Application Secrets
- Bitwarden - Other and secret management backup point

### Sync Services

- Resilio Sync - Local Device Sync
- Google Drive
- iCloud - iOS Sync

### Storage Services

- GCP Buckets
- Cloudflare Buckets

### Image Services

- Apple Photos - iOS Image/Video Sync
- Google Photos - Image/Video Backup
- Immich - Local Image/Video Sync

### Backups

```mermaid
flowchart LR

subgraph USER[User]
  RECOVERY_ACCOUNT[Recovery Account]
  ACCESS_ACCOUNT[Access Account]
  RECOVERY_ACCOUNT-->ACCESS_ACCOUNT
end

subgraph LOCAL_MACHINE[Local Machine]
  LOCAL_MACHINE_IMMICH[Immich]
  LOCAL_MACHINE_SYNC_SERVICE[Sync Service]
  LOCAL_MACHINE_IMMICH-->LOCAL_MACHINE_SYNC_SERVICE
  BACKUP[Backup]
  BACKUP<-->LOCAL_MACHINE_SYNC_SERVICE
end

GITHUB_REPO[Github Repo]
subgraph GITHUB_ACTIONS[Github Actions]
  GITHUB_ACTIONS_REPO_BACKUP[Backup Repo]
end

subgraph ANOTHER_MACHINE[Another Device]
  ANOTHER_MACHINE_SYNC_SERVICE[Sync Service]
end

subgraph PASSWORD_MANAGER[Pasword Manager]
  APPLE_PASSWORD_MANAGER[Apple Password Manager]
  CHROME_PASSWORD_MANAGER[Chrome Password Manager]
  BITWARDEN[Bitwarden]

  APPLE_PASSWORD_MANAGER-->BITWARDEN
  CHROME_PASSWORD_MANAGER-->BITWARDEN
end

subgraph CLOUD[Cloud]
  CLOUD_DRIVE
  PASSWORD_MANAGER[Pasword Manager]
end

subgraph CLOUD_DRIVE[Cloud Drive]
  GOOGLE_DRIVE[Google Drive]
  ICLOUD[iCloud]
end

RESILIO[Resilio]

RESILIO<-->|Local sync|LOCAL_MACHINE_SYNC_SERVICE
RESILIO<-->|Local sync|ANOTHER_MACHINE_SYNC_SERVICE

BITWARDEN-->|Encypt secrets|BACKUP

USER-->CLOUD
USER-->GITHUB_REPO
USER-->LOCAL_MACHINE
USER-->REMOTE_SECRET_MANAGER
USER-->ANOTHER_MACHINE

REMOTE_SECRET_MANAGER-->GITHUB_ACTIONS


REMOTE_SECRET_MANAGER[Remote Secret Manager]-->BITWARDEN

GITHUB_REPO-->GITHUB_ACTIONS_REPO_BACKUP-->GOOGLE_DRIVE
BACKUP-->|Cloud backup|CLOUD_DRIVE
```

### CI

```mermaid
graph TD

%% Define nodes

TERRAFORM[Terraform]

subgraph INFRASTRUCTURE[Infrastructure]
  subgraph GCP_VM[GCP VM]
    SECRETS_MANAGER[Secrets Manager]
    VPN[VPN]
  end
end

subgraph GITHUB_ACTIONS[Github Actions]
  DEPLOY_NX_APPS[Deploy Nx Apps]
  subgraph AUTOMATIONS[Automations]
    UPDATE_RESUME[Update Resume]
    CLOUD_BACKUP_VB[Cloud Backup VB]
    CLOUD_BACKUP_SECRETS[Cloud Backup Secrets]
    HEALTH_CHECK[Health Checks]
  end
end

subgraph CLOUDFLARE_UI_APPS[Cloudflare UI Applications]
  CLOUD_8_SKATE[Cloud8Skate]
  PERSONAL_WEBSITE_UI[Personal Website UI]
end

subgraph FLYIO_SERVICE_APPS[Fly.io Service Applications]
  VB_BACKEND[vigilant-broccoli Backend]
  QUEUE[RabbitMQ Queue]
  EMAIL_CONSUMER[Email Consumer]
  CMS[CMS - Content Management System]
end


%% Connections
TERRAFORM-->INFRASTRUCTURE
DEPLOY_NX_APPS-->FLYIO_SERVICE_APPS
DEPLOY_NX_APPS-->CLOUDFLARE_UI_APPS

```

### RabbitMQ Email Consumer Architecture

```mermaid
graph LR
  A[Email Request] -->|Publishes message| B[(RabbitMQ Queue)]
  B -->|Delivers message| C[Email Consumer]
  C -->|Sends Email| D[SMTP Server / Email Service]
```

## Organization Infrastructure

- Secret Manager
- VPN
