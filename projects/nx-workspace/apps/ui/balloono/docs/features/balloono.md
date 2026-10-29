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

The home screen places the account control above three keyboard-accessible tabs: Online mode, Offline mode and Settings. Online mode opens by default and shows room creation, joining by room name, available rooms and personal stats. Every top-level tab fills the available page height; cards scroll internally when their content is longer. Offline mode shows CPU difficulty, opponent count and local-player settings immediately.

Settings uses one card containing the player name field, random-name button and a Key bindings button, followed by a How to play section with its description, focus hint and Try controls/Reset arena actions to the left of a playable 9×7 mini map. Online and offline card headers each have a right-aligned help icon that opens the same rules dialog, including the goal, splash timing, crates, power-ups and normal-match sudden death, followed by the effective controls and animated key demos.

Matches vertically center the combined arena and right-hand cards without a surrounding outer card. The right-hand cards align with the top of the arena section. The match arena and right-hand cards use a 3:1 split with a consistent gap. Quit (Leave room online), the sound toggle and a key-bindings gear share a row at the top of that panel, above player stats. The help icon sits at the right of the centered sudden-death timer above the arena. A separate card below the player panel lists Extra balloon, Bigger splash and Faster feet; the legend no longer sits below the arena. In-game help opens this same combined dialog; local 2-player setup and matches show both players’ effective keys.

Key binding headings use each player’s arena color. The mini arena reuses match movement, balloon fuses, chain reactions, crate breaking and power-up pickups. Splashes cause two brief opacity pulses over one second instead of elimination; reduced motion uses a steady fade. Focus the arena or choose Try controls to play; Escape, clicking outside or changing tabs pauses it and releases the keyboard. The home theme shortcut is disabled while practicing so Player 2 can steer with D. Practice has no countdown, sudden death, match results or stats; Reset arena restores its crates, pickups and players. There is no settings button in the header.

Room cards show player counts, the number still needed, countdown seconds or an in-progress Watch action. Hosts advertise the countdown deadline only when it changes; each viewer updates the displayed seconds locally. Older advertisements without a deadline still render. The online page fills the remaining viewport height with Online mode’s play area and leaderboard using a 2:1 split, with the leaderboard on the right. The cards scroll independently when needed, and signed-in personal stats sit below the leaderboard. The leaderboard shows the full rankings with ten-row pagination and refresh, or an unavailable message when Supabase is not configured. All tabs follow the active light/dark theme.

## Rules

