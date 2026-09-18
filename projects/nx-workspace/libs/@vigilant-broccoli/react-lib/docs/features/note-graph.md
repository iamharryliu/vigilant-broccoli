# Note Graph

`react-utility` `GraphView` + `react-lib` `DocsExplorer` — Obsidian-style force-directed graph of the note link-graph, layered onto the [DocsExplorer](./docs-explorer.md) note viewer.

## Enabling

- `DocsViewer` shows a graph toggle (sidebar, waypoints icon) only when given the optional `getGraph()` prop; without it there is no graph
- `docs-md` and `pages-index`'s Claude Context page wire `getGraph` to `createDocsSnapshotSource().fetchGraph` (`graph.json`); `vb-manager-next`'s docs route does not, so it has no graph toggle
- `DocsExplorer` takes `renderGraph(navigate)`; `DocsViewer` injects `GraphView` through it — react-lib can't import react-utility (would cycle), so the graph component is passed in rather than imported

## Data (`graph.json`)

- Generated at build time by `scripts/build-docs-snapshot.mjs` from a per-app JSON config (`root`, `outDir`, `sources`, optional `linkFallbacks` that rewrite links leaving the snapshot to absolute URLs), alongside `structure.json` and `search-index.json`; gitignored (build artifact). `react-utility`'s `createDocsSnapshotSource(baseUrl)` is the matching client reader
- Shape `{ nodes: [{ id, name, group }], links: [{ source, target }] }` — `id`/`source`/`target` are note paths, `group` is the top-level folder
- Edges are markdown links resolved against known note paths (same resolution as in-note link clicks, plus a `.md`-extension fallback); external/hash links, self-links, and duplicate edges are dropped
- Built entirely at snapshot time — no note content is parsed in the browser

## Graph behaviour

- Node color = top-level folder; size = link degree; root-level files (no folder) are gray
- Wheel to zoom, drag empty space to pan, drag a node to reposition it (reheats the simulation)
- Hovering a node dims everything except it and its direct neighbours
- The open note (`activePath`) gets an accent ring and always shows its label
- Labels show for hovered/active nodes always, for other nodes only past a zoom threshold
- Clicking a node opens that note and closes the graph
- Auto-fits to the viewport until the first zoom/pan/drag, then leaves the view alone
- Follows the viewer's light/dark theme (`.dark` class, `prefers-color-scheme` fallback) and repaints on theme change

## Notes

- The graph spans every note, so it is a separate top-level toggle — not one of the per-file view modes (markdown/checklist)
- Local (single-note neighbourhood) graph mode is a planned enhancement (repo `TODO.md`)
