# Agent Context — infrastructure/jellyfin-pi

## Table of Contents

- [Nuances](#nuances)
  - [A Pi that boots, takes a DHCP lease, then vanishes is browning out](#a-pi-that-boots-takes-a-dhcp-lease-then-vanishes-is-browning-out)
  - [Raspberry Pi Imager can write the card and apply none of its customisation](#raspberry-pi-imager-can-write-the-card-and-apply-none-of-its-customisation)
  - [A headless Pi boots, pings, and has no user account](#a-headless-pi-boots-pings-and-has-no-user-account)

## Nuances

### A Pi that boots, takes a DHCP lease, then vanishes is browning out

Symptoms mislead: the Pi claims its DHCP address, drops off minutes later, returns red-LED-on/green-LED-dark (reads as "not reading the SD card"), and the card looks fine in a reader. The router still shows the host connected because a lease outlives the device. The cause is an inadequate supply: a Pi 3B+ wants 5.1V at 2.5A, and a phone charger or a thin or long micro-USB cable drops enough under load. Sustained undervoltage also corrupts SD cards, which matters because the media library lives on the boot card.

Confirm with `vcgencmd get_throttled` (`0x0` is healthy) and `journalctl -b | grep -i undervoltage`. Bits 0–3 are conditions now; bits 16–19 are the same conditions since boot, so `0x50000` (under-voltage and throttling occurred) looks fine if you only check the low nibble.

Without SSH, `/boot/firmware` is FAT32 and readable from a Mac. Add a cloud-init `runcmd` that appends diagnostics (`ip -br a`, `cloud-init status --long`, `id <user>`, `systemctl is-active ssh`, `vcgencmd get_throttled`, `journalctl -b -p err --no-pager`) to `/boot/firmware/diag.txt`, guard each with `|| true`, bump `instance-id` so per-instance modules re-run, boot once and read the file in a card reader. A missing file means the Pi never reached cloud-init, so the fault is power, the card or the slot.

### Raspberry Pi Imager can write the card and apply none of its customisation

Imager 2.0.11 wrote a correct, bootable card but left `/boot/firmware/user-data` as the stock template with every line commented out: no hostname, user or SSH key, and no error. Imager now writes a cloud-init seed (`user-data`, `meta-data`, `network-config`), replacing `custom.toml` and then `firstrun.sh` with a `systemd.run=` hook in `cmdline.txt`; a 2026-09 Trixie image carries neither, so guidance for the old mechanisms silently does nothing.

Before first boot, with the card still in the reader, run `grep -E '^(hostname|users|ssh_pwauth):' /Volumes/bootfs/user-data`. Three matches means it applied. Hand-written cloud-config works only on a card that has never booted (see the next entry); a known-good `user-data` is in [jellyfin-pi.md](../../docs/infrastructure/jellyfin-pi.md#from-scratch).

### A headless Pi boots, pings, and has no user account

The affected Raspberry Pi OS NoCloud seed uses `instance_id`; cloud-init expects `instance-id`. The ignored key falls back to `nocloud`, so subsequent edits to `user-data` skip per-instance user/network setup even though the hostname still updates. Symptoms include `sshd` refusing logins with "SSH may not work until a valid user has been set up", empty `/etc/netplan/`, and `cloud-init status --long` reporting `degraded done`. Check `/var/lib/cloud/data/instance-id`.

Set `instance-id` (hyphen) correctly and cloud-init treats the card as a new instance; the shipped `instance_id` works exactly once, on a card that has never booted. For an already-booted card, use the Pi-native boot files: `userconf.txt` containing `username:<sha512crypt>` (`openssl passwd -6`) and an empty `ssh` file on `/boot/firmware`. They create the user and enable SSH independently of cloud-init. Use Raspberry Pi Imager customisation for a fresh flash; see [recovery details](../../docs/infrastructure/jellyfin-pi.md).
