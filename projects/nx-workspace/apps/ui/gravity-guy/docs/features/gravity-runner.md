# Gravity runner

Gravity Guy is a single-player, locally playable endless runner inspired by gravity-flipping arcade games, with original code-drawn visuals.

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

- **Flip gravity:** press Space or ArrowUp once, or click/tap **Flip gravity**. Midair reversals are allowed.
- **Pause/resume:** press P or Escape while the playfield has focus, or use **Pause** / **Resume run**. Leaving the tab or window pauses automatically; return and explicitly resume.
- **Start/restart:** activate **Start running** / **Run again**.

The runner moves forward automatically. Land on either rail, avoid striped blocks and flip away from dashed gaps before falling into the void. Only the explicit Flip control accepts pointer flips; menu actions and held keyboard repeats do not flip the runner. Buttons support normal keyboard activation and visible focus. Starting, resuming and clicking Flip return focus to the playfield.

## Course and scoring

Distance in metres is the score, using ten world units per metre. Speed rises smoothly from 240 to a capped 360 world units per second. The best completed distance persists under `gravity-guy-best-v1` in browser local storage. If storage is denied, the best remains available for the current session.

The repeating course uses eight authored segments, each 720 units long, with one floor or ceiling hazard. Barriers are 100 units wide and gaps 190; the opposite rail is always clear. At maximum speed the narrowest view shows approaching hazards for about 1.5 seconds. Even after a gap, at least 530 clear units separate successive hazards, leaving time to cross the 324-unit corridor. There is no random generation or forced impossible combination.

Physics advances at 120 fixed steps per second. Frame accumulation is capped at 100 ms, so a long stall slows the simulation instead of teleporting through a hazard. Each step moves forward at most three units, below both the runner and hazard widths. Rail landing checks crossings; gap edges cannot catch a runner who has already fallen below a rail. Restart/resume clear accumulated timing. Unmount cancels animation and removes input/visibility listeners.

## Presentation and verification

The shared `ThemeProvider` tracks system appearance live, including canvas colours, without resetting a run. English copy uses shared `createI18n`; shared buttons provide accessible controls. Canvas artwork and SVG/opaque Apple PNG icons are original local assets. The playfield uses a minimum 680-unit logical view on narrow screens, preserving reaction time.

For visual review, start the app locally and run `pnpm screenshot:themes -- http://localhost:3000/` from the repository root. Review phone and desktop captures in both appearances. Manual gameplay review should cover keyboard and touch flips, a full eight-segment cycle, gaps and barriers, paused score stability, blur/visibility pauses, restart timing, persisted best after reload, live theme changes and a throttled frame rate. Physical iOS/Android touch feel and Add to Home Screen icon appearance require device review.
