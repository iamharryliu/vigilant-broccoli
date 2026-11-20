# Project Graph

`/project-graph` — `ProjectGraphPage.tsx`, filtering and palette in `consts/projectGraph.ts`.

## Data

- `public/project-graph.json` is written by the non-cached `generate-project-graph` target (`scripts/generate-project-graph.ts`) through Nx's `createProjectGraphAsync`; `build` and `serve` depend on it and `deploy-github-pages` copies it into `_site`
- Included: every `visibility:public` project plus the internal projects they depend on transitively, since those already ship in public bundles; npm/external nodes are dropped
- Any `visibility:private` project and its edges are excluded even if something depends on it; most libs carry no visibility tag, so filtering by the public tag alone would hide shared libs such as `react-lib`
- Each project has `name`, `type` (`app`/`lib`; Nx `e2e` counts as `app`) and `tags`; edges are `source` depends on `target`

## View

- Default is the full graph, laid out synchronously with `d3-force` (300 ticks) and fitted to the SVG `viewBox`; apps are pulled above libs so arrows mostly point down
- Apps are circles in `--pages-primary`, libs squares in a violet tuned per `useAppearance`
- Hover or focus a node to highlight its direct edges and neighbors and dim the rest; with nothing hovered, the selected node is highlighted
- Search keeps matching projects plus their direct neighbors; the Apps/Libs filter applies first
- The detail panel lists Depends on and Depended on by from the full data; picking a project hidden by the filters clears them so it appears on the canvas
- `project`, `type` and `q` live in the hash query (`#/project-graph?project=hearth&q=hearth`); defaults are omitted from the URL

## Interaction

- Drag pans, wheel or pinch zooms around the pointer, and the corner buttons zoom in, out and reset
- With the graph focused: arrow keys pan, `+`/`-` zoom, `0` resets; nodes are tabbable and Enter/Space toggles selection
- A click is a pointer press that moves at most 4px; clicking the background clears the selection

## Gotchas

- The svg captures the pointer on press, so later events target the svg: the pressed node is read on `pointerdown`, not `pointerup`
- The wheel listener is attached natively with `passive: false`, because React's `onWheel` is passive and cannot stop page scroll
