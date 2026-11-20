# Project Graph

`/project-graph` — `ProjectGraphPage.tsx`, filtering and palette in `consts/projectGraph.ts`. The canvas is docs-explorer's shared `GraphView` (see its [note-graph.md](../../../../libs/@vigilant-broccoli/docs-explorer/docs/features/note-graph.md)).

## Data

- `public/project-graph.json` is written by the non-cached `generate-project-graph` target (`scripts/generate-project-graph.ts`) through Nx's `createProjectGraphAsync`; `build` and `serve` depend on it and `deploy-github-pages` copies it into `_site`
- Included: every `visibility:public` project plus the internal projects they depend on transitively, since those already ship in public bundles; npm/external nodes are dropped
- Any `visibility:private` project and its edges are excluded even if something depends on it; most libs carry no visibility tag, so filtering by the public tag alone would hide shared libs such as `react-lib`
- Each project has `name`, `type` (`app`/`lib`; Nx `e2e` counts as `app`) and `tags`; edges are `source` depends on `target`

## View

- Projects map to `GraphView` nodes (`id` = project name, label = short name, `group` = type); only edges between visible projects are passed in. Nodes are circles sized by link count, laid out by the force simulation; edges have no arrowheads, so direction lives in the detail panel
- Apps use `--pages-primary` and libs a violet tuned per `useAppearance`, passed as `groupColors`. The canvas cannot read CSS variables, so the app color is resolved from the document with a concrete fallback: an unresolved `hsl(var(...))` would make the glow gradients throw
- The gear menu (`GraphSettingsMenu`) holds color scheme, node glow and forces, saved under the `project-graph:` prefix, separate from docs graphs. The default is the hue option (the page's own colors); a Wada scheme gives apps its first color and libs its second by position, since `app` and `lib` hash to the same palette slot. The legend follows the active colors
- Hover dims all but a node and its neighbors; the selected project is highlighted and opens the detail panel
- Search keeps matching projects plus their direct neighbors; the Apps/Libs filter applies first
- The detail panel lists Depends on and Depended on by from the full data; picking a project hidden by the filters clears them so it appears on the canvas
- `project`, `type` and `q` live in the hash query (`#/project-graph?project=hearth&q=hearth`); defaults are omitted from the URL

## Interaction

- Drag pans, wheel zooms around the pointer, and the corner buttons zoom in, out and reset (`zoomControls`); dragging a node repositions it
- Clicking a node selects it and clicking it again deselects; clicking empty canvas (a press that moves at most 4px) also deselects, through `onBackgroundClick`
- The camera follows the layout only until it first settles; later force changes and drags move the nodes, not the view, until reset

## Gotchas

- `GraphView` rebuilds its simulation when `graph` or `onSelect` changes identity, so the page memoizes the graph and passes stable callbacks that read the current selection from refs
- The canvas has no per-node keyboard focus; only the zoom buttons and the panel are keyboard-reachable
