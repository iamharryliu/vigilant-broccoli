# R&D: Self-hosting MapleStory v83 (Cosmic) on Apple Silicon

> Can a Cosmic v83 private server and its Windows client run locally on an M3 Pro Mac, and which client route is worth pursuing? · 2026-10-28

## Context

Goal: local-only play with [Cosmic](https://github.com/P0nk/Cosmic) (Java 21 + MySQL 8.4 via Docker Compose) and the Windows v83 client from [Cosmic-client](https://github.com/P0nk/Cosmic-client), without public exposure, disabled macOS protections or unvetted binaries. The server works, but the client never reached a login screen under Wine, so all session artifacts were removed. The root cause of both Wine failures, and anything under Windows 11 ARM, CrossOver, Parallels, VMware Fusion or Homebrew Wine, is unverified.

| Finding | Evidence |
| --- | --- |
| Client reached `127.0.0.1:8484` from inside the Wine sandbox | Server log: `Client connected to login server` at each launch |
| Compose publishes on `0.0.0.0` by default | `docker-compose.yml` ports lack a host IP; an override with `!override` and `127.0.0.1:` fixes it |
| Cosmic serves a valid v83 handshake | Raw socket read: `0e 00 53 00 01 00 31 …`, version 83, patch `1`, locale 8 |
| Cosmic-client ships only prebuilt binaries | `HeavenMS-localhost-WINDOW.exe`, `MapleGlobal-v83-setup.exe` and 12 WZ files in Git LFS; the repo has no releases or source |
| `HeavenMS-localhost-WINDOW.exe` is packed | Strings include `oreans.com` (Themida); unsigned; antivirus-flagged per its README |
| Sikarugir Creator, Whisky status | Creator 1.0.2 is ad-hoc signed (Gatekeeper rejects it) and its cask strips quarantine and re-signs; Whisky was [archived in 2025](https://appleinsider.com/articles/25/04/16/whisky-development-ends-on-macos-to-help-wine-flourish) |
| Wine sandbox leaks the Mac filesystem | Wrapper kept a `Z:` mapping to `/`, and profile folders (`Desktop`, `Documents`, `Downloads`, `Pictures`, `Music`, `Movies`, `Templates`) were symlinks to real home folders; macOS raised a Desktop-access prompt |
| Wine 11 (`wine-sikarugir 11.0`) crashes | `Unhandled exception c0000005 … addr 0x7bf7b906` right after `wined3d` starts and `Shape2D.dll` loads; same address with DXVK on and off; client dialog `error code : -2147467259 (Call failed.)` |
| WineCX 24.0.7 hangs | No window, 0% CPU for 7+ minutes, no network connections, no server log entry |
| Client relaunches by file name | Log shows `HeavenMS-localhost-WINDOW.exe` starting the stock `C:\Nexon\MapleStory\MapleStory.exe` twice |

## Alternatives

| Option | Pros | Cons | Cost | Security | Scalability |
| --- | --- | --- | --- | --- | --- |
| **A — Wine via Sikarugir (tested)** | Free; Notepad and the stock installer ran; install and WZ swap worked | Failed on two engines; wrapper leaks host folders by default; unsigned Creator app | Free | Weak: needs sandbox hardening; flagged exe runs beside host files | Per-wrapper; no path forward without a different engine |
| **B — Whisky** | Familiar UI | Archived 2025; runtime download broken; forks unvetted | Free | Unmaintained code | Dead end |
| **C — Windows 11 ARM VM (Parallels or VMware Fusion)** | Real Windows; runs x86 apps under emulation; snapshots; no host mounts | Not verified for this client; 1.6 GB installer plus Windows image on a disk at 96% | Parallels paid; Fusion free for personal use (verify) | Strong if shared folders and clipboard are off and networking is host-only | One VM, snapshot per test |
| **D — CrossOver** | Most reliable commercial Wine on Apple Silicon | Paid; the Themida exe may still fail; not tested | Paid after trial | Same host-leak risk as A unless hardened | Single wrapper |
| **E — Server only** | Works today; zero client risk | No playable game | Free | Loopback-only binding | Trivial |

## Recommendation

Try **C**, preferring VMware Fusion if its licence allows personal use, otherwise a Parallels trial. A VM sidesteps the Wine graphics path and the host-file leaks, and a snapshot makes the flagged exe disposable. If the VM also fails to reach the login screen, fall back to **E** and revisit **D** only if a trial is acceptable. Do not retry **A** without a new engine, since two engines already failed.

## Sample Implementation

Ordered increments, each usable as an `agentic-pr-create --prompt` request:

1. **Server stack** (`infrastructure/maplestory/`): clone Cosmic at a pinned commit and add `compose.override.yaml` so nothing is exposed:

   ```yaml
   services:
     maplestory:
       ports: !override
         - '127.0.0.1:8484:8484'
         - '127.0.0.1:7575-7577:7575-7577'
     db:
       ports: !override
         - '127.0.0.1:3307:3306'
       volumes: !override
         - ../data/mysql:/var/lib/mysql
   ```

   Add `up`, `down`, `status` and `logs` scripts, with a status check that fails if any listener is not on loopback. Keep the empty DB root password only because the port is loopback-bound.

2. **VM test** (manual, documented): create a Windows 11 ARM VM with shared folders, clipboard and drag-and-drop off and host-only networking; snapshot the clean state; run the installer, copy the Cosmic WZ files and the patched exe; point the client at the host loopback address and log in as `admin`.
3. **Verify downloads** before running anything: compare each Git LFS file against its `oid sha256` pointer, and treat a match as integrity only.
4. **Never use the Wine route with default settings** if retried: remove `Z:` in `winecfg`, replace the profile symlinks (`users/<name>/Desktop` and the others) with empty folders, and do not let the installer launch the stock `MapleStory.exe` or `Patcher.exe`.

Cleanup performed after this session: containers, network and the two images (`server-maplestory`, `mysql:8.4.0`) removed; the Cosmic clone, MySQL data, downloads, Sikarugir wrapper, engines, preferences and caches deleted; the Homebrew tap removed; no pre-existing Wine installs were found.
