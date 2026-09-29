# CLAUDE — infrastructure/jellyfin-pi

## Table of Contents

- [Nuances](#nuances)
  - [A Pi that boots, takes a DHCP lease, then vanishes is browning out](#a-pi-that-boots-takes-a-dhcp-lease-then-vanishes-is-browning-out)
  - [Raspberry Pi Imager can write the card and apply none of its customisation](#raspberry-pi-imager-can-write-the-card-and-apply-none-of-its-customisation)
  - [A headless Pi boots, pings, and has no user account](#a-headless-pi-boots-pings-and-has-no-user-account)
  - [A Pi's Wi-Fi radio is rfkill-blocked until the WLAN country is set](#a-pis-wi-fi-radio-is-rfkill-blocked-until-the-wlan-country-is-set)

## Nuances

Non-obvious traps in this directory — read the relevant entry **before**
working on the surface it names, not only when something breaks.
[nuance-pattern.md](../../docs/nuance-pattern.md) is the convention.

### A Pi that boots, takes a DHCP lease, then vanishes is browning out

The symptom set is wide enough to send you chasing the wrong thing for hours:
the Pi boots and claims its DHCP address, drops off the network minutes later,
comes back as red-LED-on/green-LED-dark (which reads as "not reading the SD
card"), and the card then looks fine in a reader. The router keeps showing the
host as connected, because a DHCP _lease_ outlives the device by hours. Every
one of those points somewhere other than the actual cause, which is an
inadequate power supply.

A Pi 3B+ wants 5.1V at 2.5A. A phone charger, or an adequate adapter behind a
thin or long micro-USB cable, drops enough voltage under load to trip this —
the cable is more often the culprit than the adapter. Sustained undervoltage
also corrupts SD cards, which matters more here now that the media library
shares the boot card.

Confirm it rather than inferring it:

```bash
vcgencmd get_throttled     # 0x0 is healthy
journalctl -b | grep -i undervoltage
```

`get_throttled` is a bitfield: bits 0–3 are conditions happening _now_
(under-voltage, ARM capped, throttled, soft temp limit) and bits 16–19 are the
same conditions having occurred _since boot_. `0x50000` is bits 16 and 18 —
under-voltage and throttling have both occurred — and it reads as "fine right
now" if you only look for a non-zero low nibble.

**Getting that output off a Pi you cannot SSH into** is the other half of this,
and needs no monitor. `/boot/firmware` is FAT32, so a Mac can read it. Add a
cloud-init `runcmd` that writes diagnostics there, bump `instance-id` so the
per-instance modules actually re-run (see below), boot once, and read the file
back in a card reader:

```yaml
runcmd:
  - ip -br a > /boot/firmware/diag.txt 2>&1 || true
  - cloud-init status --long >> /boot/firmware/diag.txt 2>&1 || true
  - id hliu >> /boot/firmware/diag.txt 2>&1 || true
  - systemctl is-active ssh >> /boot/firmware/diag.txt 2>&1 || true
  - vcgencmd get_throttled >> /boot/firmware/diag.txt 2>&1 || true
  - journalctl -b -p err --no-pager >> /boot/firmware/diag.txt 2>&1 || true
```

Guard every command with `|| true` so one failure cannot abort the report, and
note the file's absence is itself the answer: it means the Pi never reached
cloud-init, so the fault is power, the card, or the slot rather than anything
configurable.

### Raspberry Pi Imager can write the card and apply none of its customisation

Imager 2.0.11 was observed writing a correct, bootable card — right partition
layout, verified image — while leaving `/boot/firmware/user-data` as the stock
template with **every line commented out**. No hostname, no user, no SSH key.
The write reports success and the card looks fine; the Pi then boots, answers
ping, and has no account to log into. There is no error anywhere in the
process.

Note also which mechanism Imager now uses. It has moved three times:
`custom.toml` (Bookworm), then `firstrun.sh` plus a `systemd.run=` hook
appended to `cmdline.txt`, and now a **cloud-init seed** — `user-data`,
`meta-data`, `network-config`. A 2026-09 Trixie image carries no `firstrun.sh`
and no `systemd.run=` in `cmdline.txt` at all, so guidance written against
that mechanism silently does nothing.

Always verify before first boot, while the card is still in the reader:

```bash
grep -E '^(hostname|users|ssh_pwauth):' /Volumes/bootfs/user-data
```

Three matches means it applied. No output means it did not. Writing the
cloud-config by hand works on a card that has never booted — see
[jellyfin-pi.md](../../docs/infrastructure/jellyfin-pi.md#from-scratch) for a
known-good `user-data`, and the entry below for why "never booted" is the
load-bearing part.

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

The `instance-id` spelling is the load-bearing detail. Set it correctly
(`instance-id: <something-unique>`, hyphen) and cloud-init treats the card as
a new instance and runs `users`, `runcmd` and the network config as intended.
Leave the shipped `instance_id` and it works exactly once — on a card that has
never booted, where there is no cached id to compare against — and never
again.

Imager writes this same seed now, so its customisation is subject to the same
mechanics; see the entry above for verifying it actually did. Details in
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
