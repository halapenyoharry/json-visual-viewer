import type { ComponentType } from "react";
import type { ViewMode } from "./store/useStore";
import { TreeView } from "./components/TreeView";
import { TreeSettings } from "./components/TreeSettings";
import { CirclesView } from "./components/CirclesView";
import { CirclesSettings } from "./components/CirclesSettings";
import { MassCirclesView } from "./components/MassCirclesView";
import { MassCirclesSettings } from "./components/MassCirclesSettings";
import { ForceGraphView } from "./components/ForceGraphView";
import { GraphSettings } from "./components/GraphSettings";
import { CytoscapeView } from "./components/CytoscapeView";
import { CytoscapeSettings } from "./components/CytoscapeSettings";
import { Graph3DView } from "./components/Graph3DView";
import { Graph3DSettings } from "./components/Graph3DSettings";

/**
 * VIEWS REGISTRY
 * ==============
 * The single source of truth for which views exist. Toolbar buttons,
 * routing in App.tsx, control panel content, and the top-right hint text
 * all wire themselves up by iterating VIEWS.
 *
 * ADDING A NEW VIEW — four steps:
 *
 * 1. Add the view's string id to the ViewMode union in
 *    src/store/useStore.ts.
 *
 * 2. Create src/components/YourView.tsx — a React FC with no props.
 *    Reference implementations:
 *      - src/components/TreeView.tsx       (d3.tree + d3.zoom)
 *      - src/components/CirclesView.tsx    (d3.pack + click-to-zoom)
 *      - src/components/ForceGraphView.tsx (d3.forceSimulation + d3.drag)
 *
 * 3. Create src/components/YourSettings.tsx — a React FC returning a
 *    fragment of <div className="settings-section"> blocks. Compose
 *    shared sections as needed:
 *      - ArrayDisplaySection — Show [0] / Hide indices
 *      - ExplodeToggle       — Compact / Exploded
 *
 * 4. Add an entry to the VIEWS array below with id, label, titleTip,
 *    hint, view, settings, and optional requiresGraph.
 *
 * VIEW CONTRACT — every view must:
 *
 *   [surface]    Use useViewSurface() from ./components/useViewSurface
 *                to get { containerRef, size }. This guarantees the view
 *                redraws when its container resizes (toggling the editor
 *                or control panel, window resize, etc.).
 *
 *   [zoom/pan]   Provide scroll-to-zoom and drag-to-pan via d3.zoom,
 *                OR an equivalent click-to-zoom interaction (like
 *                CirclesView). Users should never feel "stuck" in a view.
 *
 *   [cleanup]    On unmount, remove the SVG/canvas, stop any simulations,
 *                disconnect any observers not owned by useViewSurface.
 *                Return a cleanup from the draw useEffect.
 *
 *   [empty]      When the JSON is unsuitable (no graph detected, invalid
 *                JSON, etc.), render a graceful fallback inside the same
 *                container class as the happy path. Don't crash.
 *
 *   [local]      Keep view-local UI state (current focus, zoom transform)
 *                inside the view. Only things that need to persist or be
 *                shared across views belong in the Zustand store.
 */
export interface ViewDefinition {
  id: ViewMode;
  label: string;
  titleTip: string;
  hint: string;
  view: ComponentType;
  settings: ComponentType;
  requiresGraph?: boolean;
}

export const VIEWS: ViewDefinition[] = [
  {
    id: "tree",
    label: "Tree",
    titleTip: "Tree view (structural)",
    hint: "Scroll to zoom · Drag to pan",
    view: TreeView,
    settings: TreeSettings,
  },
  {
    id: "graph",
    label: "Graph",
    titleTip: "Graph view (relational)",
    hint: "Drag nodes · Scroll to zoom",
    view: ForceGraphView,
    settings: GraphSettings,
    requiresGraph: true,
  },
  {
    id: "cytoscape",
    label: "Cytoscape",
    titleTip: "Cytoscape graph (multi-edge, layouts)",
    hint: "Drag nodes · Scroll to zoom · Multi-edges curve",
    view: CytoscapeView,
    settings: CytoscapeSettings,
    requiresGraph: true,
  },
  {
    id: "graph3d",
    label: "3D Graph",
    titleTip: "3D force graph (WebGL · multi-graph fan-out · edge labels)",
    hint: "Drag to rotate · Scroll to zoom · Right-drag to pan",
    view: Graph3DView,
    settings: Graph3DSettings,
    requiresGraph: true,
  },
  {
    id: "circles",
    label: "Circles",
    titleTip: "Circles view (zoomable circle packing)",
    hint: "Click circle to zoom · Click background to exit",
    view: CirclesView,
    settings: CirclesSettings,
  },
  {
    id: "mass",
    label: "Mass",
    titleTip: "Mass circles (substrate-normalized)",
    hint: "Click circle to zoom · Sized by mass, not count",
    view: MassCirclesView,
    settings: MassCirclesSettings,
  },
];

export function getView(id: ViewMode): ViewDefinition {
  const v = VIEWS.find((x) => x.id === id);
  if (!v) throw new Error(`Unknown view mode: ${id}`);
  return v;
}
