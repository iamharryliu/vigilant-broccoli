# Gravity runner

Gravity Guy is an endless runner with local single-player and two-player modes and online rooms for two to four players inspired by gravity-flipping arcade games, with original code-drawn visuals.

## Local play

From the repository root, install the pinned toolchain and dependencies if needed:

```sh
mise install
pnpm install
pnpm nx serve gravity-guy
```

Open <http://localhost:3000>. If that port is occupied, Next.js prints its selected port; alternatively run `pnpm nx serve gravity-guy --port=3017` and open <http://localhost:3017>. Local play needs no environment files, accounts, backend, credentials or external services. Online play uses the shared Supabase public configuration from `next.config.js`. Local gameplay runs entirely in the browser after the app loads; this release does not install a service worker or cache the app for disconnected cold starts.

From the repository root, check the app with:

```sh
pnpm nx lint gravity-guy
pnpm nx build gravity-guy
```

The production build includes TypeScript checking. The application is deployed on Vercel using the staging and production targets below.

## Deployment

| Environment | Nx command from repository root | Vercel project | URL | Access |
| --- | --- | --- | --- | --- |
| Production | `pnpm nx run gravity-guy:deploy:production` | `production-gravity-guy` | <https://gravity-guy.harryliu.dev/> | Public |
| Staging | `pnpm nx deploy gravity-guy` | `staging-gravity-guy` | <https://staging-gravity-guy.vercel.app/> | Vercel team authentication |

The build target explicitly sets `NODE_ENV=production` so Nx task environment defaults cannot make the prerender use a development React runtime. Targets use `scripts/deploy-vercel.ts`, which creates the project on first deploy, applies the shared Next.js build settings and uploads prebuilt output. The common workflow deploys staging on affected `main` pushes and production on `production` branch pushes; the manual app workflow can deploy either environment. Staging monitoring expects an anonymous HTTP 302 without following redirects; production expects HTTP 200.

Terraform manages the production `gravity-guy.harryliu.dev` DNS-only CNAME in `cloudflare-vercel-apps.tf`. Its post-apply domain sync attaches the hostname to `production-gravity-guy`; Vercel serves HTTPS.

Gravity Guy remains stateless on the server. There are no API routes, database tables, server sessions or application secrets. Online rooms use Supabase Realtime with the shared public URL and publishable key supplied at build time; no sign-in or OAuth redirect configuration is needed. Local game state stays inside one browser; best scores and settings use local storage, and paused-run snapshots use session storage. Staging and production use different origins, so browser data does not transfer between them. Only the existing Vercel deployment token is needed by the deployment runner; it is never sent to the game.

## Free Tier

