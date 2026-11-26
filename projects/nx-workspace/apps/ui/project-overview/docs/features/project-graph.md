# Project Graph

`/project-graph` — `ProjectGraphPage.tsx` loads the data, keeps state in the query string and supplies colors and copy; palette in `consts/projectGraph.ts`. Everything below that — search, the Apps/Libs filter, edge-kind toggles, legend, canvas and detail panel — is docs-explorer's shared `DependencyGraph` (`dependency-graph.tsx`), which the component library's Component Graph entry also renders, so a change to the layout or behavior reaches both. The canvas is its shared `GraphView` (see [note-graph.md](../../../../../libs/@vigilant-broccoli/docs-explorer/docs/features/note-graph.md)).

The host passes `nodes`, `edges`, `groups` (id, label, color), `edgeKinds` (label, line style), `detailSections`, a controlled `state` with `onStateChange`, and a settings storage prefix. A single group or edge kind hides its filter or toggles, and a chosen color scheme assigns its colors to groups by position.

## Data

- `public/project-graph.json` is written by the non-cached `generate-project-graph` target (`scripts/generate-project-graph.ts`) through Nx's `createProjectGraphAsync`; `build` and `serve` depend on it and `deploy-github-pages` copies it into `_site`
- Included: every `visibility:public` project plus the internal projects they depend on transitively, since those already ship in public bundles; npm/external nodes are dropped
- Any `visibility:private` project and its edges are excluded even if something depends on it; most libs carry no visibility tag, so filtering by the public tag alone would hide shared libs such as `react-lib`
- Each project has `name`, `type` (`app`/`lib`; Nx `e2e` counts as `app`) and `tags`; edges are `source` depends on `target` with a `kind`
- `lib` edges come from Nx. `embeds` and `calls` edges come from each app README's `## App Dependencies` bullets ([app-readme-pattern.md](../../../../../../../docs/app-readme-pattern.md#apps-and-publishable-libs)): each link is resolved against Nx project roots, and the generator exits non-zero on a malformed bullet, an unknown kind or a link that resolves to no project
- Apps reached only through runtime edges (both managers, the API services) join without their own libs, since those libs ship in no public bundle; lib edges are emitted only between projects already in the graph

## View

- Projects map to `GraphView` nodes (`id` = project name, label = short name, `group` = type); only edges between visible projects are passed in. Nodes are circles sized by link count, laid out by the force simulation; `directed` draws an arrowhead at each dependency's end
- Apps use `--pages-primary` and libs a violet tuned per `useAppearance`, passed as `groupColors`. The canvas cannot read CSS variables, so the app color is resolved from the document with a concrete fallback: an unresolved `hsl(var(...))` would make the glow gradients throw
- The gear menu (`GraphSettingsMenu`) holds color scheme, node glow and forces, saved under the `project-graph:` prefix, separate from docs graphs. The default is the hue option (the page's own colors); a Wada scheme gives apps its first color and libs its second by position, since `app` and `lib` hash to the same palette slot. The legend follows the active colors
- Hover dims all but a node and its neighbors; the selected project is highlighted and opens the detail panel
- Lib edges are solid in the default link color; embeds (dashed teal) and calls (dotted orange) pass through `GraphView`'s `linkStyles`, keeping their color while a node is focused. Lib is deliberately left out of `linkStyles` so it keeps the default focus highlight
- The Lib/Embeds/Calls toggles double as the edge legend and filter the canvas edges and search neighbors; the last enabled kind cannot be turned off
- Search keeps matching projects plus their direct neighbors over the enabled edge kinds; the Apps/Libs filter applies first
- The detail panel lists Depends on and Depended on by (lib edges) and, for apps, Runtime dependencies and Runtime dependents with each edge's kind, all from the full data regardless of the toggles; picking a project hidden by the filters clears them so it appears on the canvas
- `project`, `type`, `q` and `edges` (comma-separated kinds) live in the query string (`/project-graph?project=hearth&edges=embeds,calls`); defaults are omitted from the URL

## Interaction

- Drag pans, wheel zooms around the pointer, and the corner buttons zoom in, out and reset (`zoomControls`); dragging a node repositions it
- Clicking a node selects it and clicking it again deselects; clicking empty canvas (a press that moves at most 4px) also deselects, through `onBackgroundClick`
- The camera follows the layout only until it first settles; later force changes and drags move the nodes, not the view, until reset
- Keyboard (`keyboardLabel`, which names the canvas with `PROJECT_GRAPH_PAGE.GRAPH_LABEL`): arrow keys pan, `+`/`-`/`0` zoom and reset, Tab/Shift+Tab step through projects by name with a focus ring and neighbor highlighting, Enter/Space select, Escape clears node focus; Tab past the first or last project leaves the canvas

## Gotchas

- `GraphView` rebuilds its simulation when `graph` or `onSelect` changes identity, so the page memoizes the graph and passes stable callbacks that read the current selection from refs
