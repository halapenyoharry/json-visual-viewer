# Next Steps

Living roadmap. Add items at the bottom of the relevant section. Move to "Done" when shipped, prune when stale. Cross-session memory for the project.

## Now (next session)

### Verify 3D Graph at scale

Shipped in v0.1.1: `react-force-graph-3d` + `three-spritetext`, multi-graph
fan-out via `linkCurvature` + `linkCurveRotation`, inline sprite edge labels,
2D/3D toggle, directional particle flow, curvature slider. Acceptance still
needs a real-world check:
- 3000-node graph at 30+ fps (rotate, zoom, drag)
- Parallel edges visibly distinct around the source-target axis
- Inline labels readable without overlap chaos
- 2D mode parity vs Cytoscape on 1k+ nodes

If perf falls short, profile cooldown ticks, particle count, and sprite count
first — those are the usual suspects. `NODE_THRESHOLD` is currently 5000;
adjust once we have data.

### Open question — Chrome / browser fallback

VS Code webviews allow WebGL but the extension-host overhead may still bite at
very large scale. Plan B: `Open in Browser` button that writes JSON to a temp
file and opens `http://localhost:NNNN/?file=…` against a tiny vite preview
server. Escape hatch, not the default.

## Soon

### Freeze mode v2 — true SVG snapshot + Cytoscape support

v0.1.2 ships a "Freeze" toggle that pins nodes in place and halts the
simulation for D3 ForceGraph + 3D Graph. Visually it's the explore experience
we wanted, but it doesn't yet capture the snapshot to a static SVG that can
zoom/pan at GPU speed independent of node count.

Next iterations:
1. **Cytoscape**: Hook `Freeze` to call `cy.stop()` on the running layout and
   disable user-drag. Cytoscape layouts already cool down naturally, so this
   is mostly UX consistency.
2. **True SVG snapshot for D3 ForceGraph**: when frozen, replace the live SVG
   with a serialized clone in a separate `<svg>` mounted with d3.zoom. The
   browser only repaints on transform change → effectively-free zoom/pan at
   10k+ nodes.
3. **3D PNG raster snapshot**: 3D-force has no SVG path. When frozen, capture
   the current WebGL canvas as PNG and render that with d3.zoom for the
   snapshot view. Lose camera rotation in snapshot mode (deliberate trade-off).
4. **Reuse SVG export**: the existing one-shot SVG export (`Cmd+Shift+P`) is
   the same code path — Freeze mode is just "export and keep showing the
   export." DRY this up when implementing #2.

### Sigma.js / PixiJS 2D as alternative to Cytoscape

Only if 3D-force-graph 2D mode (`react-force-graph-2d`) doesn't deliver. Same
adapter shape, same multi-graph trick. Holding in reserve.

## Later

### Per-view perf thresholds — review

`PerfWarning` thresholds are guessed. Once we have 3D and SVG-snapshot, revisit:
- Tree: ~5k nodes (current threshold seems OK)
- Circles: ~3k (current threshold)
- D3 ForceGraph: 500 (very conservative)
- Cytoscape: 1500 (after perf flags, can probably raise)
- 3D ForceGraph: TBD — benchmark at 3k, 10k, 30k

### Consolidate graph views

By the time 3D ships we'll have D3 ForceGraph + Cytoscape + 3D = three flavors
of "show me a graph." Decide: keep all three for different aesthetics, or
collapse to "2D Graph (Cytoscape)" + "3D Graph (force-graph-3d)" and retire
the original D3 view.

## Done

- v0.1.0: Cytoscape view + layout picker (fcose/cose/breadthfirst/etc)
- v0.1.0: Toolbar view dropdown (collapsed N buttons → single menu)
- v0.1.0: Multi-edge support in data layer (curve toggle in Cytoscape)
- v0.1.0: Marketplace metadata (repository field)
- v0.1.1: Cytoscape perf flags (hideEdgesOnViewport, textureOnViewport, motionBlur, pixelRatio:1)
- v0.1.1: 3D Graph view (`react-force-graph-3d` + `three-spritetext`) with multi-graph fan-out, inline sprite edge labels, 2D/3D toggle, directional particles, curvature slider
- v0.1.2: Freeze toggle (Explore mode v1) — pins nodes / halts simulation for D3 ForceGraph + 3D Graph; particles auto-pause; toolbar button only shown on graph-family views
- v0.1.3: Rich graph schema. `GraphNode` now carries `kind` (`node` / `hyperedge` / `edge-as-node`) and `attrs`; `GraphLink` carries `directed`, `role`, `layer`, `attrs`. Predicate fallback chain (`attrs["i2t:predicate"]` → `predicate` → `relation` → `type` → `label`). Honored end-to-end: undirected edges suppress arrowheads (all three engines); synthetic nodes get diamond shape + dimmer color in Cytoscape + 3D; full attrs render in hover tooltips on Cytoscape (positioned div) and 3D Graph (HTML in scene-tooltip). Perf-warning denominator is now per-view-family ("JSON tree entities" for Tree/Circles/Mass; "graph nodes" for Graph/Cytoscape/3D). Validates against the Camus example fixture from the i2t correspondence.
- v0.1.4: Layer auto-toggle UI. Distinct `edge.layer` values feed a floating `LayerPanel` (toolbar "Layers" button) with checkbox + color swatch + per-layer edge count, plus All / None bulk toggles. Edges are colored by deterministic palette hash on layer name; hiding a layer suppresses its edges + arrowheads + particles in all three graph engines without rebuilding the simulation. 3D Graph uses `linkVisibility` / `linkColor` callbacks; Cytoscape uses a `layer-hidden` class + `data(layerColor)`; D3 ForceGraph applies per-link `display` + stroke. Edges without a `layer` field always show in default cyan.