- Every round opens with a 3-2-1 countdown over the board. Nobody can move or drop balloons and the match clock stays at zero until it ends.
- Arena size is selected at the start of each round: 13×11 for 1–4 contenders, 15×13 for 5–7, and 17×15 for 8. Humans, local players, and CPUs count; spectators do not. Dimensions stay fixed if players leave and are recalculated for the next round.
- Fixed pillars and random crates fill the arena. Spawns occupy the four corners and the middle of each edge, with neighbouring tiles kept clear around occupied spawns. Up to eight contenders: online rooms seat human players only; offline matches support CPUs.
- A balloon pops 2.5 s after it is dropped and splashes in a plus shape up to its range, which starts at one tile. The splash stops at pillars, and also at the first crate it breaks. It sets off any balloon it reaches. Power-ups stay until a player picks them up.
- Broken crates can reveal a power-up: extra balloon, bigger splash, or faster feet.
- Anyone standing in a splash is soaked and out. The last player dry wins the round. Wins are counted per session or per room; signed-in players also keep lifetime online stats (see [Accounts and stats](#accounts-and-stats)).
- After 2 minutes, sudden death walls the arena in on a spiral, one tile at a time. Tiles about to close flash red. This ends cautious stalemates.

## Engine

`src/app/engine/` is pure TypeScript with no React and no network, so the same code runs the local game and an online host.

- Match state carries its arena dimensions, round id, a two-second history of numbered pop, pickup, and splash-hit events, and a per-player `tally` (balloons dropped, opponents soaked, pickups by type, ticks alive). Board helpers, CPU paths, closure order, and canvas rendering use those dimensions.
- `advanceMatch` (`match.ts`) steps one 50 ms tick from a state and a map of inputs, and returns a new state. While `startCountdown` is above zero it only decrements that, so `tick`, sudden death and `ticksAlive` start after the countdown; the online host paces snapshots by `tick + startCountdown`.
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
- **Leaderboard:** the online sidebar uses `react-lib-higher-level`’s `Placement` with compact ranking rows, visible to guests and signed-in players when Supabase is configured. It shows the top 50 lifetime players by wins, breaking ties by players soaked and then user id, with ten rows per page and a refresh button. The `balloono_leaderboard()` security-definer RPC returns only aggregate wins, matches, soaks and stable pseudonymous player codes; it exposes no account names, emails, UUIDs or individual match rows. Own-user RLS and the personal stats view are unchanged.
- **Auth redirects:** `/auth/callback` must be in `uri_allow_list` in `infrastructure/terraform/supabase-auth.tf` for each environment.

## Free Tier

Supabase shares the project’s 500 MB database, 5 GB monthly egress, 50,000 monthly active users, 200 concurrent Realtime connections and 2M monthly messages. Match recording uses one row per signed-in player per online round. Public rankings aggregate those rows on load or manual refresh and return at most 50 records; there is no polling or new Realtime subscription. Lobby countdowns and room-directory advertisements broadcast only deadline or seat changes, rather than every displayed second.

## Controls

- Keyboard: by default arrow keys or WASD to move, Enter or Space to drop a balloon. The most recently pressed held direction wins.
- Settings: the gear in the match panel and the Key bindings button in the Settings tab open the same key-rebinding dialog. Player 1 has two keys per action and player 2 one; clicking a slot waits for the next key, Escape cancels a pending rebind before closing the dialog, and binding a key clears it from that player's other actions. Game inputs are suppressed while a dialog is open. Bindings persist in `localStorage` (`balloono-key-bindings`) and can be reset to defaults.
- Local second player (Versus CPU only): ticking **Add local player** activates player 2's keys, which take priority over any matching player 1 keys; the defaults leave player 1 on the arrow keys and Enter, and player 2 on WASD and Space. It leaves room for six CPUs.
- Theme: `d` toggles light/dark on the home screen only (shared `ThemeProvider` shortcut, saved as `balloono-theme`); rooms and matches leave it unbound because `KeyD` steers right by default.
- Controls guide: the `?` button at the right of the sudden-death timer in every match opens the shared How to play dialog, with the rules first and each active player's effective keys, animated keycaps and looping movement/balloon demo underneath. Animations stop under reduced motion.

## Sound effects

Short synthesized Web Audio effects distinguish balloon pops, power-up pickups, and players getting soaked by a splash. The start countdown beeps on 3, 2 and 1 and plays a higher tone on go; each client derives the beeps from the countdown seconds in its own state, so guests hear them from snapshots. They play in CPU matches, local multiplayer, and online rooms. No audio assets or background music are downloaded.

Audio unlocks after a pointer or keyboard gesture. The match panel provides a toggleable speaker icon button with an accessible mute/unmute label, pressed state and a preference that persists. Concurrent effects are limited to six voices so chain reactions stay quiet enough to follow.

Numbered events travel in snapshots so guests do not miss a pop between broadcasts. Each client advances its playback cursor even while muted, skips historical events on joining a round, reconnecting, or returning from a hidden tab, and does not replay duplicates after host migration. Arena closure and departing players do not produce splash-hit sounds.

## Manual verification

- CPU match at each difficulty: bots break crates, collect power-ups, flee their own balloons, and sudden death starts at 2:00.
- Four browsers in one room: the room appears in the other browser's directory, and a guest's moves and balloons show on the host. Closing the host tab mid-match hands the game to the guest.
- Arena tiers: start rounds with 4, 5, 6, 7, and 8 contenders; verify dimensions, spawns, free movement, bot navigation, closure warnings, and canvas aspect ratio.
- Controls: rebind keys in Settings, then check CPU, local 2-player and online matches use them, the `?` guide shows the effective keys, Escape cancels a pending rebind without closing the dialog, closing the dialog releases key capture, and bindings survive a reload.
- Countdown: CPU, local 2-player and online rounds show 3, 2, 1 with a beep each and a go tone; inputs are ignored until it ends, and sudden death still starts 2:00 after it.
- Audio: pop a balloon, collect an item, and get hit by a splash; verify distinct sounds, chain reactions, mute persistence, and no duplicate playback online.
- Light and dark OS theme: the board redraws in the matching palette.
- Accounts: with a Supabase env, sign in; the header shows your name and a sign-out button, and the stats panel appears. Signed out or without env, neither shows and CPU play is unchanged.
- Stats: in a four-browser room (one signed in, three guests), finish a match; the signed-in user gets one `balloono_match_results` row and the guest none. Refresh or reconnect and replay the finished round id: still one row. Close the host tab mid-match: the new host's final state still records correct results. Leave mid-match: a loss row. The panel totals match the rows.
- Online lobby: fewer than four players cannot start; the fourth starts 30 seconds, the fifth adds five seconds, and a drop below four cancels. Check rejoining, a host leaving during the countdown, late joins near zero, spectator joins at eight seats, and returning to the lobby after a round. No online CPU or immediate-start controls appear.
- Leaderboard: signed out and signed in, compare the top 50 with aggregate results; verify ordering, pagination, refresh, empty and failed-request states, keyboard tab navigation and desktop layout. Confirm match-table reads still return only your own rows and the RPC reveals no account details. Without Supabase env the leaderboard explains that rankings are unavailable.
- CPU and local 2-player matches add no rows.
- Home: verify all three tabs with mouse and keyboard, create/join actions, immediately visible CPU settings, room countdown labels, compact/full stats, paginated rankings, the shared key-binding dialog and the interactive practice arena in light and dark themes. Verify movement and balloon drops for both players, crate breaking, power-ups, hit fades without elimination, reset, focus/pause, reduced motion and rebinding while the arena is unfocused. The header has no settings button.
- Device gate: phone portrait/landscape and touch-only tablet views show only the desktop-required message and open no room connections. A desktop viewport of at least 1024 pixels mounts the game; resizing across the threshold switches views without hydration errors.
