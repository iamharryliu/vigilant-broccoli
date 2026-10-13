# Agent Context — apps/ui/balloono

## Table of Contents

- [Nuances](#nuances)
  - [CPU balance measured without shuffled spawn slots is misleading](#cpu-balance-measured-without-shuffled-spawn-slots-is-misleading)

## Nuances

### CPU balance measured without shuffled spawn slots is misleading

Measure `BOT_PROFILES` (`src/app/engine/cpu.ts`) with headless matches: `createMatch` → `decideCpuInput` → `advanceMatch` until `status` is `over`. Shuffle contender slots on every run: slot 0's position relative to the sudden-death spiral and neighbour tie-breaking can outweigh skill. Count draws separately, since simultaneous final-tile closure is common.
