# Infrastructure

## Personal Infrastructure

### Secret Management

- Google Password Manager
- Bitwarden
- Hashicorp Vault

### Sync Services

- Google Drive
- Resilio Sync

### Storage Services

- GCS Buckets
- Cloudflare R2 Buckets

### Image Services

- Apple Photos
- Google Photos
- Immich

### Backups

```mermaid
flowchart LR

USER[User]

GITHUB_REPO[Github Repo]

subgraph LOCAL_MACHINE[Local Machine]
  LOCAL_MACHINE_BW[Bitwarden]
  LOCAL_MACHINE_IMMICH[Immich]
  LOCAL_MACHINE_SYNC_SERVICE[Sync Service]
  LOCAL_MACHINE_BW-->|Encypt secrets|BACKUP
  LOCAL_MACHINE_IMMICH-->BACKUP
  BACKUP[Backup]
  BACKUP<-->LOCAL_MACHINE_SYNC_SERVICE
end

subgraph GITHUB_ACTIONS[Github Actions]
  GITHUB_ACTIONS_REPO_BACKUP[Backup Repo]
end

subgraph ANOTHER_MACHINE[Another Device]
  ANOTHER_MACHINE_SYNC_SERVICE[Sync Service]
end

CLOUD_DRIVE[Cloud Drive]

USER<-->LOCAL_MACHINE_BW
USER<-->LOCAL_MACHINE_IMMICH
CLOUD_DRIVE-->USER


REMOTE_SECRET_MANAGER[Remote Secret Manager]-->LOCAL_MACHINE_BW
LOCAL_MACHINE_SYNC_SERVICE-->|Local sync|ANOTHER_MACHINE_SYNC_SERVICE

GITHUB_REPO-->GITHUB_ACTIONS_REPO_BACKUP-->CLOUD_DRIVE
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
