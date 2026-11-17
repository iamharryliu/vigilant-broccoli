# Note Graph

`GraphView` + `DocsExplorer` (both `docs-explorer`) — Obsidian-style force-directed graph of the note link-graph, layered onto the [DocsExplorer](./docs-explorer.md) note viewer.

## Enabling

- `DocsViewer` shows a graph toggle (waypoints icon: content pane on desktop, sidebar on mobile) only when given the optional `getGraph()` prop; without it there is no graph
- `docs-md` and `pages-index`'s Claude Context page wire `getGraph` to `createDocsSnapshotSource().fetchGraph` (`graph.json`); `local-manager-next`'s docs route does not, so it has no graph toggle
- `DocsExplorer` takes `renderGraph(navigate)`; `DocsViewer` injects `GraphView` through it — the graph component is passed in rather than imported, which keeps `DocsExplorer` free of the force-simulation code

## Data (`graph.json`)

- Generated at build time by `scripts/build-docs-snapshot.mjs` from a per-app JSON config (`root`, `outDir`, `sources`, optional `linkFallbacks` that rewrite links leaving the snapshot to absolute URLs, optional `labelByDirectory` filenames whose graph labels use their parent directory), alongside `structure.json` and `search-index.json`; gitignored (build artifact). `react-utility`'s `createDocsSnapshotSource(baseUrl)` is the matching client reader
- Shape `{ nodes: [{ id, name, group }], links: [{ source, target }] }` — `id`/`source`/`target` are note paths, `group` is the top-level folder
- Edges are markdown links resolved against known note paths (same resolution as in-note link clicks, plus a `.md`-extension fallback); external/hash links, self-links, and duplicate edges are dropped
- Built entirely at snapshot time — no note content is parsed in the browser

## Graph behaviour

- Node color = top-level folder; size = link degree; root-level files (no folder) are gray
- Every node except the open note sits on a faint radial glow of its own color (4× its radius, growing with the hover grow, dimmed with the node while another is hovered). The settings' "Node glow" switch turns these off (persisted as `docs-md:graph-node-glow`); the open-note and hover glows always draw. Every glow uses a cosine falloff sampled into many gradient stops, fading to its own color at zero alpha: a few linear stops leave a bright core and visible kinks, and fading to `transparent` (black) darkens the edge
- The settings' color scheme select (persisted as `docs-md:graph-color-scheme`) picks between "Folder hues" (hashed per-folder hues) and four-color combinations from Sanzo Wada's _A Dictionary of Color Combinations_ (`graph-color-schemes.ts`, sourced from the `mattdesl/dictionary-of-colour-combinations` dataset); No. 321 is the default. Folders map to a palette color by name hash, so a folder keeps its color across local subgraphs; with four colors some folders share one
- Wheel to zoom, drag empty space to pan, drag a node to reposition it (reheats the simulation)
- Hovering a node dims everything except it and its direct neighbours
- The open note (`activePath`) is filled with the accent color over a radial accent glow that fades with distance (scales with zoom, with a minimum on-screen size), stays fully opaque while another node is hovered, and always shows its label. A hovered node grows slightly over 150ms with an ease-out (and shrinks back the same way on leave; instant under `prefers-reduced-motion`), driven by a `requestAnimationFrame` loop that stops once every node settles, and gets a smaller amber glow (so it reads apart from the blue open note) and a bold label, on top of the existing neighbor dimming. Neither has an outline ring
- Labels show for hovered/active nodes always, for other nodes only past a zoom threshold
- Clicking a node opens that note and closes the graph
- Auto-fits to the viewport until the first zoom/pan/drag, then leaves the view alone. With a note open the fit centers on that note and zooms out until the farthest node on each axis fits, so the note stays centered as the simulation settles; opening another note re-enables the auto-fit (global scope keeps the same graph, so `GraphView` refits on `activePath` change rather than remounting)
- Follows the viewer's light/dark theme (`.dark` class, `prefers-color-scheme` fallback) and repaints on theme change by observing `class`/`style` on the canvas container and every ancestor (a scoped `ThemeProvider` does not touch `<html>`)

## Notes

- The graph spans every note, so it is a separate top-level toggle — not one of the per-file view modes (markdown/checklist)
- Local (single-note neighbourhood) graph mode is a planned enhancement (repo `TODO.md`)
