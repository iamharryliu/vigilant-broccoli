# Nuance Pattern

Source of truth for where a repo nuance is written down and what a nuance entry
looks like. A nuance is a non-obvious bug or quirk discovered while working here
— something that isn't derivable from reading the code alone, and that would
cost the next person (or agent) hours to rediscover.

## Where a nuance goes

A nuance lives in the `## Nuances` section of the `CLAUDE.md` at the **deepest
directory that fully contains everything the nuance affects**. Scope it by
blast radius, not by where it was first observed:

- Breaks or constrains exactly one app, lib, or infrastructure component →
  that component's directory (e.g.
  `projects/nx-workspace/apps/ui/vb-manager-next/CLAUDE.md`).
- Spans several apps/libs inside one workspace → the workspace root
  (`projects/nx-workspace/CLAUDE.md`).
- Spans top-level directories, or is about the repo itself (tooling, git,
  conventions) → the `## Nuances` section of the repo-root `CLAUDE.md`. The
  root is the deepest directory containing everything such a nuance affects,
  so this is the same rule, not an exception — and it puts a genuinely
  repo-wide trap in context on every session, which is where it belongs.

When a nuance is observed in one app but the underlying trap applies to a whole
class of surfaces, write it at the level where the class lives and name the
app as the sighting, rather than filing a copy per app. A nuance filed above
the directory an agent is working in still reaches them, because every
`CLAUDE.md` on the path into that directory is loaded — which is why the
Tailwind `content` trap that bit one app lives at the workspace root.

The vehicle is whatever file the agent harness loads on its own when work
happens in a subtree — `CLAUDE.md` in this repo today. That automatic load is
the entire mechanism: a file the harness has no reason to open (a `NUANCE.md`,
say) is found only by an agent that already went looking, which is the opposite
of what a nuance needs. If that filename ever changes, see
[Harness portability](#harness-portability) — nothing about the design depends
on the name itself.

There is no separate index. The list of directories carrying nuances is
derivable, so it is derived rather than maintained:

```sh
grep -rl '^## Nuances' --include=CLAUDE.md .
```

A hand-written index would be a second place to drift, and nothing reads it —
discovery happens through the auto-loaded `CLAUDE.md` itself, not through a
table someone has to remember to update.

## File shape

A directory-scoped `CLAUDE.md` is:

- `# CLAUDE — <dir path or component name>`
- `## Table of Contents` — links to every `##` section, and nested under
  `Nuances`, every `###` entry beneath it. Regenerate it whenever entries are
  added, removed, or retitled; it is fully derived, so rebuild it rather than
  patching it.
- Any other directory conventions the component needs (see
  `infrastructure/local/CLAUDE.md`, which carries curation rules and no
  nuances).
- `## Nuances` — the entries, each a `###`.

A `CLAUDE.md` with no `##` headings at all doesn't need a Table of Contents,
the same exemption [notes-pattern.md](./notes-pattern.md) makes for notes.

`CLAUDE.md` sits next to `README.md` in a component directory and is only
created when there is something to say — there is no empty-file placeholder.
It is not part of [app-readme-pattern.md](./app-readme-pattern.md): READMEs
describe the stack, `CLAUDE.md` records traps and conventions.

## Harness portability

The design depends on two behaviours of the agent harness, neither of which is
the filename:

1. A **conventional file** in a directory is loaded without anyone asking for
   it.
2. That load is **nested** — the file for the directory being worked in, not
   only the one at the repo root.

Claude Code provides both through `CLAUDE.md`, which is why that is the file
here. Other harnesses use other names (`AGENTS.md` is the closest thing to a
vendor-neutral convention, and is what Codex reads). Should this repo move,
the migration is mechanical, not a redesign:

- Rename the per-directory files, and the root one with them.
- Update the `--include` glob in the root file's nuance convention line.
- Update the `filename` key in
  `projects/nx-workspace/apps/ui/pages-index/claude-context.snapshot.config.json`,
  which selects these files for the Claude Context site.
- Reword the references here and in [agent-diagram.md](./agent-diagram.md).

To serve two harnesses at once, keep one real file per directory under the
neutral name and symlink the harness-specific name beside it, so the content
lives once.

Only prose is written this way; code keeps concrete names. The runner scripts
under `infrastructure/agent-sandbox/` invoke `claude -p` directly and read a
`CLAUDE_CODE_OAUTH_TOKEN` from Vault, as do the workflows that dispatch them.
That is correct — abstracting a literal binary and a literal secret key would
buy the appearance of portability while the code still runs one vendor's CLI.

So a harness migration is two jobs of very different size. Renaming the files
above is the small one. The sandbox is the large one: six `*-runner.sh` scripts
shell out to `claude -p`, and `CLAUDE_CODE_OAUTH_TOKEN` spans those scripts and
the workflows that dispatch them. Budget for it separately — nothing in this
section covers it.

If a harness turns out to load only a root file and not nested ones, the
convention degrades rather than breaks: the root file still carries the rule
and the `grep` that finds every directory holding nuances, so an agent can get
there in one command instead of automatically. Keeping that line in the root
file is what makes the fallback work — it is not merely a convenience.

## Entry shape

Each nuance is one `###` section under `## Nuances`:

- The heading states the symptom or the rule, as a sentence — what someone
  would search for while confused ("`wrangler pages deployment list --json` is
  capped to one page (25 items)"), not a topic label ("Wrangler"). The headings
  are what the Table of Contents shows, so they double as the scannable list of
  what this directory can do to you.
- The body explains **why** it happens (the mechanism, the upstream bug, the
  API behaviour), not just what to do — the mechanism is what makes it
  recognizable the next time it wears a different symptom.
- Name the concrete files, commands, and identifiers involved so the entry is
  greppable, and cite the deployed symptom when there was one.
- Close with the fix or workaround that is in place, and what to do when it
  resurfaces (which commands to check, in what order).
- If the same trap can reappear elsewhere, say so explicitly ("any other
  hand-rolled copy of this provider still needs the same treatment").

Entries are ordered oldest-first — append new ones at the bottom rather than
sorting, so the section reads as a log.

Because the whole section is always-on context for anyone working in that
directory, keep entries to what actually can't be derived from the code. A
nuance that has become obvious, or that the code now guards against, is costing
tokens on every session in that subtree.

## Upkeep

- Fixing the root cause upstream (a dependency bump, a deleted workaround)
  retires the entry: delete it and its Table of Contents line. If it was the
  last one, drop the now-empty `## Nuances` section too.
- Moving or deleting a component moves or deletes its `CLAUDE.md` with it.
- Adding or retiring a nuance is two writes, both inside the one file you are
  already editing: the entry and its Table of Contents line.
- Directory-scoped `CLAUDE.md` files are snapshotted into the GitHub Pages
  Claude Context site via the `{ "path": ".", "filename": "CLAUDE.md" }` source
  in
  `projects/nx-workspace/apps/ui/pages-index/claude-context.snapshot.config.json`,
  so a new one is picked up with no config change.
