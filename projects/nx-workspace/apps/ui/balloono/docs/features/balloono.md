# Balloono

A Bomberman-style arena game at `balloono.harryliu.dev`: drop water balloons, soak rivals, be the last one dry. Play online in rooms or offline against CPU opponents.

## Table of Contents

- [Rules](#rules)
- [Engine](#engine)
- [CPU opponents](#cpu-opponents)
- [Online rooms](#online-rooms)
- [Controls](#controls)
- [Sound effects](#sound-effects)
- [Manual verification](#manual-verification)

## Rules

- Arena size is selected at the start of each round: 13×11 for 1–4 contenders, 15×13 for 5–7, and 17×15 for 8. Humans, local players, and CPUs count; spectators do not. Dimensions stay fixed if players leave and are recalculated for the next round.
- Fixed pillars and random crates fill the arena. Spawns occupy the four corners and the middle of each edge, with neighbouring tiles kept clear around occupied spawns. Up to eight players, human or CPU.
- A balloon pops 2.5 s after it is dropped and splashes in a plus shape up to its range, which starts at one tile. The splash stops at pillars, and also at the first crate it breaks. It sets off any balloon it reaches. Power-ups stay until a player picks them up.
- Broken crates can reveal a power-up: extra balloon, bigger splash, or faster feet.
- Anyone standing in a splash is soaked and out. The last player dry wins the round. Wins are counted per session or per room.
- After 2 minutes, sudden death walls the arena in on a spiral, one tile at a time. Tiles about to close flash red. This ends cautious stalemates.

## Engine

`src/app/engine/` is pure TypeScript with no React and no network, so the same code runs the local game and an online host.

- Match state carries its arena dimensions, round id, and a two-second history of numbered pop, pickup, and splash-hit events. Board helpers, CPU paths, closure order, and canvas rendering use those dimensions.
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
- **Host-authoritative:** the host's browser runs the simulation, including CPU seats. It broadcasts a state snapshot every other tick. Guests send input only when it changes, and their canvas eases toward each snapshot.
- **Host migration:** the host is whoever the last snapshot named, while they are still present. Otherwise it is the earliest joiner. A newcomer waits 1.5 s before claiming the role, so a fast clock cannot steal it. If the host leaves mid-match, the next host continues from the last snapshot. Players who left are soaked.
- **Room directory:** Realtime cannot list channels, so each host advertises its room as presence on `balloono-directory`. The home screen lists those rooms.
- **Player identity:** player ids are per page load, so two tabs never collide. Only the name is stored.

Rooms are anonymous by design, like the standalone whiteboard: anyone who knows a room name can join it or spoof messages in it.

Without `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (for example, a plain local `nx serve`), the online card explains that rooms are unavailable. CPU play still works.

## Controls

- Keyboard: arrow keys or WASD to move, Space, Enter or X to drop a balloon. The most recently pressed held direction wins.
- Local second player (Versus CPU only): ticking **Add local player** gives player 1 the arrow keys and Enter, and player 2 WASD and Space. It leaves room for six CPUs.
- Touch: an on-screen pad and balloon button, shown on coarse pointers and on screens narrower than 768 px.

## Sound effects

Short synthesized Web Audio effects distinguish balloon pops, power-up pickups, and players getting soaked by a splash. They play in CPU matches, local multiplayer, and online rooms. No audio assets or background music are downloaded.

Audio unlocks after a pointer or keyboard gesture. The match panel provides a mute/unmute button whose preference persists. Concurrent effects are limited to six voices so chain reactions stay quiet enough to follow.

Numbered events travel in snapshots so guests do not miss a pop between broadcasts. Each client advances its playback cursor even while muted, skips historical events on joining a round, reconnecting, or returning from a hidden tab, and does not replay duplicates after host migration. Arena closure and departing players do not produce splash-hit sounds.

## Manual verification

- CPU match at each difficulty: bots break crates, collect power-ups, flee their own balloons, and sudden death starts at 2:00.
- Two browsers in one room: the room appears in the other browser's directory, and a guest's moves and balloons show on the host. Closing the host tab mid-match hands the game to the guest.
- Arena tiers: start rounds with 4, 5, 6, 7, and 8 contenders; verify dimensions, spawns, free movement, bot navigation, closure warnings, and canvas aspect ratio.
- Audio: pop a balloon, collect an item, and get hit by a splash; verify distinct sounds, chain reactions, mute persistence, mobile gesture unlock, and no duplicate playback online.
- Light and dark OS theme: the board redraws in the matching palette.
- Phone: the touch pad moves the player, and holding a direction keeps walking.
