import type { ComponentType } from "react";
import type { ViewMode } from "./store/useStore";
import { TreeView } from "./components/TreeView";
import { TreeSettings } from "./components/TreeSettings";
import { CirclesView } from "./components/CirclesView";
import { CirclesSettings } from "./components/CirclesSettings";
import { ForceGraphView } from "./components/ForceGraphView";
import { GraphSettings } from "./components/GraphSettings";

export interface ViewDefinition {
  id: ViewMode;
  label: string;
  titleTip: string;
  view: ComponentType;
  settings: ComponentType;
  supportsExplode: boolean;
  requiresGraph?: boolean;
}

export const VIEWS: ViewDefinition[] = [
  {
    id: "tree",
    label: "Tree",
    titleTip: "Tree view (structural)",
    view: TreeView,
    settings: TreeSettings,
    supportsExplode: true,
  },
  {
    id: "graph",
    label: "Graph",
    titleTip: "Graph view (relational)",
    view: ForceGraphView,
    settings: GraphSettings,
    supportsExplode: false,
    requiresGraph: true,
  },
  {
    id: "circles",
    label: "Circles",
    titleTip: "Circles view (zoomable circle packing)",
    view: CirclesView,
    settings: CirclesSettings,
    supportsExplode: true,
  },
];

export function getView(id: ViewMode): ViewDefinition {
  const v = VIEWS.find((x) => x.id === id);
  if (!v) throw new Error(`Unknown view mode: ${id}`);
  return v;
}
