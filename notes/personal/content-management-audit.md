# Content Management Audit

## Table of Contents

- [3-2-1 Rule](#3-2-1-rule)
- [Storage Locations](#storage-locations)
- [Digital Assets](#digital-assets)
- [Media Flow](#media-flow)

## 3-2-1 Rule

| Requirement | Meaning | Audit Column |
| --- | --- | --- |
| 3 copies | 1 primary + 2 backups | Primary Location, Backup Drive, Cloud Location |
| 2 storage types | e.g. local drive + cloud | Primary Location, Cloud Location |
| 1 off-site copy | Cloud or physically separate location | Cloud Location |

## Storage Locations

| Location | Description | Badge |
| --- | --- | --- |
| Apple Photos | Mainly for iPhone content | ![Apple Photos](https://img.shields.io/badge/Apple%20Photos-000000?logo=apple&logoColor=white) |
| Backup Drive | External drive mounted as `Backup`; holds Books, DJ Music Library, Images, Movies and SNES Roms | ![Backup Drive](https://img.shields.io/badge/Backup%20Drive-555555?logo=files&logoColor=white) |
| drive.harryliu.dev | Self-hosted Seafile file sync on an AWS EC2 VM behind Cloudflare Access | ![drive.harryliu.dev](https://img.shields.io/badge/drive.harryliu.dev-FF9800) |
| Gitea | Self-hosted Git on an OCI VM behind Cloudflare Access; hosts the journal repo | ![Gitea](https://img.shields.io/badge/Gitea-609926?logo=gitea&logoColor=white) |
| GitHub | Hosts the vigilant-broccoli repo | ![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white) |
| Google Drive | Needed for high availability documents | ![Google Drive](https://img.shields.io/badge/Google%20Drive-4285F4?logo=googledrive&logoColor=white) |
| immich.harryliu.dev | Self-hosted Immich photo and video library on an AWS EC2 VM behind Cloudflare Access | ![immich.harryliu.dev](https://img.shields.io/badge/immich.harryliu.dev-4250AF?logo=immich&logoColor=white) |
| Local Machine |  | ![Local Machine](https://img.shields.io/badge/Local%20Machine-000000?logo=macos&logoColor=white) |
| Media Backup Drive | Backup drive for image and video content | ![Media Backup Drive](https://img.shields.io/badge/Media%20Backup%20Drive-555555?logo=files&logoColor=white) |
| Mobile Device |  | ![Mobile Device](https://img.shields.io/badge/Mobile%20Device-000000?logo=apple&logoColor=white) |
| Seafile | Self-hosted file storage and synchronization, served at drive.harryliu.dev | ![Seafile](https://img.shields.io/badge/Seafile-FF9800) |

## Digital Assets

| Asset | Primary Location | Backup Drive | Cloud Location |
| --- | --- | --- | --- |
| Apple Photos | ![Mobile Device](https://img.shields.io/badge/Mobile%20Device-000000?logo=apple&logoColor=white) ![Local Machine](https://img.shields.io/badge/Local%20Machine-000000?logo=macos&logoColor=white) |  | ![Apple Photos](https://img.shields.io/badge/Apple%20Photos-000000?logo=apple&logoColor=white) |
| Books | ![Local Machine](https://img.shields.io/badge/Local%20Machine-000000?logo=macos&logoColor=white) | ![Backup Drive](https://img.shields.io/badge/Backup%20Drive-555555?logo=files&logoColor=white) | ![Google Drive](https://img.shields.io/badge/Google%20Drive-4285F4?logo=googledrive&logoColor=white) ![Seafile](https://img.shields.io/badge/Seafile-FF9800) |
| DJ Music Library | ![Local Machine](https://img.shields.io/badge/Local%20Machine-000000?logo=macos&logoColor=white) | ![Backup Drive](https://img.shields.io/badge/Backup%20Drive-555555?logo=files&logoColor=white) | ![Google Drive](https://img.shields.io/badge/Google%20Drive-4285F4?logo=googledrive&logoColor=white) ![Seafile](https://img.shields.io/badge/Seafile-FF9800) |
| Docs |  |  |  |
| Images and Videos |  | ![Media Backup Drive](https://img.shields.io/badge/Media%20Backup%20Drive-555555?logo=files&logoColor=white) |  |
| Journal | ![Local Machine](https://img.shields.io/badge/Local%20Machine-000000?logo=macos&logoColor=white) |  | ![Gitea](https://img.shields.io/badge/Gitea-609926?logo=gitea&logoColor=white) |
| Movies | ![Local Machine](https://img.shields.io/badge/Local%20Machine-000000?logo=macos&logoColor=white) | ![Backup Drive](https://img.shields.io/badge/Backup%20Drive-555555?logo=files&logoColor=white) |  |
| Presentations | ![Local Machine](https://img.shields.io/badge/Local%20Machine-000000?logo=macos&logoColor=white) |  | ![Google Drive](https://img.shields.io/badge/Google%20Drive-4285F4?logo=googledrive&logoColor=white) |
| Profile Images and Phone Wallpapers | ![Local Machine](https://img.shields.io/badge/Local%20Machine-000000?logo=macos&logoColor=white) |  | ![Google Drive](https://img.shields.io/badge/Google%20Drive-4285F4?logo=googledrive&logoColor=white) |
| SNES Roms | ![Local Machine](https://img.shields.io/badge/Local%20Machine-000000?logo=macos&logoColor=white) | ![Backup Drive](https://img.shields.io/badge/Backup%20Drive-555555?logo=files&logoColor=white) | ![Google Drive](https://img.shields.io/badge/Google%20Drive-4285F4?logo=googledrive&logoColor=white) ![Seafile](https://img.shields.io/badge/Seafile-FF9800) |
| vigilant-broccoli | ![Local Machine](https://img.shields.io/badge/Local%20Machine-000000?logo=macos&logoColor=white) |  | ![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white) |

## Media Flow

```mermaid
flowchart LR
    A["Apple<br/>Photos"] --> B["Images and<br/>Videos"] --> C["Media Backup<br/>Drive"]
```
