# Software Services

## Table of Contents

- [Browsing](#browsing)
- [Cloud Storage](#cloud-storage)
  - [Programmatic Access](#programmatic-access)
- [Content Management Systems](#content-management-systems)
- [Photo and Video Management](#photo-and-video-management)
- [Password Management](#password-management)
- [Communication](#communication)
- [Version Control](#version-control)
- [LLM](#llm)

## Browsing

- [Browser](./browser.md)

## Cloud Storage

USD consumer prices checked 2026-10-30 are reference prices; exact plans, prices, and availability vary by country. Check each provider’s linked page before subscribing.

| Service | Type | Free storage | Typical paid entry plan | Practical fit and caveat |
| --- | --- | --- | --- | --- |
| [Apple iCloud+](https://www.apple.com/icloud/) | Sync and storage | 5 GB | 50 GB for $0.99/month | Best integrated with Apple devices for photos, files, and device data; family sharing is included. |
| [Backblaze Computer Backup](https://www.backblaze.com/cloud-backup/personal) | Computer backup | 15-day trial; no ongoing free tier | Unlimited computer backup for $9/month | Simple automatic backup for one Mac or PC; restores files, but it is not a general-purpose synced drive. |
| [Dropbox](https://www.dropbox.com/plans) | Sync and storage | 2 GB | Plus: 2 TB for $9.99/month | Strong cross-platform file sync and sharing; free storage is small. |
| [Google One / Drive](https://one.google.com/about/plans?hl=en_US) | Sync and storage | 15 GB | Basic: 100 GB for $1.99/month | The Google account quota is shared across Gmail, Drive, and Photos; Google One increases this shared quota. |
| [IDrive](https://www.idrive.com/pricing) | Computer backup with sync | 10 GB | Personal: 5 TB, currently $6.99/month billed yearly | Backs up multiple computers and can sync files; annual discounts and renewal rates can change. |
| [MEGA](https://mega.io/pricing) | Sync and storage | 20 GB | See current Pro entry plan and local price | End-to-end encrypted storage and sharing with generous free space; transfer limits and plan details vary. |
| [Microsoft OneDrive](https://www.microsoft.com/en-us/microsoft-365/onedrive/onedrive-plans-and-pricing) | Sync and storage | 5 GB | Microsoft 365 Basic: 100 GB for $1.99/month | Convenient for Windows and Microsoft 365; Basic also includes 100 GB Outlook mailbox storage. |
| [pCloud](https://www.pcloud.com/cloud-storage-pricing-plans.html) | Sync and storage | 2 GB initially; up to 10 GB | Premium: 500 GB for $4.99/month | Flexible file sync and sharing, with lifetime purchase options; private client-side encryption is a separate add-on. |
| [Proton Drive](https://proton.me/drive/pricing) | Sync and storage | 5 GB | Drive Plus: 200 GB for $4.99/month | End-to-end encrypted storage and sharing; smaller free tier and fewer third-party integrations than mainstream suites. |

### Programmatic Access

Sync clients can expose cloud-only placeholders, and uploads may finish after a local write returns. Ensure inputs are available offline and verify sync completion; for headless jobs, use an API, CLI, or object-storage service.

| Service | Local-folder option | API or command-line option | Fit for code |
| --- | --- | --- | --- |
| [Apple iCloud+](https://developer.apple.com/documentation/uikit/synchronizing-documents-in-the-icloud-environment) | iCloud Drive folder on Apple devices. | iCloud document storage and CloudKit are app-specific APIs that require Apple app configuration and entitlements. | Suits Apple-platform apps; not a general cross-platform cloud-drive API. |
| [Backblaze Computer Backup](https://www.backblaze.com/docs/cloud-storage-get-started-with-a-backblaze-integration) | Computer backup client rather than a general synced drive. | The separate Backblaze B2 product provides S3-compatible and native APIs. | Use B2 for application files; Computer Backup is a different product. |
| [Dropbox](https://www.dropbox.com/developers) | Dropbox desktop app syncs a local Dropbox folder. | Official API v2 and SDKs use OAuth; App Folder access can restrict an app to its own folder. | Strong option for direct user-file access or a filesystem-style local workflow. |
| [Google One / Drive](https://developers.google.com/workspace/drive/api/guides/appdata) | Google Drive for desktop exposes a local Drive folder. | Drive API v3 supports user-visible files; the `appDataFolder` scope stores hidden, app-owned files that users cannot share. | Existing folder-based approach is simple on a signed-in desktop; use the API for headless jobs or app-owned data. |
| [IDrive](https://www.idrive.com/s3-storage-e2/s3-compatible-api) | IDrive Personal is primarily a computer backup service. | The separate IDrive e2 object-storage product offers an S3-compatible API. | e2 is the code-facing option; it is distinct from IDrive Personal backup. |
| [MEGA](https://github.com/meganz/sdk) | MEGAsync syncs a local folder. | MEGAcmd is scriptable; MEGA also maintains a C++ SDK. | Possible for automation, though the SDK is a larger integration than a typical REST client. |
| [Microsoft OneDrive](https://learn.microsoft.com/en-us/graph/onedrive-sharepoint-appfolder) | OneDrive syncs a local folder. | Microsoft Graph API supports file operations and an app-specific `approot` folder. | Strong direct API option, including for app-owned files. |
| [pCloud](https://docs.pcloud.com/) | pCloud desktop apps sync a local folder. | Official OAuth 2.0 API uses HTTP/JSON; pCloud also provides SDKs. | Good direct API option; account region determines the API host. |
| [Proton Drive](https://proton.me/support/drive-cli) | Desktop sync is available on supported desktop platforms. | Official Proton Drive CLI runs on macOS, Windows, and Linux and supports scripted file operations with JSON output. Its [SDK](https://github.com/ProtonDriveApps/sdk) is not yet supported for third-party production apps; the [rclone backend is experimental](https://rclone.org/tiers/). | CLI is useful for scripts and scheduled transfers; avoid depending on the evolving SDK for production integrations. |
| [rclone](https://rclone.org/overview/) | Can mount supported remotes as filesystem paths or copy/sync files without a provider desktop app. | One CLI supports many providers; backend stability varies by [support tier](https://rclone.org/tiers/). | Useful for scripts and file-oriented tools; a mounted remote is not the same as a fully local synced copy. |

## Content Management Systems

- [CMS Types and Products](./cms.md) — architecture and product comparison.
- [Sanity](./sanity.md)

## Photo and Video Management

- [Immich](./self-host/immich.md)

## Password Management

- [Password Managers](./password-managers.md) — product comparison, pros, cons, and best uses.
- [Bitwarden](./bitwarden.md)

## Communication

- [Slack](./slack.md)

## Version Control

| Service | Description | Best Used For |
| --- | --- | --- |
| Forgejo | Community-governed, self-hosted Git forge forked from Gitea, with issues, pull requests, and built-in CI (Forgejo Actions). | Self-hosting a lightweight forge that stays community-owned and non-commercial. |
| [Gerrit](./tools/gerrit.md) | Web-based code review system where every commit is a reviewable Change before it merges. | Projects with strict per-commit review and a high-volume, trunk-based workflow. |
| Gitea | Lightweight, self-hosted Git forge written in Go with repositories, pull requests, issues, and CI (Gitea Actions). | Small teams or homelabs wanting a low-resource self-hosted GitHub alternative. |
| GitHub | Hosted Git platform with pull requests, issues, Actions CI/CD, and the largest open-source community. | Open-source hosting, collaboration, and default team workflows. |
| GitLab | Hosted or self-managed DevOps platform combining Git hosting, merge requests, and built-in CI/CD pipelines. | Teams wanting source control, CI/CD, and security scanning in one self-hostable product. |

## LLM

- [AI Coding Agents](./ai-coding-agents/ai-coding-agents.md)
  - [Codex](./ai-coding-agents/codex.md)
- [LLM Chat Services](./llm-chat-services.md)
