# Board Games Notes Pattern

Convention specific to `notes/hobbies/board-games/`. The universal link-hygiene rules that apply to all of `notes/` are in [notes-pattern.md](../notes-pattern.md) — this doc only covers what's specific to board games.

## Index

- `board-games.md` is the index; its name matches the directory, per the repo-wide index-naming habit.
- It is a flat list of links, one per game, ordered alphabetically by game title. No categories — the directory is small enough to skim.

## The three questions a game note answers

Every game note exists to answer the same three questions without opening the rulebook:

1. **How do I start the game?** → `## Setup`
2. **What can a player do on their turn?** → `## On Your Turn`
3. **What limits a player?** → `## Limitations`

A note missing any of the three is incomplete, regardless of how much else it covers.

## Section order

Sections run in play order, not alphabetically — this is one of the ordered-content exemptions in [notes-pattern.md](../notes-pattern.md):

1. `# <Game Name>`
2. `## Table of Contents`
3. `## Goal` — one or two sentences: what you are maximising and over what span.
4. `## Limitations`
5. `## Setup`
6. `## On Your Turn`
7. Game-specific subsystems — any number of `##` sections for the parts that don't fit the above (e.g. `## Card Types`, `## Events`, `## Runes`, `## Goods`). Place them where they read best between Setup and Game End.
8. `## Game End` — the trigger, plus whatever happens after it fires (final round, round vs. game distinction).
9. `## Scoring`
10. `## Quick Tips` — a handful of strategy bullets, not rules.
11. `## Links` — external rules videos, BGG, online implementations. Optional, and always last.

## Limitations table

- A table with `Limit | Value | Notes` columns, alphabetical by `Limit` per the universal table rule.
- Every hard cap in the rules gets a row: hand limit, board or tableau limit, actions per turn, component supply, player count, round count, one-copy-per-player restrictions.
- Player count and playtime live here rather than in `## Setup`, so a reader checking whether a game fits the group only reads one table.
- Where a limit changes during play, put the progression in the `Value` cell (e.g. `4, then 5, then 6`) and explain the trigger in `Notes`.

## On Your Turn

- Open with the number of actions a turn grants and whether they may repeat.
- Then a numbered list naming the actions, followed by one `### N. <Action>` subsection each, in the same order.
- Free or bonus actions that don't consume an action get their own `### Free Action: <name>` subsection at the end.

## Stubs

- A link-only stub with no `##` headings (see `root.md`, `nimmt-6.md`) is an acceptable placeholder for a game that hasn't been played enough to write up.
- A stub needs no `## Table of Contents` — it has no headings.
- Expand a stub to the full section order above rather than growing it into a half-structured note.
