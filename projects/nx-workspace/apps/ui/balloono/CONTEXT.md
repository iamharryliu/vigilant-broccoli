# Agent Context — apps/ui/balloono

## Table of Contents

- [Nuances](#nuances)
  - [CPU balance measured without shuffled spawn slots is misleading](#cpu-balance-measured-without-shuffled-spawn-slots-is-misleading)
  - [Chain-reaction soaks credit the root balloon's owner](#chain-reaction-soaks-credit-the-root-balloons-owner)

## Nuances

### CPU balance measured without shuffled spawn slots is misleading

Measure `BOT_PROFILES` (`src/app/engine/cpu.ts`) with headless matches: `createMatch` → `decideCpuInput` → `advanceMatch` until `status` is `over`. Shuffle contender slots on every run: slot 0's position relative to the sudden-death spiral and neighbour tie-breaking can outweigh skill. Count draws separately, since simultaneous final-tile closure is common.

### Chain-reaction soaks credit the root balloon's owner

`popBalloons` (`src/app/engine/match.ts`) tags each queued balloon with the owner of the balloon whose fuse ran out, and stores it on the splash tiles (`Splash.ownerIds`, one entry per distinct chain reaching the tile). A player soaked by a chained pop credits that root owner, not the owner of the balloon that physically splashed them; if chains from several owners overlap the tile, each is credited once. Self-soaks credit nobody, and arena closure or leaving players credit nobody. The tally lives on `Player.tally` so snapshots carry it across host migration; keep any new counter there rather than in host-only state.
