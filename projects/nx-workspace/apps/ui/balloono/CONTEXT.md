# Agent Context — apps/ui/balloono

## Table of Contents

- [Nuances](#nuances)
  - [CPU balance measured without shuffled spawn slots is misleading](#cpu-balance-measured-without-shuffled-spawn-slots-is-misleading)

## Nuances

Non-obvious traps in this directory — read the relevant entry **before**
working on the surface it names, not only when something breaks.
[nuance-pattern.md](../../../../../docs/nuance-pattern.md) is the convention.

### CPU balance measured without shuffled spawn slots is misleading

When tuning `BOT_PROFILES` in `src/app/engine/cpu.ts`, a headless
CPU-vs-CPU loop (`createMatch` → `decideCpuInput` → `advanceMatch` until
`status` is `over`) is the only practical measure. Spawn slot alone can swing
the result, though: four identical easy bots once won 14 of 20 matches from
slot 0. Slot 0 spawns top-left, where the sudden-death spiral in `board.ts`
starts. Together with tie-breaking in `neighbours` order, that decided the
endgame regardless of skill. An early run with hard always in slot 0 reported
hard beating medium 37–3; with slots shuffled it was close to even.

Two traps also came out of that tuning, and both are now guarded in code:

- `isCalm` uses `CALM_HORIZON_TICKS` rather than "no danger at all". Once
  sudden death schedules every tile, nothing is ever fully calm, and bots
  stopped playing.
- Crate and enemy targets require `canEscapeAfterDrop` from the target tile.
  Otherwise a bot walks into a pocket where it cannot safely drop, then idles
  there until the walls close.

Always shuffle contender order when measuring. Also count draws separately:
the last tiles closing on everyone end about a third of bot-only matches.
