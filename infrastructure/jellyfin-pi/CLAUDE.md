# CLAUDE — infrastructure/jellyfin-pi

## Table of Contents

- [Nuances](#nuances)
  - [Jellyfin on the homelab Pi refuses to start when the media drive is missing](#jellyfin-on-the-homelab-pi-refuses-to-start-when-the-media-drive-is-missing)
  - [A headless Pi boots, pings, and has no user account](#a-headless-pi-boots-pings-and-has-no-user-account)
  - [A Pi's Wi-Fi radio is rfkill-blocked until the WLAN country is set](#a-pis-wi-fi-radio-is-rfkill-blocked-until-the-wlan-country-is-set)

## Nuances

Non-obvious traps in this directory — read the relevant entry **before**
working on the surface it names, not only when something breaks.
[nuance-pattern.md](../../docs/nuance-pattern.md) is the convention.

### Jellyfin on the homelab Pi refuses to start when the media drive is missing

`docker compose up` reporting
`bind source path does not exist: /mnt/media/library`, or
`jellyfin-compose.service` failing with `Unit … has a bad unit file setting`
about a mount, is the design working. The external drive's fstab entry carries
`nofail` so the Pi still boots without it, and the container's media bind mount
sets `bind.create_host_path: false` while the unit declares
`RequiresMountsFor=/mnt/media`.

Without those two, Docker would create an empty `/mnt/media/library` on the
boot device and Jellyfin would start with an empty library — which looks
exactly like the media having been deleted, and is far harder to diagnose after
the fact than a service that declined to start. Check `findmnt /mnt/media` and
the drive's cabling/power first; `lsblk -f` shows whether the UUID in
`inventory/host_vars/<host>.yml` still matches. Details in
[jellyfin-pi.md](../../docs/infrastructure/jellyfin-pi.md).

### A headless Pi boots, pings, and has no user account

Raspberry Pi OS images ship a cloud-init NoCloud seed on the boot partition
(`user-data`, `network-config`, `meta-data`). Editing those files to create a
user, install a key or configure Wi-Fi looks like the supported path and
silently does nothing on a card that has already booted once.

The shipped `meta-data` writes `instance_id` with an underscore. cloud-init's
NoCloud datasource reads `instance-id` with a hyphen, so the key is ignored and
the instance id falls back to the literal string `nocloud`. Because that value
then never changes, cloud-init treats every later boot as the same instance and
skips all per-instance modules — `users`, `runcmd`, and the network config
among them. `update_hostname` runs per-always, so the hostname from an edited
`user-data` _does_ apply, which makes it look like the file was read.

Symptoms: the Pi answers ping and mDNS under the hostname you set, `sshd`
refuses every login with "SSH may not work until a valid user has been set up",
and `/etc/netplan/` is empty. `cloud-init status --long` reports
`extended_status: degraded done` and `cat /var/lib/cloud/data/instance-id`
prints `nocloud`.

Use the Pi-native mechanisms instead — they are independent of cloud-init and
run on every boot that finds them:

- `/boot/firmware/userconf.txt` = `username:<sha512crypt>` (`openssl passwd -6`)
  → `userconf-pi` creates the account.
- Empty `/boot/firmware/ssh` → `sshswitch.service` enables `sshd`.

Raspberry Pi Imager's own customisation writes whatever the current image
consumes, so it stays the right answer for a fresh flash. Details in
[jellyfin-pi.md](../../docs/infrastructure/jellyfin-pi.md).

### A Pi's Wi-Fi radio is rfkill-blocked until the WLAN country is set

On a fresh Raspberry Pi OS install `wlan0` reports state `unavailable`,
`nmcli radio` shows `WIFI: disabled`, and a scan returns nothing — on hardware
whose driver loaded perfectly (`brcmfmac` firmware lines are in `dmesg`). The
radio is soft-blocked pending a regulatory domain: `/sys/class/rfkill/*/soft`
reads `1` for `phy0`.

`sudo raspi-config nonint do_wifi_country SE` clears it, after which `wlan0`
moves to `disconnected` and scanning works. Note `rfkill` itself is not
installed on Lite images, so the usual `rfkill list` diagnostic is unavailable;
read `/sys/class/rfkill/rfkill*/soft` directly.

A connection to a **hidden** SSID additionally needs
`802-11-wireless.hidden yes` on the NetworkManager connection, or it fails with
"The Wi-Fi network could not be found" even when the credentials are right.
