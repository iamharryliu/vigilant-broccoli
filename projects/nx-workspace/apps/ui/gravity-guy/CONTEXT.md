# Agent Context — Gravity Guy

Gameplay constraints and obstacle-area catalog for Gravity Guy.

## Table of Contents

- [Course generation](#course-generation)
- [Obstacle areas](#obstacle-areas)

## Course generation

- Keep this catalog synchronized with `src/app/engine.ts`; user-facing behavior and operating instructions live in [gravity-runner.md](./docs/features/gravity-runner.md).
- Preserve the forgiving opening: no gaps or dedicated challenge areas before 6,400 world units. All platform surfaces remain horizontal.
- Flips require actual supporting contact. Check area entry, internal transfers and exit at the 440 starting pace, 720 base cap and 936 boosted pace; a missing landing must remain a real fall risk in short-platform areas.
- Speed strips stay separate from solid blocks. A runner's boost accelerates the map, while each actor's own contact determines its movement multiplier; never copy the camera's boost onto the Shiba.
- Keep the Shiba's route prediction and real movement on the same collision integrator. Preserve delayed, collision-free respawning when it falls or remains stranded.
- Keep full-height approach/exit space where specified so independently generated neighboring chunks connect. The seed must produce identical collision and drawing geometry.

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
| Short-platform zigzag | Five 190-unit ledges alternate vertically, with 40-unit gaps and no continuous safety rail. | Launch while touching each ledge and catch the next; missed timing causes a fall. | 12,800 units | `shortZigzagPlatforms` |
| Slow gauntlet | Three successive 360-unit purple patches alternate between floor and ceiling; both rails remain solid. | Flip back and forth into the clear windows to avoid prolonged slowing. | 6,400 units | `slowGauntletPlatforms` |
| Slow interlude | A separate 200-unit purple strip between block patterns, 60 units beyond a cluster. | Change surfaces to avoid drifting toward the Shiba; blocks remain normal. | 1,600 units | `platformsNear` |
| Staircase blocks | Three or four blocks rise, descend or alternate heights on one side. | Flip around the shape rather than waiting against a step. | 1,600 units | `chunkPlan` |
| Warm-up runway | Continuous floor and ceiling with a clear initial approach. | Learn contact-only flips without falling off. | Start | `chunkPlan` |