Gravity Guy uses two Vercel projects and shares the existing Hobby allowance: 200 projects, 100 deployments per day, 100 GB Fast Data Transfer, 10 GB Fast Origin Transfer and 1 million CDN requests per month. The game serves prerendered pages and local canvas/audio assets, with no database or persistent compute service. Its custom hostname uses the existing Cloudflare Free DNS zone and adds no paid service. Hobby is for personal, non-commercial use; exceeding a usage allowance can pause that feature. Limits: [Vercel Hobby](https://vercel.com/docs/plans/hobby).

Online play also shares the existing Supabase Free project: 200 peak Realtime connections, 100 messages/second and 2 million Realtime messages/month across the organization. One four-player round sends 600 snapshots/minute; counting the host send and three guest deliveries, that is approximately 2,400 messages/minute before inputs and presence. A browser uses one Realtime connection with directory and room channels; no new project, database tables or paid service is added. These allowances are shared with Balloono and other consumers, not reserved for this game. Sources: [Supabase billing quotas](https://supabase.com/docs/guides/platform/billing-on-supabase), [Realtime limits](https://supabase.com/docs/guides/realtime/limits).

## Online multiplayer

Select **Play online** on the ready, paused or results screen. Matchmaking packs waiting players in arrival order into groups of four, consolidating partially filled rooms before opening another group. At least two seated players trigger a five-second countdown. Countdown rooms retain their occupants and keep admitting runners up to four without resetting the deadline. The round starts with the actual two, three or four seated players. Dropping below two cancels the countdown; reaching two again starts a fresh five seconds. Simultaneous excess joins return to matchmaking. Running rounds do not accept new players. The top-left leave icon is shared by the play view and waiting room. It asks **Are you sure you want to leave?**; **Stay in game** or Escape dismisses it without leaving, while **Leave game** returns to local play and restores any saved paused local run. Online rounds continue while the confirmation is open; **Back to matchmaking** starts a fresh search after a round.

Each browser gets a new random presence identity, so separate tabs can occupy separate seats. Room discovery uses a shared presence directory (`gravity-guy-directory`), and room presence, inputs and snapshots use `gravity-guy-room:<room>`. Like Balloono, the elected browser host runs the authoritative simulation and guests send flip requests. The established host remains in charge until it leaves; a remaining client continues the latest snapshot and eliminates departed players. A silent host triggers a connection warning after eight seconds; use the retry action to start a new search if its presence has not expired. Rooms and their directory entries disappear when their channels disconnect. Restoring a tab from the browser back-forward cache retracks its presence and requests a current snapshot. Nothing is persisted to a database.

All seated runners share the course, camera and Shiba. Space, ArrowUp, the Flip button or a playfield tap controls only your numbered runner. Flips still require supporting contact. Caught, fallen or departed players are eliminated; the last surviving runner wins, and simultaneous elimination is a tie. Eliminated players can spectate. Online rounds cannot be individually paused, do not overwrite local bests and do not restore from local paused-run storage. Background-tab scheduling or network latency can affect the browser host; this is casual, client-hosted multiplayer without server-enforced anti-cheat. Public presence and broadcast payloads are not an authenticated identity or trusted competition boundary.

The host advances the existing 120 Hz physics and broadcasts snapshots at 10 Hz; guests interpolate visual positions between snapshots without modifying authoritative state. Every device renders the same 680-unit logical viewport, so phone and desktop canvas sizes cannot change collisions or the shared camera. Existing independent music and effects preferences apply online; use **Enable audio** after joining if the browser requires a fresh gesture.

Manual verification: open five separate browser contexts, join simultaneously and confirm one four-seat round plus a waiting room; verify one player waits, two start a countdown, third and fourth arrivals keep its deadline, and two- and three-player rooms start. Drop to one during countdown, verify cancellation, then refill and verify a fresh countdown. During a round, send guest flips and verify all clients agree, leave with the host and verify continued progress and elimination, then check results, replay and channel cleanup. Also exercise offline/reconnect handling, disabled audio preferences and phone/desktop rendering. An unavailable Supabase connection must show an error rather than quietly substituting a local game.

## Controls

- **Flip gravity:** press Space or ArrowUp once, or click/tap **Flip gravity**. Flips require contact with the supporting platform; midair inputs are ignored and are not queued.
- **Pause/resume:** press P or Escape while the playfield has focus, or use **Pause** / **Resume run**. Leaving the tab or window pauses automatically; return and explicitly resume.
- **Start/restart:** activate **Start running** / **Run again**.

The runner moves forward automatically. Land on horizontal platforms, follow the rising and falling staircases, and launch near platform edges to reach the longer gaps. Blocks and stair risers stop horizontal movement rather than killing the runner. Flip onto the opposite surface to clear them. The map continues scrolling at full pace while blocked; the pursuing Shiba ends the run when its body touches the runner. The dog predicts one second of possible routes, preferring progress and boost contacts while penalizing slow contacts and unsafe landings. Prediction shares the real collision integrator. The dog has its own gravity, velocity and platform collisions: it runs along surfaces, flips to avoid obstacles and gaps, and follows the player between floor and ceiling. If it falls out of the world or remains blocked offscreen for more than three seconds, it disappears for 2.5 seconds, then re-enters from a solid surface behind the player. Respawning checks for clear space and retries after 0.3 seconds if no safe spot is available. The dog cannot catch the player while absent. On ordinary surfaces, the dog moves at the same rising base pace as an unobstructed runner, including within hunting range. It has no passive pursuit speed bonus: blocks, slow strips and missed transfers let it close the gap, while returning to clear running stops further ordinary-surface losses. Route prediction uses the same base pace and surface multipliers as actual dog movement. Its speed responds to its own supporting surface: a player-only boost makes the Shiba gradually drift off the left side rather than inheriting the boosted camera pace. It does not float beside the player or kill at an invisible left boundary. Falling into a late-course gap also ends the run. Only the explicit Flip control accepts pointer flips; menu actions and held keyboard repeats do not flip the runner. Buttons support normal keyboard activation and visible focus. Starting, resuming and clicking Flip return focus to the playfield.

## Local multiplayer

Open **Settings → Game mode → Two players on this device** and return to the game. Both runners share the same course, scrolling camera and pursuing Shiba. Player 1 uses Space or ArrowUp; Player 2 uses W. Independent touch buttons also accept simultaneous pointer input. Each player must land before flipping and has separate collision, slowdown, boost and recovery state. Both players start at the same horizontal center. Teal and blue sprites have plain floating numbers with no background or connectors. Number positions separate when players overlap or cross, without changing player positions; the dashboard shows both scores. The first player caught or lost ends the round and awards the win to the other; simultaneous losses tie. Pause, restart and tab visibility apply to both players. The dog targets the living runner nearest by body separation and respawns safely behind both.

The Settings button opens `/settings`, which stores player count as `gravity-guy-players-v1` and preserves the appearance setting. Opening Settings pauses a live run and keeps its snapshot in session storage; returning resumes from the pause screen. Changing the player count discards that snapshot and prepares a fresh run.

## Course and scoring

Distance in metres is the score, using ten world units per metre. Speed rises smoothly from 440 to a capped 720 world units per second. The best completed distance persists under `gravity-guy-best-v1` in browser local storage. If storage is denied, the best remains available for the current session.

Each run gets a fresh random seed. The course is generated deterministically from that seed in 1,600-unit chunks, so collision geometry and drawing always agree. The first obstacle is at least 1,000 units away. The first 6,400 units have uninterrupted floor and ceiling, with sparse blocks and three- or four-step obstacles on one surface at a time. Base block heights range from 60 to 84 units, with rising, descending and alternating-height arrangements adding 18–26 units per step. Widths and side vary. Blocks use the same body and edge colours as platforms.

The [obstacle-area catalog](../../CONTEXT.md#obstacle-areas) records each area's layout, timing and generator. After 6,400 units, dedicated sections include narrow rising/descending/zigzag corridors and successive slow patches. Long boost runouts unlock at 9,600 units; short-platform zigzags unlock at 12,800. Once all types are eligible, seeded choices allocate 20% to continuous narrow corridors, 18% to slow gauntlets, 14% to boost runouts, 14% to short-platform zigzags, and the remainder to ordinary terrain.

Continuous narrow corridors use five 240-unit steps with 148 units of clearance and alternating 36-unit baffles. Slow gauntlets alternate three 360-unit patches between otherwise solid rails. Boost runouts pair long green strips with alternating rail gaps. Short-platform zigzags replace continuous safety rails with five 190-unit ledges and require launch timing to avoid falling.

Of the remaining ordinary chunks after 6,400 units, 22% may contain a gap instead of an obstacle. Gaps start at 120–179 units wide; after 12,800 units they may reach 299 units. The opposite rail remains intact, so flipping away from a gap is always possible. Longer jumps are optional rather than repeatedly forced. Progress and score stop while blocked, but the camera keeps moving; successful escape gradually eases the runner toward the horizontal center, with recovery speed capped at 40% above map pace and no overshoot. Collision checks cover the full catch-up movement, so rushing into another block stops the runner again. Viewport changes preserve the distance from center.

Ordinary green forward-chevron rail sections appear only after at least six obstacles across the current and previous two chunks, either after a block cluster or 80 units before a later gap. They smoothly accelerate the scrolling map by up to 30%, while helping the runner recover toward center. In two-player mode either runner can trigger the shared map acceleration. The base pace remains 440–720 units per second, with boosts reaching 936.

Purple backward-chevron strips sit in clear stretches between block patterns, starting 60 units after a cluster. They reduce only the runner to 65% of map pace, pulling them toward the Shiba; blocks themselves retain normal surfaces. Center recovery is suppressed while slowed, then resumes gradually after leaving. Neither kind of strip overlaps blocks. Continuous narrow corridors and short-platform zigzags contain no speed strips. Dedicated slow and boost areas use the layouts in the catalog.

The pursuing Shiba has black fur, cream markings and a metal jetpack with cyan exhaust animated by its travel. Every few seconds it opens its mouth, emits bark lines and displays “WOOF!”; the animation pauses with the run. Each bark also plays a short synthesized woof when game sound effects are enabled. When a player comes within 220 horizontal units of its nose, it favors routes toward that player and immediate catches over speed strips and safe future landings, and can chase forward from the left edge. In multiplayer it targets the nearest player by body separation. Farther away it resumes terrain and speed-strip planning. The cosmetic pack follows the dog’s gravity orientation and does not change terrain collisions or chase speed.

## Settings and scenery

The Settings header keeps a ghost arrow icon for **Back to game** at the top right while scrolling, with an accessible label and 44-pixel touch target. Settings use selectable Game mode, Appearance, Audio and How to play sections with full-row touch controls and safe-area padding. On touch devices the header and section navigation stay visible, and longer section content scrolls inside a bounded panel.

Each seed selects a futuristic city, space station, asteroid field or nebula. Canvas scenery uses deterministic details and two parallax layers, with theme-aware colours. **Settings → Appearance → Scenic backgrounds** disables scenery and restores the original grid. The preference persists as `gravity-guy-scenery-v1` in local storage when available and takes effect immediately without restarting a run.

Physics advances at 120 fixed steps per second. Frame accumulation is capped at 100 ms, so a long stall slows the simulation instead of teleporting through a platform. The boosted map moves forward at most 7.8 units per step. Boost and center recovery together keep runner movement below fourteen units per step, below player and obstacle widths. Landings check crossings against each platform's top and underside; flips require zero vertical velocity and actual overlap with the supporting face, so stepping off an edge removes the ability to flip immediately. Shiba contact, falling above or below the map, or touching its left edge ends the run and shows the final score with **Run again**. In multiplayer the first eliminated player loses; simultaneous eliminations tie. **Run again** starts a fresh course and resets both players, the camera, Shiba and score while preserving preferences and best score. Restart/resume clear accumulated timing. Unmount cancels animation and removes input/visibility listeners.

## Mobile play

All routes and views on coarse-pointer devices require landscape, including Settings, Help, local ready/pause/results and online waiting/countdown/errors/results. A shared accessible portrait prompt makes the underlying content inert without unmounting it. Desktop resizing remains unrestricted. Local runs pause on rotation and require explicit Resume when landscape returns; local keyboard and touch flips are blocked in portrait. Online entry is available through the landscape local screen only. Once joined, rotation keeps the room, presence, countdown and host simulation alive: the online round continues for everyone and this device cannot flip until landscape returns. Rotation never pauses other runners or silently leaves a room.

Landscape touch layouts fill the dynamic viewport. Local play uses the full playfield; online play keeps a compact leave/audio toolbar, status, playfield or game-like lobby, flip control and scores in the viewport. Safe-area insets protect controls. Settings and Help use bounded internal scrolling for longer instructions rather than hiding content or reducing all text. No orientation lock, fullscreen permission or browser zoom restriction is required. Tap anywhere on the canvas to flip in single-player; in local multiplayer the left half flips Player 1 and the right half flips Player 2. Pointer-down controls accept independent simultaneous touches; desktop flip buttons and keyboard activation remain supported.

The reusable `HowToPlay` component provides **Settings → How to play** and the bottom-left Help dialog, including pause keys. In-game controls use an icon-only Settings button at bottom-right, Help at bottom-left, and Music followed by Play/Pause at top-right. Opening Help pauses the run. Multiplayer flip buttons display their keyboard keys; accessible names retain player identity. The instructions live in **Settings → How to play**. The desktop version remains resizable without the orientation restriction. Local multiplayer shares one device; the separate online mode connects two to four browsers through Supabase Realtime.

## Audio

Successful keyboard or touch gravity flips play a soft, airy noise whoosh with no tonal chirp; rejected midair inputs stay silent. Contact with a boost platform plays a rising three-note cue; a slow platform plays a lower descending cue. These play once on each new contact rather than repeating while riding the same surface. The Shiba’s woof plays once when each bark animation starts, using a falling pitched voice mixed with filtered noise. It follows the game sound-effects toggle independently of music and requires audio unlocked by a user gesture. Both players share the sound system. Each new run randomly selects one of three original tracks from its seed: a 112 BPM sci-fi pulse, a 136 BPM epic theme with fuller chords and driving percussion, or a gentle 76 BPM ambient piece with soft sine tones and no percussion. All tracks are synthesized locally with Web Audio rather than downloaded assets. The same run retains its track across pause/resume and settings navigation. Audio unlocks on a user gesture and music plays only during a running game; pause, game over and settings navigation stop it. Audio contexts and scheduled voices are cleaned up on unmount.

The playfield's top-right music button toggles music without pausing or restarting a run. **Settings → Audio** also provides independent music and game-effect toggles. Preferences persist as `gravity-guy-music-v1` and `gravity-guy-sounds-v1`. No audio starts on page load.

- Start, Resume, the music button and running-game flip input retry audio activation directly in the input handler.
- Music waits for the context to be running; effects that occur before readiness are dropped rather than replayed later.
- Pause, game over and navigation stop scheduled effect voices as well as music; disabling effects stops only effect voices.
- An audio interruption pauses the run; returning from the background requires explicit Resume. Resume retries suspended or interrupted contexts, while the scheduler avoids replaying missed beats.
- Browser or operating-system audio restrictions, device volume and output routing still apply; physical iOS Safari and Android Chrome audibility require device verification.

Browser references: [Chrome Web Audio autoplay policy](https://developer.chrome.com/blog/web-audio-autoplay) and [audio context interruption states](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state).

## Presentation and verification

The shared `ThemeProvider` tracks system appearance live, including canvas colours, without resetting a run. English copy uses shared `createI18n`; shared buttons provide accessible controls. Canvas artwork and SVG/opaque Apple PNG icons are original local assets. The playfield uses a minimum 680-unit logical view on narrow screens, preserving reaction time.

For visual review, start the app locally and run `pnpm screenshot:themes -- http://localhost:3000/` from the repository root. Review phone and desktop captures in both appearances. Manual gameplay review should cover keyboard and touch flips, different randomized runs, early safe rails, blocked movement and Shiba contact, escape from blocks and staircases, full-speed scrolling while blocked, gradual return to horizontal center at phone and desktop widths, speed effects and leftward drift on slow platforms, dog landings, flips and safe respawning, all three narrow corridor patterns at the speed cap, taller block variations, later gaps and long transfers, saved mode and scenery settings, settings navigation during a paused run, independent two-player controls and match outcomes, rejected midair flips, loss of contact at platform edges, paused score stability, blur/visibility pauses, restart timing, persisted best after reload, live theme changes and a throttled frame rate. Physical iOS/Android touch feel and Add to Home Screen icon appearance require device review.
