# Balloono

A Bomberman-style arena game at `balloono.harryliu.dev`: drop water balloons, soak rivals, be the last one dry. Play online in rooms or offline against CPU opponents.

## Table of Contents

- [Desktop home](#desktop-home)
- [Rules](#rules)
- [Engine](#engine)
- [CPU opponents](#cpu-opponents)
- [Online rooms](#online-rooms)
- [Accounts and stats](#accounts-and-stats)
- [Free Tier](#free-tier)
- [Controls](#controls)
- [Sound effects](#sound-effects)
- [Manual verification](#manual-verification)

## Desktop home

Balloono requires a desktop or laptop with a keyboard and a browser viewport at least 1024 CSS pixels wide. Narrow viewports and devices whose primary pointer is coarse with no hover show a desktop-required message. The device check runs before mounting auth, room presence or gameplay, and responds to viewport/input changes. Touch controls are removed.

The home screen places the account control and name field above a two-column layout. The main column shows room creation, joining by room name and available rooms immediately, followed by expandable offline CPU settings. Room cards show player counts, the number still needed, countdown seconds or an in-progress Watch action. Hosts advertise the countdown deadline only when it changes; each viewer updates the displayed seconds locally. Older advertisements without a deadline still render.

The sidebar shows three personal counters with an expandable full breakdown, a top-five leaderboard preview with a full ranking dialog, and keyboard controls. The dialog uses shared `react-lib` components, retains ten-row pagination and refresh, and follows the active light/dark theme.

## Rules

- Arena size is selected at the start of each round: 13×11 for 1–4 contenders, 15×13 for 5–7, and 17×15 for 8. Humans, local players, and CPUs count; spectators do not. Dimensions stay fixed if players leave and are recalculated for the next round.
- Fixed pillars and random crates fill the arena. Spawns occupy the four corners and the middle of each edge, with neighbouring tiles kept clear around occupied spawns. Up to eight contenders: online rooms seat human players only; offline matches support CPUs.
- A balloon pops 2.5 s after it is dropped and splashes in a plus shape up to its range, which starts at one tile. The splash stops at pillars, and also at the first crate it breaks. It sets off any balloon it reaches. Power-ups stay until a player picks them up.
- Broken crates can reveal a power-up: extra balloon, bigger splash, or faster feet.
- Anyone standing in a splash is soaked and out. The last player dry wins the round. Wins are counted per session or per room; signed-in players also keep lifetime online stats (see [Accounts and stats](#accounts-and-stats)).
- After 2 minutes, sudden death walls the arena in on a spiral, one tile at a time. Tiles about to close flash red. This ends cautious stalemates.

## Engine

`src/app/engine/` is pure TypeScript with no React and no network, so the same code runs the local game and an online host.

- Match state carries its arena dimensions, round id, a two-second history of numbered pop, pickup, and splash-hit events, and a per-player `tally` (balloons dropped, opponents soaked, pickups by type, ticks alive). Board helpers, CPU paths, closure order, and canvas rendering use those dimensions.
- `advanceMatch` (`match.ts`) steps one 50 ms tick from a state and a map of inputs, and returns a new state.
- Movement is continuous. A player is a box slightly narrower than a tile and can sit between tiles, sliding toward a lane's centre to cut corners. They count as standing on the tile their centre is over (`occupiedTile`). CPU bots send `snap` inputs so they stop on tile centres, which is where they decide.
- `dangerMap` (`board.ts`) gives the ticks until each tile is soaked. It follows chain reactions and includes sudden-death closures. The CPU uses it, and so does the renderer's warning overlay.

## CPU opponents

`cpu.ts` decides once per tile, using a breadth-first search over tiles the bot can stand on without being caught by a pending splash:

1. If the bot's tile is in danger, flee to a calm tile.
2. Otherwise, drop a balloon if it would hit a crate or an enemy, but only when an escape route still exists afterwards.
3. Otherwise, head for a power-up, a crate-breaking spot, or an enemy.

Difficulty is a profile (`BOT_PROFILES`):

| Difficulty | Behaviour                                                                                                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Easy       | Hesitates often, wanders, drops only some of the time, ignores power-ups, does not foresee chain reactions, hunts players only once crates run out                         |
| Medium     | Occasional hesitation, collects power-ups, foresees chains, keeps a small safety margin                                                                                    |
| Hard       | No hesitation, hunts from the start, drops balloons that leave an enemy no escape, avoids sheltering in dead ends or next to enemies, where one more balloon would trap it |

Every bot targets only crate or enemy spots it could escape from after dropping. A threat counts only once it is closer than a fresh balloon's fuse plus splash, so bots keep playing while sudden death is scheduled. In headless one-on-one runs with shuffled spawns (30 matches each, draws excluded), hard beat medium 13–7, hard beat easy 19–2, and medium beat easy 19–1. See this app's [CONTEXT.md](../../CONTEXT.md) before retuning.

## Online rooms

Rooms use public Supabase Realtime channels (`balloono-room:<name>`), with no backend or database of their own:

- **Presence** lists who is in the room. Seats go to the first eight members by join time; anyone else watches.
- **Host-authoritative:** the host's browser runs the simulation. It broadcasts a state snapshot every other tick. Guests send input only when it changes, and their canvas eases toward each snapshot.
- **Starting:** online rooms have no CPUs and require at least four seated players. Reaching four starts a shared 30-second countdown; each additional seated player adds five seconds. Spectators do not extend it. Falling below four cancels it; reaching four again starts a fresh countdown. The deadline and current seats travel in snapshots so host migration preserves the countdown. A match starts automatically when the deadline expires. After a round, the host returns to the lobby to begin the next countdown; there is no immediate-start shortcut.
- **Host migration:** the host is whoever the last snapshot named, while they are still present. Otherwise it is the earliest joiner. A newcomer waits 1.5 s before claiming the role, so a fast clock cannot steal it. If the host leaves mid-match, the next host continues from the last snapshot. Players who left are soaked.
- **Room directory:** Realtime cannot list channels, so each host advertises its room as presence on `balloono-directory`. The home screen lists those rooms.
- **Player identity:** player ids are per page load, so two tabs never collide. Only the name is stored.

Rooms are anonymous by design, like the standalone whiteboard: anyone who knows a room name can join it or spoof messages in it. Signing in never changes this: seats and presence stay keyed by the per-page-load player id, not the account.

Without `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (for example, a plain local `nx serve`), the online card explains that rooms are unavailable. CPU play still works.

## Accounts and stats

Signing in with Google (`createSupabaseAuth`, `src/lib/auth.ts`) is optional. Guests play exactly as before. The home screen shows a small sign-in/sign-out control in the header and, when signed in, a personal stats panel. Without the Supabase env vars the sign-in control is hidden and no auth client starts. A signed-in display name prefills the name field once per account per device; it never affects presence keys.

- **Counted:** online room matches only. CPU and local 2-player matches record nothing. Spectators record nothing.
- **Stats:** wins, losses, draws, seconds played (ticks the player was alive), items collected (extra balloon, bigger splash, faster feet), balloons dropped, and players soaked.
- **Tally:** `Player.tally` in match state is advanced by `advanceMatch`, so it rides every snapshot and survives host migration. A soak credits the owner of the root balloon of a chain reaction; when chains from different owners overlap the tile, each owner is credited once. Self-soaks, arena closure and leaving players credit nobody.
- **Recording:** when a round ends, a signed-in, seated client builds a result (`buildMatchResult`, `engine/results.ts`) from the final state. `match_id` is `<room>:<round id>`, identical on every client. A player who leaves (or closes the tab) mid-match records a loss from the last state seen. The write is a `keepalive` insert with `ON CONFLICT DO NOTHING`, so refreshes, reconnects and retries cannot double-count. A failed write is swallowed; the match shows one hint.
- **Storage:** `balloono_match_results` (migration `supabase/migrations/20261015000000_create_balloono_match_results.sql`) has a unique `(user_id, match_id)` key, CHECK caps on every count, and RLS allowing users to insert and select only rows where `user_id = auth.uid()`. The `balloono_user_stats` view (`security_invoker`) totals a user's rows for the panel.
- **Trust model:** honor system. Each client writes its own row from its own view of the match, so stats are unverified and trivially spoofable by anyone with a session. The public leaderboard carries the same unverified-stats disclaimer.
- **Leaderboard:** the home screen uses `react-lib`’s `Placement`, `UserRow` and `Dialog`, visible to guests and signed-in players when Supabase is configured. It shows the top 50 lifetime players by wins, breaking ties by players soaked and then user id, with a top-five sidebar preview, ten rows per page in the full-ranking dialog, and a refresh button. The `balloono_leaderboard()` security-definer RPC returns only aggregate wins, matches, soaks and stable pseudonymous player codes; it exposes no account names, emails, UUIDs or individual match rows. Own-user RLS and the personal stats view are unchanged.
- **Auth redirects:** `/auth/callback` must be in `uri_allow_list` in `infrastructure/terraform/supabase-auth.tf` for each environment.

## Free Tier

Supabase shares the project’s 500 MB database, 5 GB monthly egress, 50,000 monthly active users, 200 concurrent Realtime connections and 2M monthly messages. Match recording uses one row per signed-in player per online round. Public rankings aggregate those rows on load or manual refresh and return at most 50 records; there is no polling or new Realtime subscription. Lobby countdowns and room-directory advertisements broadcast only deadline or seat changes, rather than every displayed second.

## Controls

- Keyboard: arrow keys or WASD to move, Space, Enter or X to drop a balloon. The most recently pressed held direction wins.
- Local second player (Versus CPU only): ticking **Add local player** gives player 1 the arrow keys and Enter, and player 2 WASD and Space. It leaves room for six CPUs.

## Sound effects

Short synthesized Web Audio effects distinguish balloon pops, power-up pickups, and players getting soaked by a splash. They play in CPU matches, local multiplayer, and online rooms. No audio assets or background music are downloaded.

Audio unlocks after a pointer or keyboard gesture. The match panel provides a mute/unmute button whose preference persists. Concurrent effects are limited to six voices so chain reactions stay quiet enough to follow.

Numbered events travel in snapshots so guests do not miss a pop between broadcasts. Each client advances its playback cursor even while muted, skips historical events on joining a round, reconnecting, or returning from a hidden tab, and does not replay duplicates after host migration. Arena closure and departing players do not produce splash-hit sounds.

## Manual verification

- CPU match at each difficulty: bots break crates, collect power-ups, flee their own balloons, and sudden death starts at 2:00.
- Four browsers in one room: the room appears in the other browser's directory, and a guest's moves and balloons show on the host. Closing the host tab mid-match hands the game to the guest.
- Arena tiers: start rounds with 4, 5, 6, 7, and 8 contenders; verify dimensions, spawns, free movement, bot navigation, closure warnings, and canvas aspect ratio.
- Audio: pop a balloon, collect an item, and get hit by a splash; verify distinct sounds, chain reactions, mute persistence, and no duplicate playback online.
- Light and dark OS theme: the board redraws in the matching palette.
- Accounts: with a Supabase env, sign in; the header shows your name and a sign-out button, and the stats panel appears. Signed out or without env, neither shows and CPU play is unchanged.
- Stats: in a four-browser room (one signed in, three guests), finish a match; the signed-in user gets one `balloono_match_results` row and the guest none. Refresh or reconnect and replay the finished round id: still one row. Close the host tab mid-match: the new host's final state still records correct results. Leave mid-match: a loss row. The panel totals match the rows.
- Online lobby: fewer than four players cannot start; the fourth starts 30 seconds, the fifth adds five seconds, and a drop below four cancels. Check rejoining, a host leaving during the countdown, late joins near zero, spectator joins at eight seats, and returning to the lobby after a round. No online CPU or immediate-start controls appear.
- Leaderboard: signed out and signed in, compare the top 50 with aggregate results; verify ordering, pagination, refresh, empty and failed-request states, dialog focus/close behavior, and desktop layout. Confirm match-table reads still return only your own rows and the RPC reveals no account details. Without Supabase env the leaderboard is hidden.
- CPU and local 2-player matches add no rows.
- Home: verify create/join actions without an extra step, expandable CPU settings, room countdown labels, compact/full stats, and the top-five/full leaderboard in light and dark themes.
- Device gate: phone portrait/landscape and touch-only tablet views show only the desktop-required message and open no room connections. A desktop viewport of at least 1024 pixels mounts the game; resizing across the threshold switches views without hydration errors.
