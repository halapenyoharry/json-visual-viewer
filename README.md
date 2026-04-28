# JVV — JSON Visual Viewer

Drop in any JSON, see it as an interactive graph, tree, or circle-pack.

Ships as a VS Code / Cursor extension and a native macOS app (Tauri). Same React webview either way — paste or open a `.json` file, the app auto-detects graph structures (`{nodes, links}`, edge arrays, single-node-with-edges) and offers the right view.

**Status: Early development — looking for testers!** If you try it out, open an issue with what you find.

## Views

| View | Best for | Engine |
|---|---|---|
| **Tree** | Hierarchies, structural overview | D3 SVG |
| **Graph** | Small/medium graphs | D3 force simulation, SVG |
| **Cytoscape** | Layout variety (dagre / breadthfirst / concentric / fcose) | Cytoscape.js (canvas) |
| **3D Graph** | Multi-graphs, 1k+ nodes, parallel edges | three.js / WebGL via `react-force-graph-3d` |
| **Circles** | Nested array packing, "shape of the data" | D3 pack |
| **Mass** | Substrate-normalized circle pack (size by mass, not count) | D3 pack |

A **Freeze** toggle pins the layout for inspection in the graph-family views — particles pause, simulation halts, drag won't kick it back.

## How big a JSON can it handle?

Honest answer: it depends on the view, but here's a rough ladder. Each view has a perf threshold that prompts before rendering — click "Render anyway" to push past it.

| Nodes | What to expect |
|---|---|
| **< 1k** | Buttery — every view, no thinking |
| **1k – 3k** | Smooth in 3D Graph, Tree, Circles. Cytoscape OK after perf flags. D3 ForceGraph guards at 500. |
| **3k – 10k** | 3D Graph (WebGL) is the right pick. 2D canvas / SVG views start to chug. |
| **10k – 30k** | Stretch zone. 3D Graph still works on a decent GPU but settles slowly. |
| **30k +** | Out of scope today. Big LLM chat exports (Anthropic / ChatGPT conversation dumps) often land here — JVV will offer to render anyway, but expect serious chug. |

If you've got a giant export and want a useful view, try filtering it down first (e.g. one conversation at a time) until we add precomputed-layout / snapshot mode for huge graphs.

## VS Code / Cursor extension

Install the latest `.vsix`:

```
code --install-extension json-visual-viewer-0.1.2.vsix
# or:
cursor --install-extension json-visual-viewer-0.1.2.vsix
```

Then right-click any `.json` file → **JSON Visual Viewer: View Current File**, or use the custom editor option in the "Open With…" menu.

## Build from source

**Prerequisites:**
- Node.js 20+
- For the Tauri build: Rust ([rustup](https://rustup.rs)) + Xcode Command Line Tools (`xcode-select --install`)

```
git clone https://github.com/halapenyoharry/json-visual-viewer.git
cd json-visual-viewer
npm install
```

**VS Code extension (.vsix):**
```
npm run package:vscode
```

**macOS app (Tauri):**
```
npx tauri build
```
The `.app` bundle lands in `src-tauri/target/release/bundle/macos/`.

## Dev mode

Browser (fastest iteration):
```
npm run dev
```

Tauri:
```
npx tauri dev
```

## Tech stack

- React 19 + TypeScript + Vite
- D3 (force, tree, pack), Cytoscape.js (+ fcose), `react-force-graph-3d` + three.js + `three-spritetext`
- Monaco Editor (live JSON editing)
- Zustand (state, with persist)
- Tauri 2.x (native macOS wrapper) / VS Code Webview API (extension)

## License

MIT
