# Infrastructure

## Table of Contents

- [Local Infrastructure](#local-infrastructure)
- [Cloud Infrastructure](#cloud-infrastructure)
- [Personal Infrastructure](#personal-infrastructure)
- [Organization Infrastructure](#organization-infrastructure)

## Local Infrastructure

```mermaid
flowchart
USER[User]

subgraph DOCKER[Docker]
  GRAFANA[Grafana]
  ADMINER[Adminer]
end

subgraph PM2
  VB_MANAGER_NEXT[VB Manager Next]
end

subgraph CLOUD_SERVICES[Cloud Services]
  GITHUB[Github]
  CLOUDFLARE[Cloudflare]
  FLY_IO[Fly.io]
  GCP[GCP]
  AWS[AWS]
end

subgraph WIREGUARD[Wireguard]
  PERSONAL_CLOUD[Personal Cloud]
  WORK_CLOUDS[Work Clouds]
end

VB_MANAGER_NEXT-->CLOUD_SERVICES
VB_MANAGER_NEXT-->GRAFANA

USER-->WIREGUARD
USER-->VB_MANAGER_NEXT
USER-->ADMINER
```

## Cloud Infrastructure

- [Github Repo](http://github.com/iamharryliu/vigilant-broccoli/)
  - [Github Actions](https://github.com/iamharryliu/vigilant-broccoli/actions)
- [NPM Packages](https://www.npmjs.com/settings/vigilant-broccoli/packages)
- [Docker Hub Repositories](https://hub.docker.com/repositories/iamharryliu)

```mermaid
flowchart

subgraph DEPLOYED_SERVERLESS_APPS[Deployed Serverless Apps]
  PRODUCER_CONSUMER_APPS[Producer/Consumer Apps]
  DEPLOYED_SERVERLESS_SERVICES[Services]
end

subgraph GITHUB[Github]
  GITHUB_MONOREPO[Github Monorepo]
  GITHUB_ACTIONS[GitHub Actions]
  GITHUB_MONOREPO-->GITHUB_ACTIONS
end
subgraph DEPENDENCY_DISTRIBUTION[Dependency Distribution]
  NPM_PACKAGES[NPM Packages]
  DOCKER_HUB[Docker Hub]
end

subgraph GCP

  SECRET_MANAGER[Secret Manager]
  GCS_BACKUP[GCS Backup Bucket]

  subgraph GCP_VM[GCP VM]
    WIREGUARD[Wireguard]
    VAULT[Vault]
  end

  GCP_SA[GCP Service Account]

  GCP_SA-->GCP_VM
  GCP_SA-->GCS_BACKUP
  GCP_SA-->SECRET_MANAGER
  SECRET_MANAGER-->VAULT

end

subgraph CLOUDFLARE[Cloudflare]
  R2[R2 Buckets]
end

  RABBITMQ[(RabbitMQ)]

OTHER_SERVICES{Other Services}


subgraph DB_SERVICES[Database Services]
  SUPABASE[Supabase]
end

subgraph MESSAGE_SERVICES[Message Services]
  TWILIO[Twilio]
  RESEND[Resend]
  SendGrid[SendGrid]
end

subgraph LLM_SERVICES[LLM Services]
  OPENAI[Open AI]
  ANTHROPIC[Anthropic]
  DEEP_SEEK[Deep Seek]
  GEMINI[Gemini]
  GROK[Grok]
  ELEVEN_LABS[Eleven Labs]
end

subgraph MONEY_SERVICES[Money Services]
  STRIPE[Stripe]
end

subgraph UTILITY_SERVICES[Utility Services]
  CURRENCY_SERVICE[Currency Service]
  WEATHER_SERVICE[Weather Service]
end

RABBITMQ<-->PRODUCER_CONSUMER_APPS[Producer/Consumer Apps]
VAULT-->DEPLOYED_SERVERLESS_APPS

PRODUCER_CONSUMER_APPS<-->DEPLOYED_SERVERLESS_SERVICES
DEPLOYED_SERVERLESS_SERVICES-->OTHER_SERVICES

GITHUB_ACTIONS-->DEPENDENCY_DISTRIBUTION
GITHUB_ACTIONS-->GCP_SA

OTHER_SERVICES-->CLOUDFLARE
OTHER_SERVICES-->LLM_SERVICES
OTHER_SERVICES-->DB_SERVICES
OTHER_SERVICES-->MESSAGE_SERVICES
OTHER_SERVICES-->UTILITY_SERVICES
OTHER_SERVICES-->MONEY_SERVICES

```

## Personal Infrastructure

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
  GCP[GCP]
  AWS[AWS]
  AZURE[AZURE]
  OCI[OCI]


end

subgraph GITHUB_ACTIONS[Github Actions]
  DEPLOYMENTS[Deployments]
  subgraph AUTOMATIONS[Automations]
    UPDATES[Updates]
    BACKUPS[Backups]
    HEALTH_CHECK[Health Checks]
  end
end

subgraph CLOUDFLARE_PAGES[Cloudflare Pages]
end

subgraph FLYIO_APPLICATIONS[Fly.io Applications]
end


%% Connections
TERRAFORM-->INFRASTRUCTURE
DEPLOYMENTS-->FLYIO_APPLICATIONS
DEPLOYMENTS-->CLOUDFLARE_PAGES

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
