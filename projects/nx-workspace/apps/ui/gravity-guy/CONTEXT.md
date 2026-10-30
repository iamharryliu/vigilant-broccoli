# Agent Context — Gravity Guy

Gameplay constraints and obstacle-area catalog for Gravity Guy.

## Table of Contents

- [Course generation](#course-generation)
- [UI conventions](#ui-conventions)
- [Obstacle areas](#obstacle-areas)

## Course generation

- Keep this catalog synchronized with `src/app/engine.ts`; user-facing behavior and operating instructions live in [gravity-runner.md](./docs/features/gravity-runner.md).
- Preserve the forgiving opening: no gaps or dedicated challenge areas before 6,400 world units. All platform surfaces remain horizontal.
- Flips require actual supporting contact. Check area entry, internal transfers and exit at the 440 starting pace, 720 base cap and 936 boosted pace; a missing landing must remain a real fall risk in short-platform areas.
- Speed strips stay separate from solid blocks. A runner's boost accelerates the map, while each actor's own contact determines its movement multiplier; never copy the camera's boost onto the Shiba.
- Keep the Shiba's route prediction and real movement on the same collision integrator. Preserve delayed, collision-free respawning when it falls or remains stranded.
- Keep full-height approach/exit space where specified so independently generated neighboring chunks connect. The seed must produce identical collision and drawing geometry.

## UI conventions

- Every button, including new ones and dialog buttons, gets the shared subtle hover lift and brightness change from `global.css` (hover-capable devices only, disabled buttons excluded, removed under reduced motion). Extend that selector rather than adding per-button hover styles. Radio blocks rendered as labels, such as the player-count picker, are listed in the same rule.
- Every page plays music unless the Background music setting is off. Non-run screens (home, player picker, online lobby, settings) use the calm track via `CALM_MUSIC_SEED`; runs use their own seeded track. Call `useUnlockOnInteraction` with the page's `unlock` on any new screen, because browsers block audio until the first tap or key press.
- Home, picker, online lobby and settings share the nebula backdrop with fixed light text. The Scenic backgrounds setting must flatten all of them: each page's `<main>` carries `data-scenery`, and `global.css` swaps the backdrop for plain dark navy when it is `off`. New screens need the attribute and an entry in that rule.
- Every screen renders inside `GameCard` with a fixed 86px blank top bar, a fixed 86px bottom bar and a 400px middle section (330px at 600px wide or narrower). Register a new screen's middle element in the `.game-card >` height rule in `global.css` or its height drifts from the others. Phone landscape drops the bars and fills the viewport.
- Keep the top and bottom bars blank apart from the flip button. Leave, music, audio and pause controls overlay the middle section.
- Keep screen copy minimal: no status badges, hint lines or instructions on screens. Instructions live in the Guide and help dialog; the home screen carries brief lore. Delete a string from `en.json` when its UI goes.
- Buttons are blocky: 6px radius, bold text, 44px minimum tap target, icon buttons 44×44. Outline buttons render light-on-light over the dark nebula screens, so those screens style their buttons explicitly.
- Per-player input is Space/↑, W, J and L; touch tap areas (halves, then quadrants) show only on coarse pointers. Adding a player means changing the key table, the tap-zone table and `playerAccent` together. `playerAccent` is the only source of player colours, shared by the canvas, `RunnerSprite` and the controls.
- Sprite animations (`RunnerSprite`, `ShibaSprite`) must stop under `prefers-reduced-motion`.
- Leaving an online room skips the confirmation dialog when the player is alone and no run is active.

## Obstacle areas

| Area | Layout | Required action and failure | First eligible distance | Generator |
| --- | --- | --- | --- | --- |
| Basic block cluster | One tall block on floor or ceiling; 60–84-unit base height. | Flip around the block; getting stuck lets the Shiba catch up. | 1,000 units | `chunkPlan` |
| Boost recovery | A separate 220-unit green strip after at least six recent obstacles. | Recover lost ground; the map accelerates while the Shiba only boosts on its own strip. | 3,200 units, subject to obstacle count | `platformsNear` |
| Boost runout | Long 580- and 380-unit green stretches lead toward alternating floor/ceiling gaps, with 80 clear units before each edge. | Flip before the boosted rail ends; late launches fall into the void. | 9,600 units | `boostRunoutPlatforms` |
| Broken rail gap | One interrupted rail; the opposite rail stays intact. | Leave the broken side before losing contact. | 6,400 units | `chunkPlan` |
| Narrow ascending corridor | Five 240-unit corridor steps climb from bottom toward top, with alternating baffles. | Alternate landing surfaces quickly to pass each obstruction. | 6,400 units | `narrowPlatforms`, variant 0 |
| Narrow descending corridor | Five 240-unit corridor steps descend from top toward bottom, with alternating baffles. | Time alternating flips without getting trapped on a riser. | 6,400 units | `narrowPlatforms`, variant 1 |
| Narrow zigzag corridor | A continuous narrow corridor rapidly shifts up and down, with alternating baffles. | Reverse gravity repeatedly; hesitation loses ground to the Shiba. | 6,400 units | `narrowPlatforms`, variant 2 |
| Short-platform zigzag | Five 220-unit ledges alternate vertically, with 30-unit gaps and no continuous safety rail. The first ledge is flush with the entry block. | Launch while touching each ledge and catch the next; missed timing causes a fall. | 12,800 units | `shortZigzagPlatforms` |
| Slow gauntlet | Three successive 360-unit purple patches alternate between floor and ceiling; both rails remain solid. | Flip back and forth into the clear windows to avoid prolonged slowing. | 6,400 units | `slowGauntletPlatforms` |
| Slow interlude | A separate 200-unit purple strip between block patterns, 60 units beyond a cluster. | Change surfaces to avoid drifting toward the Shiba; blocks remain normal. | 1,600 units | `platformsNear` |
| Staircase blocks | Three or four blocks rise, descend or alternate heights on one side. | Flip around the shape rather than waiting against a step. | 1,600 units | `chunkPlan` |
| Warm-up runway | Continuous floor and ceiling with a clear initial approach. | Learn contact-only flips without falling off. | Start | `chunkPlan` |
