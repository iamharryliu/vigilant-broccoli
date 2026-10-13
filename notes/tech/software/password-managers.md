# Password Managers

## Table of Contents

- [Products](#products)
  - [Ecosystem-integrated](#ecosystem-integrated)
  - [Standalone with Sync](#standalone-with-sync)
  - [Local Database](#local-database)

## Products

### Ecosystem-integrated

| Product                                                                            | Description                                                      | Pros                                                       | Cons                                                                           | Best Used For                              |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------ |
| [Apple Passwords](https://support.apple.com/en-us/120758)                          | Built-in password and passkey manager for Apple devices.         | Integrated autofill; iCloud sync; shared password groups.  | Primarily suited to Apple devices; Windows access requires iCloud for Windows. | People mainly using iPhone, iPad, and Mac. |
| [Google Password Manager (Chrome)](https://support.google.com/chrome/answer/95606) | Password and passkey manager integrated with Chrome and Android. | Integrated autofill; Google Account sync; password checks. | Autofill is centered on Chrome and Android; sync relies on a Google Account.   | People mainly using Chrome and Android.    |

### Standalone with Sync

| Product                                                     | Description                                                                | Pros                                                                  | Cons                                                                                             | Best Used For                                                      |
| ----------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| [1Password](https://1password.com/product/password-manager) | Hosted password manager for individuals, families, and teams.              | Managed sync; shared vaults; family account recovery.                 | Requires a subscription; relies on a hosted service.                                             | Families and teams wanting managed sharing and recovery.           |
| [Bitwarden](./bitwarden.md)                                 | Open-source password manager with hosted and official self-hosted options. | Free core features across devices; choice of hosting.                 | Some features require paid plans; self-hosting needs maintenance.                                | General password management with optional official self-hosting.   |
| [Vaultwarden](https://github.com/dani-garcia/vaultwarden)   | Unofficial, lightweight server compatible with Bitwarden clients.          | Free and open source; low resource requirements; self-hosted storage. | Community support; client compatibility can change; hosting and backups are your responsibility. | Homelabs and small groups wanting a lightweight self-hosted vault. |

### Local Database

| Product                             | Description                                                     | Pros                                                             | Cons                                                                               | Best Used For                                                 |
| ----------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [KeePassXC](https://keepassxc.org/) | Desktop password manager using a local encrypted database file. | Free and open source; works offline; no hosted account required. | Sync and backups are your responsibility; mobile access requires a compatible app. | Offline vaults and users wanting direct control over storage. |
