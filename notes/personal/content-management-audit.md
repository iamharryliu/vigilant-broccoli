# Content Management Audit

## Table of Contents

- [3-2-1 Rule](#3-2-1-rule)
- [Storage Locations](#storage-locations)
  - [Cloud](#cloud)
  - [Local](#local)
- [Digital Assets](#digital-assets)
- [Captures Flow](#captures-flow)
- [Immich Local Storage](#immich-local-storage)

## 3-2-1 Rule

| Requirement | Meaning | Audit Column |
| --- | --- | --- |
| 3 copies | 1 primary + 2 backups | Primary Location, Backup Drive, Cloud Location |
| 2 storage types | e.g. local drive + cloud | Primary Location, Cloud Location |
| 1 off-site copy | Cloud or physically separate location | Cloud Location |

## Storage Locations

### Cloud

| Location | Description | Badge |
| --- | --- | --- |
| Apple Photos | Mainly for iPhone content | ![Apple Photos](https://img.shields.io/badge/Apple%20Photos-000000?logo=apple&logoColor=white) |
| drive.harryliu.dev | Self-hosted Seafile file sync on an AWS EC2 VM behind Cloudflare Access | ![drive.harryliu.dev](https://img.shields.io/badge/drive.harryliu.dev-FF9800) |
| Gitea | Self-hosted Git on an OCI VM behind Cloudflare Access; hosts the journal repo | ![Gitea](https://img.shields.io/badge/Gitea-609926?logo=gitea&logoColor=white) |
| GitHub | Hosts the vigilant-broccoli repo | ![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white) |
| Google Drive | Google content only: Docs, Sheets, Slides, etc. | ![Google Drive](https://img.shields.io/badge/Google%20Drive-4285F4?logo=googledrive&logoColor=white) |
| images.harryliu.dev | Self-hosted Immich photo and video library on an AWS EC2 VM behind Cloudflare Access | ![images.harryliu.dev](https://img.shields.io/badge/images.harryliu.dev-4250AF?logo=immich&logoColor=white) |

### Local

| Location | Description | Badge |
| --- | --- | --- |
| Backup Drive | External drive mounted as `Backup`; holds the Media Library: Books, DJ Music Library, Movies and SNES Roms | ![Backup Drive](https://img.shields.io/badge/Backup%20Drive-555555?logo=files&logoColor=white) |
| Captures Backup Drive | External drive for Captures: images and videos | ![Captures Backup Drive](https://img.shields.io/badge/Captures%20Backup%20Drive-555555?logo=files&logoColor=white) |
| iPhone |  | ![iPhone](https://img.shields.io/badge/iPhone-000000?logo=apple&logoColor=white) |
| MacBook Pro |  | ![MacBook Pro](https://img.shields.io/badge/MacBook%20Pro-000000?logo=macos&logoColor=white) |

```mermaid
flowchart LR
    subgraph LOCAL["Local"]
        MACBOOK_PRO["MacBook<br/>Pro"]
        IPHONE["iPhone"]
        subgraph RESILIO_SYNC["Resilio Sync"]
            subgraph MEDIA["Media"]
                BOOKS["Books"]
                DJ_MUSIC_LIBRARY["DJ Music<br/>Library"]
                MOVIES["Movies"]
                SNES_ROMS["SNES Roms"]
            end
        end
        subgraph BACKUPS["Backups"]
            BACKUP_DRIVE["Backup<br/>Drive"]
            CAPTURES_BACKUP_DRIVE["Captures Backup<br/>Drive"]
        end
    end
    APPLE_PHOTOS["Apple<br/>Photos"]
    IPHONE --> APPLE_PHOTOS
    MACBOOK_PRO --> APPLE_PHOTOS
    GOOGLE_DRIVE["Google<br/>Drive"]
    MACBOOK_PRO --> GOOGLE_DRIVE
    IMAGES_HARRYLIU_DEV["images.harryliu.dev"]
    DRIVE_HARRYLIU_DEV["drive.harryliu.dev"]
    IPHONE --> IMAGES_HARRYLIU_DEV
    MACBOOK_PRO --> IMAGES_HARRYLIU_DEV
    IPHONE --> DRIVE_HARRYLIU_DEV
    MACBOOK_PRO --> DRIVE_HARRYLIU_DEV
    MACBOOK_PRO --> RESILIO_SYNC
    MACBOOK_PRO --> BACKUP_DRIVE
    MACBOOK_PRO --> CAPTURES_BACKUP_DRIVE
```

## Digital Assets

| Asset | Primary Location | Backup Drive | Cloud Location |
| --- | --- | --- | --- |
| Apple Photos | ![iPhone](https://img.shields.io/badge/iPhone-000000?logo=apple&logoColor=white) ![MacBook Pro](https://img.shields.io/badge/MacBook%20Pro-000000?logo=macos&logoColor=white) |  | ![Apple Photos](https://img.shields.io/badge/Apple%20Photos-000000?logo=apple&logoColor=white) |
| Books | ![MacBook Pro](https://img.shields.io/badge/MacBook%20Pro-000000?logo=macos&logoColor=white) | ![Backup Drive](https://img.shields.io/badge/Backup%20Drive-555555?logo=files&logoColor=white) | ![Seafile](https://img.shields.io/badge/Seafile-FF9800) |
| Captures |  | ![Captures Backup Drive](https://img.shields.io/badge/Captures%20Backup%20Drive-555555?logo=files&logoColor=white) |  |
| DJ Music Library | ![MacBook Pro](https://img.shields.io/badge/MacBook%20Pro-000000?logo=macos&logoColor=white) | ![Backup Drive](https://img.shields.io/badge/Backup%20Drive-555555?logo=files&logoColor=white) | ![Seafile](https://img.shields.io/badge/Seafile-FF9800) |
| Docs |  |  |  |
| Journal | ![MacBook Pro](https://img.shields.io/badge/MacBook%20Pro-000000?logo=macos&logoColor=white) |  | ![Gitea](https://img.shields.io/badge/Gitea-609926?logo=gitea&logoColor=white) |
| Movies | ![MacBook Pro](https://img.shields.io/badge/MacBook%20Pro-000000?logo=macos&logoColor=white) | ![Backup Drive](https://img.shields.io/badge/Backup%20Drive-555555?logo=files&logoColor=white) |  |
| Presentations | ![MacBook Pro](https://img.shields.io/badge/MacBook%20Pro-000000?logo=macos&logoColor=white) |  | ![Google Drive](https://img.shields.io/badge/Google%20Drive-4285F4?logo=googledrive&logoColor=white) |
| Profile Images and Phone Wallpapers | ![MacBook Pro](https://img.shields.io/badge/MacBook%20Pro-000000?logo=macos&logoColor=white) |  | ![Google Drive](https://img.shields.io/badge/Google%20Drive-4285F4?logo=googledrive&logoColor=white) |
| SNES Roms | ![MacBook Pro](https://img.shields.io/badge/MacBook%20Pro-000000?logo=macos&logoColor=white) | ![Backup Drive](https://img.shields.io/badge/Backup%20Drive-555555?logo=files&logoColor=white) | ![Seafile](https://img.shields.io/badge/Seafile-FF9800) |
| vigilant-broccoli | ![MacBook Pro](https://img.shields.io/badge/MacBook%20Pro-000000?logo=macos&logoColor=white) |  | ![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white) |

## Captures Flow

```mermaid
flowchart LR
    A["Apple<br/>Photos"] --> B["Captures"] --> C["Captures Backup<br/>Drive"]
    D["Ricoh<br/>GR IIIx"] --> B
    E["Insta360"] --> B
```

## Immich Local Storage

| Data | Location | Notes |
| --- | --- | --- |
| Database dumps | `~/resilio-sync/backup/immich-db-backups/` | Immich's scheduled Database Backup job; bind-mounted over `/data/backups` and synced by Resilio Sync |
| ML model cache | `data/model-cache` beside the compose file | Re-downloaded if lost |
| Originals | `~/resilio-sync/shared/immich/upload/` | Uploaded photos and videos, plus `.xmp` sidecars |
| Postgres data | `data/pgdata` beside the compose file | Not synced; restore from a database dump |
| Thumbnails and transcodes | `~/resilio-sync/shared/immich/thumbs/` and `encoded-video/` | Regenerable |
| Upload root | `~/resilio-sync/shared/immich/` | Mounted as `/data` in the server container |
