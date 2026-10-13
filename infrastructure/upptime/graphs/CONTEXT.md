# Graph Runtime Context

Locked dependencies for the isolated monitoring repository's README graph and badge generation.

## Table of Contents

- [Nuances](#nuances)
  - [Canvas 2 fails on Node 24](#canvas-2-fails-on-node-24)

## Nuances

### Canvas 2 fails on Node 24

`@upptime/graphs@1.2.31` pulls in canvas 2, whose native install fails on Node 24. Keep this runtime's `canvas: 3.2.0` override and lockfile; do not copy the override into the application workspace.

The upstream action runs floating packages through ShellJS without checking failures. Use `npm ci`, invoke the CLI directly, and validate badge JSON and graph assets before committing them; the wrapper can report success with no generated assets.
