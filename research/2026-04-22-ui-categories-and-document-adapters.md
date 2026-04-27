# UI Categories and Per-Host Document Adapters

*Date: 2026-04-22*
*Context: the UI is getting unwieldy; we need to name the categories of controls, and we need to recognize that VSCode and macOS Tauri have fundamentally different relationships with files.*

## The five categories of control that actually exist

Right now they're smeared across one toolbar and one sidebar. Naming them reveals what belongs where.

| Category | Examples | Scope |
|---|---|---|
| **Document** | Open, Save, Export SVG | Host-specific — each wrapper should implement differently |
| **Workspace** | Editor toggle, Control Panel toggle | Per-host, same semantics |
| **View** | Tree / Graph / Circles / Mass | Shared across hosts |
| **View controls** | Tree layout/orientation/spacing/aesthetics; array display; explode | Shared, but uneven (Tree has 8 knobs, Graph has zero) |
| **Preferences** | Editor Font | Global, cross-view, currently mis-filed inside Control Panel |

### Category leaks to fix

- The sidebar header says "Tree Control Panel" but shows a font picker that isn't about Tree at all. Preferences should not live under a view-scoped header.
- Graph view has an empty settings component ("No graph-specific settings yet"). That's a bug, not a design choice — either give Graph real controls (charge, link distance, node labels) or hide the Control Panel toggle when viewing Graph.
- File I/O lives in the shared toolbar but its semantics are different per host (see next section).

## The Document row is where the three hosts genuinely diverge

Everything else can stay shared. Only Document deserves a per-host adapter.

### macOS (Tauri)
- `Open` should be a real `dialog.open()` returning a file handle.
- `Save` should write back to that handle — not download a blob.
- Add: drag-and-drop from Finder, Open Recent menu, file-association for `.json`.
- The browser `<input type=file>` trick in `src/utils/fileIO.ts` is a web-ism that shouldn't be the macOS app's Open implementation.

### VSCode
- The JSON is already in an editor tab. The webview shouldn't have Open/Save/Export buttons at all.
- "Open" and "Save" in the webview are conceptually wrong here — the source of truth is the editor buffer.
- Currently `src-vscode/panel.ts` does one-shot `postJson` but there's no bidirectional sync. Three possible levels:
  1. **One-shot** (current) — view what was sent once, no live updates.
  2. **Live read** — edit the JSON in the VSCode editor, graph updates automatically.
  3. **Bidirectional** — edit in the webview, writes flow back to the editor buffer.
  Each level is roughly 3x the work of the previous.

### Web
- Current behavior (upload → FileReader → blob → download) is correct and should stay.

### The adapter shape

Introduce a `DocumentAdapter` interface:

- `open()`
- `save()`
- `onExternalChange()`
- `capabilities: string[]`

Each wrapper injects one. The toolbar reads `capabilities` and renders only the buttons the host actually supports. VSCode's adapter returns `capabilities: []` and the Document section disappears entirely from its toolbar.

## The UI reshape that falls out

- **Top bar (always shown):** view switcher + workspace toggles. That's it. No file I/O buttons by default.
- **Document actions:** surfaced by the host — native `File` menu on macOS, Command Palette on VSCode, a small toolbar group on web only.
- **Control Panel:** strictly per-view controls. Rename header from `"{ViewLabel} Control Panel"` to just `{ViewLabel}` (the panel *is* the control panel).
- **Preferences pane:** separate. Cog icon at the bottom of the Control Panel opens a modal or flyout with Font, default view, color scheme. Not mixed with Tree-specific settings.
- **Graph view settings:** either real controls or hide the Control Panel toggle for this view.

## Open questions before implementation

1. **Native menu bar on macOS** — are we OK with the Tauri app having a real `File` menu? (Requires a chunk of Rust in `src-tauri/src/`.) It's the right move but it's the biggest ticket.
2. **VSCode document sync level** — one-shot (current), live read, or bidirectional? (~3x cost each step up.)
3. **Control Panel form factor** — stay a right-rail sidebar, or move to a floating inspector, bottom drawer, or collapsible sections? This is a feel question, not a technical one.

## Scope note

Don't start implementing until the three questions above are answered. The `DocumentAdapter` interface is the cleanest first commit — it's pure refactoring that doesn't require UI decisions, and it makes the remaining UI choices easier because the host-specific mess moves out of the toolbar.
