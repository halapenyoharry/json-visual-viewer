# Next Steps

Living roadmap. Add items at the bottom of the relevant section. Move to "Done" when shipped, prune when stale. Cross-session memory for the project.

## Now (next session)

### 3D Graph View — multi-graph + WebGL

**Why now**: Cytoscape's canvas renderer is choking at 3k+ nodes. WebGL is the
real fix; 3D is a bonus that solves multi-graph readability for free (parallel
edges fan out in Z instead of overlapping in 2D).

**Library**: `react-force-graph-3d` (vasturiano). MIT, Three.js based, used by
Observable / GitHub network views. The same author publishes
`react-force-graph-2d` (PixiJS WebGL) — could double as a "Sigma-tier" 2D view
for users who want flat WebGL.

Why this over Sigma.js:
- Edge labels along arrow inline (the look you liked) is built-in via
  `linkLabel` + `linkDirectionalParticles` + `linkThreeObjectExtend`.
- Multi-graph: `linkCurvature` + `linkCurveRotation` auto-fan parallel edges
  around the source-target axis. No manual offset math.
- Scales to 10k+ nodes per their benchmarks; we can verify before committing.
- React-native API, drops into the existing view contract cleanly.

Why not Cosmograph: license complications (commercial restriction), CSV-first,
overkill at 3-10k nodes.

**Plan**:
1. `npm i react-force-graph-3d three` — three is a peer dep
2. Add `'graph3d'` to `ViewMode` union; persist 3D-specific settings in store
   (mode: '2d' | '3d', particle speed, link curvature, label visibility)
3. New `Graph3DView.tsx`:
   - Use `useViewSurface` for sizing (just like other views)
   - Adapter: `DetectedGraph` → `{ nodes: [{id, name}], links: [{source, target, label}] }`
     — same shape we already produce, basically a rename
   - Multi-graph fan-out: group links by `(source, target)` pair, set
     `linkCurvature` per index in group, `linkCurveRotation` distributes around axis
   - Edge labels: enable `linkThreeObjectExtend: true` + sprite labels along curve
   - Node labels: HTML overlay or sprite — try sprite first, fallback to overlay if perf
   - Color theme: keep cyan/midnight palette
4. New `Graph3DSettings.tsx`:
   - 2D / 3D toggle
   - Particle effects on/off (the dotted-line directional flow)
   - Label visibility (always / on hover / never)
   - Curvature strength slider (multi-graph fan width)
5. Register in `viewsRegistry` between Cytoscape and Circles
6. Decide later: keep D3 ForceGraph + Cytoscape both, or retire D3 ForceGraph
   once 3D is solid. Cytoscape stays for layout variety (dagre, breadthfirst,
   concentric — things 3D-force can't do).

**Open question — Chrome fallback**: VS Code webviews allow WebGL but the
extension-host overhead may still bite at very large scale. Plan B: add a
`Open in Browser` button that writes the current JSON to a temp file and opens
`http://localhost:NNNN/?file=…` against a tiny vite preview server. Last-resort
escape hatch, not the default.

**Acceptance**: 3000-node graph pans/zooms at 30+ fps, parallel edges visibly
distinct, edge labels readable along the arrow.

### Cytoscape perf flags — DONE in v0.1.1 (next package)

Flipped `hideEdgesOnViewport`, `hideLabelsOnViewport`, `textureOnViewport`,
`motionBlur`, `pixelRatio: 1`. Should give 2-5x at 1k+ nodes during pan/zoom.
Bake into the next `vsce package` cycle.

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
- v0.1.1 (pending package): Cytoscape perf flags
