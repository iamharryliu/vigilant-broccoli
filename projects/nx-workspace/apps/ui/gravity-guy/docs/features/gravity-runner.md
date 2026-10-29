# Gravity runner

Gravity Guy is a locally playable single-player or two-player endless runner inspired by gravity-flipping arcade games, with original code-drawn visuals.

## Local play

From the repository root, install the pinned toolchain and dependencies if needed:

```sh
mise install
pnpm install
pnpm nx serve gravity-guy
```

Open <http://localhost:3000>. If that port is occupied, Next.js prints its selected port; alternatively run `pnpm nx serve gravity-guy --port=3017` and open <http://localhost:3017>. No environment files, accounts, backend, credentials or external services are required. Gameplay runs entirely in the browser after the local app loads; this release does not install a service worker or cache the app for disconnected cold starts.

From the repository root, check the app with:

```sh
pnpm nx lint gravity-guy
pnpm nx build gravity-guy
```

The production build includes TypeScript checking. Hosting, deployment targets, public URLs and service integration are deferred.

## Controls

- **Flip gravity:** press Space or ArrowUp once, or click/tap **Flip gravity**. Flips require contact with the supporting platform; midair inputs are ignored and are not queued.
- **Pause/resume:** press P or Escape while the playfield has focus, or use **Pause** / **Resume run**. Leaving the tab or window pauses automatically; return and explicitly resume.
- **Start/restart:** activate **Start running** / **Run again**.

The runner moves forward automatically. Land on horizontal platforms, follow the rising and falling staircases, and launch near platform edges to reach the longer gaps. Blocks and stair risers stop horizontal movement rather than killing the runner. Flip onto the opposite surface to clear them. The map continues scrolling at full pace while blocked; the pursuing Shiba ends the run when its body touches the runner. The dog predicts one second of possible routes, preferring progress and boost contacts while penalizing slow contacts and unsafe landings. Prediction shares the real collision integrator. The dog has its own gravity, velocity and platform collisions: it runs along surfaces, flips to avoid obstacles and gaps, and follows the player between floor and ceiling. If it falls out of the world or remains blocked offscreen for more than three seconds, it disappears for 2.5 seconds, then re-enters from a solid surface behind the player. Respawning checks for clear space and retries after 0.3 seconds if no safe spot is available. The dog cannot catch the player while absent. Its speed responds to its own supporting surface: a player-only boost makes the Shiba gradually drift off the left side rather than inheriting the boosted camera pace. It does not float beside the player or kill at an invisible left boundary. Falling into a late-course gap also ends the run. Only the explicit Flip control accepts pointer flips; menu actions and held keyboard repeats do not flip the runner. Buttons support normal keyboard activation and visible focus. Starting, resuming and clicking Flip return focus to the playfield.

## Local multiplayer

Open **Settings → Game mode → Two players on this device** and return to the game. Both runners share the same course, scrolling camera and pursuing Shiba. Player 1 uses Space or ArrowUp; Player 2 uses W. Independent touch buttons also accept simultaneous pointer input. Each player must land before flipping and has separate collision, slowdown, boost and recovery state. Both players start at the same horizontal center. Teal and blue sprites have plain floating numbers with no background or connectors. Number positions separate when players overlap or cross, without changing player positions; the dashboard shows both scores. The first player caught or lost ends the round and awards the win to the other; simultaneous losses tie. Pause, restart and tab visibility apply to both players. The dog pursues the runner farther behind and respawns safely behind both.

The Settings button opens `/settings`, which stores player count as `gravity-guy-players-v1` and preserves the appearance setting. Opening Settings pauses a live run and keeps its snapshot in session storage; returning resumes from the pause screen. Changing the player count discards that snapshot and prepares a fresh run.

## Course and scoring

Distance in metres is the score, using ten world units per metre. Speed rises smoothly from 440 to a capped 720 world units per second. The best completed distance persists under `gravity-guy-best-v1` in browser local storage. If storage is denied, the best remains available for the current session.

Each run gets a fresh random seed. The course is generated deterministically from that seed in 1,600-unit chunks, so collision geometry and drawing always agree. The first obstacle is at least 1,000 units away. The first 6,400 units have uninterrupted floor and ceiling, with sparse blocks and three- or four-step obstacles on one surface at a time. Base block heights range from 60 to 84 units, with rising, descending and alternating-height arrangements adding 18–26 units per step. Widths and side vary. Blocks use the same body and edge colours as platforms.

