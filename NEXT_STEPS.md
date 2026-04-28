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

### SVG snapshot + explore mode (the third thing)

**Idea**: at scale, the per-frame layout/render loop is the expensive part.
Once a graph is laid out, capture the result as SVG and let the browser's
native vector zoom/pan take over (GPU-accelerated, single repaint per frame).
You give up real-time interactivity — drag, hover effects, dynamic labels —
but you gain effectively-free zoom and pan at any node count.

**When it makes sense**: read-only inspection of large networks where the user
just wants to see the shape. Pair with the live view: "Explore" toggle freezes
the layout, snapshots to SVG, and lets you pan the static image.

**Plan sketch**:
1. Add `Explore` toggle to graph-family views (D3, Cytoscape, eventually 3D)
2. On enable: stop simulation, serialize current SVG (or rasterize WebGL canvas)
3. Mount an `<svg>` viewer with d3.zoom — minimal interactivity, infinite scale
4. On disable: restore live view, resume simulation if applicable
5. Bonus: this is also our SVG export path (already wired for one-shot export
   via Cmd+Shift+P) — Explore mode is just "export and keep showing the export"

**Risk**: Cytoscape's SVG export is via a plugin (`cytoscape-svg`). 3D-force
doesn't have an SVG path — would need a 2D-fallback for snapshot mode. Maybe
Explore only applies to inherently-SVG views (D3 ForceGraph, Tree, Circles)
and 3D gets a different freeze-frame strategy (PNG raster).

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
