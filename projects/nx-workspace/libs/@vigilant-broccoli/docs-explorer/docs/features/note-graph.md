# Note Graph

`GraphView` + `DocsExplorer` (both `docs-explorer`) — Obsidian-style force-directed graph of the note link-graph, layered onto the [DocsExplorer](./docs-explorer.md) note viewer.

## Enabling

- `DocsViewer` shows a graph toggle (waypoints icon: content pane on desktop, sidebar on mobile) only when given the optional `getGraph()` prop; without it there is no graph
- `docs-md` and `project-overview`'s Claude Context page wire `getGraph` to `createDocsSnapshotSource().fetchGraph` (`graph.json`); `local-manager-next`'s docs route does not, so it has no graph toggle
- `DocsExplorer` takes `renderGraph(navigate)`; `DocsViewer` injects `GraphView` through it — the graph component is passed in rather than imported, which keeps `DocsExplorer` free of the force-simulation code

## Data (`graph.json`)

- Generated at build time by `scripts/build-docs-snapshot.mjs` from a per-app JSON config (`root`, `outDir`, `sources`, optional `linkFallbacks` that rewrite links leaving the snapshot to absolute URLs, optional `labelByDirectory` filenames whose graph labels use their parent directory, optional `ignoreFilenames` excluded from the snapshot wherever they appear), alongside `structure.json` and `search-index.json`; gitignored (build artifact). `react-utility`'s `createDocsSnapshotSource(baseUrl)` is the matching client reader
- Shape `{ nodes: [{ id, name, group }], links: [{ source, target }] }` — `id`/`source`/`target` are note paths, `group` is the top-level folder
- Edges are markdown links resolved against known note paths (same resolution as in-note link clicks, plus a `.md`-extension fallback); external/hash links, self-links, and duplicate edges are dropped
- Built entirely at snapshot time — no note content is parsed in the browser

## Graph behaviour

- Node color = top-level folder; size = link degree; root-level files (no folder) are gray
- Every node except the open note sits on a faint radial glow of its own color (4× its radius, growing with the hover grow, dimmed with the node while another is hovered). The settings' "Node glow" switch turns these off (persisted as `docs-md:graph-node-glow`); the open-note and hover glows always draw. Every glow uses a cosine falloff sampled into many gradient stops, fading to its own color at zero alpha: a few linear stops leave a bright core and visible kinks, and fading to `transparent` (black) darkens the edge
- The settings' color scheme select (persisted as `docs-md:graph-color-scheme`) picks between "Folder hues" (hashed per-folder hues) and four-color combinations from Sanzo Wada's _A Dictionary of Color Combinations_ (`graph-color-schemes.ts`, sourced from the `mattdesl/dictionary-of-colour-combinations` dataset); No. 321 is the default. Folders map to a palette color by name hash, so a folder keeps its color across local subgraphs; with four colors some folders share one
- Wheel to zoom, drag empty space to pan, drag a node to reposition it (reheats the simulation). `zoomControls` labels add corner zoom in/out/reset buttons (docs viewer and the Project Graph pass them). Buttons and the keyboard `+`/`-`/`0` glide the camera over ~200ms (repeated presses compose onto the in-flight target; reset glides to the fit); pointer pan, wheel zoom or a new graph cancels the glide, and `prefers-reduced-motion` keeps them instant; `onBackgroundClick` reports a click on empty canvas
- Settings (`graph-settings.tsx`) are shared: `useGraphSettings(prefix, defaultScheme?)` keeps color scheme, node glow and forces per storage prefix (`docs-md` keeps its original keys), `GraphSettingsFields` renders the controls and `GraphSettingsMenu` the gear (popover on desktop, dialog on mobile). Sliders read `forces`; `GraphView` gets `appliedForces`, which follows at most once per frame, and a slider value is saved about 300ms after it rests
- `groupColors` pins named groups to fixed `#rrggbb`/`hsl()` colors ahead of the palette and hashed hues
- `directed` draws a fixed-size arrowhead just outside each link's target node, batched and dimmed with its link. `keyboardLabel` makes the canvas focusable (`role="application"`): arrows pan, `+`/`-`/`0` zoom and reset, Tab/Shift+Tab move a focus ring through nodes by name (with hover-style highlighting and panning an off-screen node into view), Enter/Space call `onSelect`, Escape clears node focus, and a polite live region announces the focused node. Tab past either end is left to the browser so focus is not trapped. The docs viewer leaves both off
- `linkStyles` maps a link's optional `kind` to a color and screen-pixel dash (`GraphLinkStyle`); a styled link keeps its color while its node is focused, so only dimming changes it. Links without a kind, or whose kind is not in the map, keep the default color and focus highlight. Only the Project Graph uses it
- Hovering a node dims everything except it and its direct neighbours
- The open note (`activePath`) is filled with the accent color over a radial accent glow that fades with distance (scales with zoom, with a minimum on-screen size), stays fully opaque while another node is hovered, and always shows its label. A hovered node grows slightly over 150ms with an ease-out (and shrinks back the same way on leave; instant under `prefers-reduced-motion`), driven by a `requestAnimationFrame` loop that stops once every node settles, and gets a smaller amber glow (so it reads apart from the blue open note) and a bold label, on top of the existing neighbor dimming. Neither has an outline ring
- Labels show for hovered/active nodes always, for other nodes only past a zoom threshold
- Clicking a node opens that note and closes the graph. Opening a note from the sidebar (tree, search, Enter in search) while the graph is open keeps the graph and moves its focus to that note
- Auto-fits to the viewport while the layout first settles, unless the user zooms, pans or drags first; after that the camera stays still, so force changes and drags move nodes, not the view. With a note open the fit centers on that note and zooms out until the farthest node on each axis fits; opening another note refits once (global scope keeps the same graph, so `GraphView` refits on `activePath` change rather than remounting), as do resize before interaction and the reset button
- Drawing cost: each glow is a cached offscreen sprite scaled with `drawImage` rather than a fresh many-stop gradient per node per frame; the theme check (which reads computed styles up the ancestor chain) runs on mount and theme changes only; links sharing a style stroke as one `Path2D`, dimmed first and highlighted last; pan, hover and zoom redraws coalesce into one per animation frame
- Follows the viewer's light/dark theme (`.dark` class, `prefers-color-scheme` fallback) and repaints on theme change by observing `class`/`style` on the canvas container and every ancestor (a scoped `ThemeProvider` does not touch `<html>`)

## Notes

- The graph spans every note, so it is a separate top-level toggle — not one of the per-file view modes (markdown/checklist)
- Local (single-note neighbourhood) graph mode is a planned enhancement (repo `TODO.md`)
