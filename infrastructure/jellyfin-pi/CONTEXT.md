# Agent Context — infrastructure/jellyfin-pi

## Table of Contents

- [Nuances](#nuances)
  - [Jellyfin on the homelab Pi refuses to start when the media drive is missing](#jellyfin-on-the-homelab-pi-refuses-to-start-when-the-media-drive-is-missing)
  - [A headless Pi boots, pings, and has no user account](#a-headless-pi-boots-pings-and-has-no-user-account)
  - [A Pi's Wi-Fi radio is rfkill-blocked until the WLAN country is set](#a-pis-wi-fi-radio-is-rfkill-blocked-until-the-wlan-country-is-set)

## Nuances

### Jellyfin on the homelab Pi refuses to start when the media drive is missing

Missing `/mnt/media/library` or a mount-related `jellyfin-compose.service` failure is intentional: fstab's `nofail` lets the Pi boot, while `RequiresMountsFor=/mnt/media` and `bind.create_host_path: false` prevent Jellyfin from creating an empty library on the boot disk.

Check `findmnt /mnt/media`, drive cabling/power, then `lsblk -f` against the UUID in `inventory/host_vars/<host>.yml`. See [jellyfin-pi.md](../../docs/infrastructure/jellyfin-pi.md).

### A headless Pi boots, pings, and has no user account

The affected Raspberry Pi OS NoCloud seed uses `instance_id`; cloud-init expects `instance-id`. The ignored key falls back to `nocloud`, so subsequent edits to `user-data` skip per-instance user/network setup even though the hostname still updates. Symptoms include refused SSH logins, empty `/etc/netplan/`, and `cloud-init status --long` reporting `degraded done`. Check `/var/lib/cloud/data/instance-id`.

For an already-booted card, use the Pi-native boot files: `userconf.txt` containing `username:<sha512crypt>` (`openssl passwd -6`) and an empty `ssh` file on `/boot/firmware`. They create the user and enable SSH independently of cloud-init. Use Raspberry Pi Imager customisation for a fresh flash; see [recovery details](../../docs/infrastructure/jellyfin-pi.md).

### A Pi's Wi-Fi radio is rfkill-blocked until the WLAN country is set

A fresh Pi can have a loaded `brcmfmac` driver but `wlan0` unavailable and `nmcli radio` showing Wi-Fi disabled until its regulatory domain is set. Check `/sys/class/rfkill/rfkill*/soft` (`1` means blocked; Lite images may lack the `rfkill` CLI). `sudo raspi-config nonint do_wifi_country SE` clears the block for this host.

Hidden SSIDs also require `802-11-wireless.hidden yes` on the NetworkManager connection.
