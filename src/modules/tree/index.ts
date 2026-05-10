import type { JsonModule } from "../types";
import { TreeComponent } from "./Component";
import { TreeSettingsComponent } from "./Settings";
import { treeSchema, treeDefaults, type TreeParams } from "./schema";

export const treeModule: JsonModule = {
  id: "tree",
  label: "Tree",
  description: "Hierarchical D3 tree (cluster or tidy) with zoom/pan/drag.",
  version: "1.0.0",
  schema: treeSchema,
  defaults: treeDefaults as unknown as Record<string, unknown>,
  data: {
    accepts: ["hierarchy"],
    preferred: "hierarchy",
  },
  capabilities: {
    exportSvg: true,
    resetView: true,
  },
  Component: TreeComponent as unknown as JsonModule["Component"],
  SettingsComponent: TreeSettingsComponent as unknown as JsonModule["SettingsComponent"],
};

export type { TreeParams };
export { treeSchema, treeDefaults };