The [obstacle-area catalog](../../CONTEXT.md#obstacle-areas) records each area's layout, timing and generator. After 6,400 units, dedicated sections include narrow rising/descending/zigzag corridors and successive slow patches. Long boost runouts unlock at 9,600 units; short-platform zigzags unlock at 12,800. Once all types are eligible, seeded choices allocate 20% to continuous narrow corridors, 18% to slow gauntlets, 14% to boost runouts, 14% to short-platform zigzags, and the remainder to ordinary terrain.

Continuous narrow corridors use five 240-unit steps with 148 units of clearance and alternating 36-unit baffles. Slow gauntlets alternate three 360-unit patches between otherwise solid rails. Boost runouts pair long green strips with alternating rail gaps. Short-platform zigzags replace continuous safety rails with five 190-unit ledges and require launch timing to avoid falling.

Of the remaining ordinary chunks after 6,400 units, 22% may contain a gap instead of an obstacle. Gaps start at 120–179 units wide; after 12,800 units they may reach 299 units. The opposite rail remains intact, so flipping away from a gap is always possible. Longer jumps are optional rather than repeatedly forced. Progress and score stop while blocked, but the camera keeps moving; successful escape gradually eases the runner toward the horizontal center, with recovery speed capped at 40% above map pace and no overshoot. Collision checks cover the full catch-up movement, so rushing into another block stops the runner again. Viewport changes preserve the distance from center.

Ordinary green forward-chevron rail sections appear only after at least six obstacles across the current and previous two chunks, either after a block cluster or 80 units before a later gap. They smoothly accelerate the scrolling map by up to 30%, while helping the runner recover toward center. In two-player mode either runner can trigger the shared map acceleration. The base pace remains 440–720 units per second, with boosts reaching 936.

Purple backward-chevron strips sit in clear stretches between block patterns, starting 60 units after a cluster. They reduce only the runner to 65% of map pace, pulling them toward the Shiba; blocks themselves retain normal surfaces. Center recovery is suppressed while slowed, then resumes gradually after leaving. Neither kind of strip overlaps blocks. Continuous narrow corridors and short-platform zigzags contain no speed strips. Dedicated slow and boost areas use the layouts in the catalog.

## Settings and scenery

Each seed selects a futuristic city, space station, asteroid field or nebula. Canvas scenery uses deterministic details and two parallax layers, with theme-aware colours. **Settings → Appearance → Scenic backgrounds** disables scenery and restores the original grid. The preference persists as `gravity-guy-scenery-v1` in local storage when available and takes effect immediately without restarting a run.

Physics advances at 120 fixed steps per second. Frame accumulation is capped at 100 ms, so a long stall slows the simulation instead of teleporting through a platform. The boosted map moves forward at most 7.8 units per step. Boost and center recovery together keep runner movement below fourteen units per step, below player and obstacle widths. Landings check crossings against each platform's top and underside; flips require zero vertical velocity and actual overlap with the supporting face, so stepping off an edge removes the ability to flip immediately. Restart/resume clear accumulated timing. Unmount cancels animation and removes input/visibility listeners.

## Mobile play

Phones and touch tablets require landscape orientation to play. Portrait shows a rotate-device screen, makes the game controls inert and pauses any running game. Settings remains accessible from that screen. Rotating back requires an explicit resume. Landscape touch layouts fill the dynamic viewport, respect display safe areas and keep the HUD and large touch buttons visible without page scrolling. Flip buttons respond on pointer-down and accept independent simultaneous touches; keyboard activation remains supported.

The reusable `HowToPlay` component provides **Settings → How to play** and the bottom-left Help dialog, including pause keys. In-game controls use an icon-only Settings button at bottom-right, Help at bottom-left, and Music followed by Play/Pause at top-right. Opening Help pauses the run. Multiplayer flip buttons display their keyboard keys; accessible names retain player identity. The instructions live in **Settings → How to play**. The desktop version remains resizable without the orientation restriction. Local multiplayer shares one device; cross-device online play is not implemented.

## Audio

Successful keyboard or touch gravity flips play a soft, airy noise whoosh with no tonal chirp; rejected midair inputs stay silent. Contact with a boost platform plays a rising three-note cue; a slow platform plays a lower descending cue. These play once on each new contact rather than repeating while riding the same surface. Both players share the sound system. Each new run randomly selects one of three original tracks from its seed: a 112 BPM sci-fi pulse, a 136 BPM epic theme with fuller chords and driving percussion, or a gentle 76 BPM ambient piece with soft sine tones and no percussion. All tracks are synthesized locally with Web Audio rather than downloaded assets. The same run retains its track across pause/resume and settings navigation. Audio unlocks on a user gesture and music plays only during a running game; pause, game over and settings navigation stop it. Audio contexts and scheduled voices are cleaned up on unmount.

The playfield's top-right music button toggles music without pausing or restarting a run. **Settings → Audio** also provides independent music and game-effect toggles. Preferences persist as `gravity-guy-music-v1` and `gravity-guy-sounds-v1`. No audio starts on page load.

## Presentation and verification

The shared `ThemeProvider` tracks system appearance live, including canvas colours, without resetting a run. English copy uses shared `createI18n`; shared buttons provide accessible controls. Canvas artwork and SVG/opaque Apple PNG icons are original local assets. The playfield uses a minimum 680-unit logical view on narrow screens, preserving reaction time.

For visual review, start the app locally and run `pnpm screenshot:themes -- http://localhost:3000/` from the repository root. Review phone and desktop captures in both appearances. Manual gameplay review should cover keyboard and touch flips, different randomized runs, early safe rails, blocked movement and Shiba contact, escape from blocks and staircases, full-speed scrolling while blocked, gradual return to horizontal center at phone and desktop widths, speed effects and leftward drift on slow platforms, dog landings, flips and safe respawning, all three narrow corridor patterns at the speed cap, taller block variations, later gaps and long transfers, saved mode and scenery settings, settings navigation during a paused run, independent two-player controls and match outcomes, rejected midair flips, loss of contact at platform edges, paused score stability, blur/visibility pauses, restart timing, persisted best after reload, live theme changes and a throttled frame rate. Physical iOS/Android touch feel and Add to Home Screen icon appearance require device review.
