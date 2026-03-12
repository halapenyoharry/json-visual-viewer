# JVV — JSON Visual Viewer

A lightweight native macOS app for visualizing JSON as interactive node graphs.

Paste or open a JSON file, see it as a 2D graph instantly. Built with Tauri so the whole app is ~10MB, not 300MB.

**Status: Early development — looking for testers!** If you try it out, open an issue with what you find.

## Features

- Interactive 2D graph visualization of JSON (powered by jsoncrack-react)
- Monaco editor with live preview
- Layout direction controls (→ ↓ ← ↑)
- Open `.json` files from disk
- Dark theme
- Native macOS app via Tauri (Apple Silicon)

## Planned

- 3D graph view (reagraph / Three.js)
- Drag and drop file support
- Export graph as image

## Build from source

**Prerequisites:**
- Node.js 20+
- Rust (via [rustup](https://rustup.rs))
- Xcode Command Line Tools (`xcode-select --install`)

```
git clone https://github.com/halapenyoharry/json-visual-viewer.git
cd json-visual-viewer
npm install
npx tauri build
```

The `.app` bundle lands in `src-tauri/target/release/bundle/macos/`.

## Dev mode

```
npx tauri dev
```

## Tech stack

- React + TypeScript + Vite
- jsoncrack-react (2D graph)
- Monaco Editor
- Zustand (state)
- Tauri 2.x (native wrapper)

## License

MIT
