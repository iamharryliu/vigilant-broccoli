# Nuance Pattern

Source of truth for where a repo nuance is written down and what a nuance entry
looks like. A nuance is a non-obvious bug or quirk discovered while working here
— something that isn't derivable from reading the code alone, and that would
cost the next person (or agent) hours to rediscover.

## Table of Contents

- [Where a nuance goes](#where-a-nuance-goes)
- [File shape](#file-shape)
- [Harness portability](#harness-portability)
- [Entry shape](#entry-shape)
- [Upkeep](#upkeep)

## Where a nuance goes

A nuance lives in the `## Nuances` section of the `CONTEXT.md` at the **deepest
directory that fully contains everything the nuance affects**. Scope it by
blast radius, not by where it was first observed:

- Breaks or constrains exactly one app, lib, or infrastructure component →
  that component's directory (e.g.
  `projects/nx-workspace/apps/ui/vb-manager-next/CONTEXT.md`).
- Spans several apps/libs inside one workspace → the workspace root
  (`projects/nx-workspace/CONTEXT.md`).
- Spans top-level directories, or is about the repo itself (tooling, git,
  conventions) → the `## Nuances` section of the repo-root `CONTEXT.md`. The
  root is the deepest directory containing everything such a nuance affects,
  so this is the same rule, not an exception — and it puts a genuinely
  repo-wide trap in context on every session, which is where it belongs.

When a nuance is observed in one app but the underlying trap applies to a whole
class of surfaces, write it at the level where the class lives and name the
app as the sighting, rather than filing a copy per app. A nuance filed above
the directory an agent is working in still reaches them, because every
applicable `CONTEXT.md` on the path into that directory is read — which is why the
Tailwind `content` trap that bit one app lives at the workspace root.

Each source is exposed through generated `CLAUDE.md` and `AGENTS.md` symlinks
in the same directory. The agent reads its conventional entry point; both
resolve to the shared `CONTEXT.md`. See [Harness portability](#harness-portability).

There is no separate index. The list of directories carrying nuances is
derivable, so it is derived rather than maintained:

```sh
grep -rl '^## Nuances' --include=CONTEXT.md .
```

A hand-written index would be a second place to drift, and nothing reads it —
discovery happens through the agent entry points themselves, not through a
table someone has to remember to update.

## File shape

A directory-scoped `CONTEXT.md` is:

- `# Agent Context — <dir path or component name>`
- `## Table of Contents` — links to every `##` section, and nested under
  `Nuances`, every `###` entry beneath it. Regenerate it whenever entries are
  added, removed, or retitled; it is fully derived, so rebuild it rather than
  patching it.
- Any other directory conventions the component needs (see
  `infrastructure/local/CONTEXT.md`, which carries curation rules and no
  nuances).
- `## Nuances` — the entries, each a `###`.

A `CONTEXT.md` with no `##` headings at all doesn't need a Table of Contents,
the same exemption [notes-pattern.md](./notes-pattern.md) makes for notes.

`CONTEXT.md` sits next to `README.md` in a component directory and is only
created when there is something to say — there is no empty-file placeholder.
It is not part of [app-readme-pattern.md](./app-readme-pattern.md): READMEs
describe the stack, `CONTEXT.md` records traps and conventions.

## Harness portability

`CONTEXT.md` owns the instructions independently of any agent. The generated
`CLAUDE.md` and `AGENTS.md` links expose them to Claude Code and Codex without
copying Markdown or changing relative links. To support another harness, add
its entry point to `setup/common/sync-agent-support.sh`.

After adding context, run the synchronization script and commit the
source only. Agent adapters are Git-ignored; installers generate them, and CI
checks that generation leaves the checkout clean. See [agent-support.md](./agent-support.md) for commands,
conflict handling, installation, and discovery details.

An agent's automatic discovery may depend on its starting directory. The root
context therefore also requires reading applicable directory context before
editing a subtree. Codex's combined instruction limit is set to 64 KiB in
`.codex/config.toml` for this trusted project; keep inherited context within it.

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
- Before moving or deleting context, run `bash setup/common/sync-agent-support.sh --clean`. Move or delete its `CONTEXT.md`, then rerun the script to regenerate the ignored adapters.
- Adding or retiring a nuance is two writes, both inside the one file you are
  already editing: the entry and its Table of Contents line.
- Directory-scoped `CONTEXT.md` files are snapshotted into the GitHub Pages
  Agent Context site via the `{ "path": ".", "filename": "CONTEXT.md" }` source
  in
  `projects/nx-workspace/apps/ui/pages-index/claude-context.snapshot.config.json`,
  so a new one is picked up with no config change.
