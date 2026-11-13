# Data Sync Strategies

How to keep one piece of user data (a note, a list, a document) consistent across several clients and a server.

## Table of Contents

- [Strategy Comparison](#strategy-comparison)
- [Strategies](#strategies)
  - [Last-Write-Wins](#last-write-wins)
  - [Optimistic Concurrency](#optimistic-concurrency)
  - [Per-Item Operations](#per-item-operations)
  - [Operational Transformation](#operational-transformation)
  - [CRDTs](#crdts)
- [Delivery Mechanisms](#delivery-mechanisms)
- [Choosing](#choosing)

## Strategy Comparison

| Strategy | Unit of sync | Conflict handling | Offline edits | Complexity | Best for |
| :-- | :-- | :-- | :-- | :-- | :-- |
| CRDTs | Operations or state that merge deterministically | Automatic merge; no edit lost | Yes | High | Collaborative text, offline-first apps |
| Last-write-wins | Whole document | Latest write overwrites; earlier edits silently lost | Poor | Lowest | Single-user settings, low-stakes data |
| Operational transformation | Operations transformed against concurrent ones | Central server orders and rewrites operations | Limited | High | Real-time collaborative text with a central server |
| Optimistic concurrency | Whole document with a version | Stale write rejected; client re-reads and merges | Poor | Low | Multi-device data where conflicts are rare |
| Per-item operations | Individual item (add, toggle, remove) | Conflicts only when two clients touch the same item | Moderate | Medium | Checklists, task lists, any collection of independent items |

## Strategies

### Last-Write-Wins

- Client sends the whole document; the server overwrites what it has
- Ordering is by arrival time or a client timestamp (client clocks can be wrong, so server time is safer)
- A device that was offline and syncs late can erase newer edits from another device
- Acceptable when only one person edits at a time and losing an edit is cheap

### Optimistic Concurrency

- Each record carries a version number or `updatedAt`; a write includes the version it was based on
- If the stored version differs, the server rejects the write (HTTP `409` Conflict, or `412` with `If-Match`/ETag) and returns the current record
- The client then merges, asks the user, or re-applies its change on top and retries
- No locks held; cost is a retry only when a real conflict happens
- Merge quality depends on the client: whole-text documents need a text merge (three-way diff), structured data can merge by field

### Per-Item Operations

- Model the data as a collection of items with stable ids and send changes as small operations (`add`, `update`, `toggle`, `remove`, `reorder`) instead of the whole list
- Two clients editing different items never conflict; the same item falls back to last-write-wins per field
- Deletes need care: a tombstone (deleted flag) prevents a stale client from re-adding a removed item
- Ordering needs a stable position scheme (fractional indexes) so concurrent inserts do not renumber each other

### Operational Transformation

- Clients send operations (insert "a" at position 5); the server transforms each against concurrent operations so every client converges
- Requires a central server to define operation order
- Used by classic collaborative editors; correct transform functions are notoriously hard to get right

### CRDTs

- Conflict-free replicated data types: data structures whose merge is commutative, associative and idempotent, so replicas converge regardless of delivery order or duplication
- Two families: state-based (ship the full state, merge by join) and operation-based (ship operations that commute)
- Text CRDTs (Yjs, Automerge) give each character a unique id so concurrent inserts and deletes interleave deterministically
- No central authority needed, so peer-to-peer and long offline periods work
- Costs: metadata overhead, growing history that needs compaction, and an opaque binary state that is harder to query or inspect than plain text; usually keep a plain-text copy alongside for search and export
- Merge guarantees convergence, not intent: two people editing the same sentence get both edits, which may read oddly

## Delivery Mechanisms

How changes travel is independent of how conflicts are resolved.

| Mechanism | How it works | Trade-off |
| :-- | :-- | :-- |
| Debounced autosave | Client saves some time after the last edit | Simple; fewer writes, but a longer window for conflicts |
| Pull on focus or interval | Client refetches when the tab regains focus or on a timer | Easy; changes appear late |
| Server-Sent Events | Server pushes updates over one-way HTTP stream | Simple push; one direction only |
| WebSocket or broadcast channel | Persistent two-way connection; peers exchange changes live | Real-time; needs reconnect handling and resync on rejoin |
| Offline queue | Client stores pending operations locally and replays on reconnect | Works offline; needs idempotent operations and ordering |

## Choosing

| Situation | Reasonable choice |
| :-- | :-- |
| One user, one active device at a time | Last-write-wins with debounced autosave |
| Same user on several devices, rare overlap | Optimistic concurrency with a version field |
| List of independent items (tasks, checklist) | Per-item operations with optimistic UI updates |
| Several people typing in the same text live | CRDT (or OT with a central server) |
| Must work fully offline and merge later | CRDT, or per-item operations with an offline queue |

- Start with the simplest strategy that matches how often two writers actually collide
- Whatever the strategy, make writes idempotent, so retries and duplicates are harmless
- Optimistic UI updates should roll back when the server rejects the change
