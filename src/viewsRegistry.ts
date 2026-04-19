import type { ComponentType } from "react";
import type { ViewMode } from "./store/useStore";
import { TreeView } from "./components/TreeView";
import { TreeSettings } from "./components/TreeSettings";
import { CirclesView } from "./components/CirclesView";
import { CirclesSettings } from "./components/CirclesSettings";
import { ForceGraphView } from "./components/ForceGraphView";
import { GraphSettings } from "./components/GraphSettings";

// Contract every view should honor:
//   - Render itself into its panel, filling the available space
//   - Use a ResizeObserver so it redraws when its container resizes
//   - Clean up all DOM/SVG/simulations on unmount
//   - Provide its own zoom/pan affordance appropriate to the view
//   - Render an empty/error state when the JSON is unsuitable for it
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
    id: "circles",
    label: "Circles",
    titleTip: "Circles view (zoomable circle packing)",
    hint: "Click circle to zoom · Click background to exit",
    view: CirclesView,
    settings: CirclesSettings,
  },
];

export function getView(id: ViewMode): ViewDefinition {
  const v = VIEWS.find((x) => x.id === id);
  if (!v) throw new Error(`Unknown view mode: ${id}`);
  return v;
}
