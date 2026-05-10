import { useEffect, useMemo, useState } from "react";
import { useStore } from "../store/useStore";
import { jsonToHierarchy, countHierarchyNodes } from "../utils/jsonToHierarchy";
import { ModuleHost } from "../host/ModuleHost";
import type { ModuleData } from "../modules/types";
import type { TreeParams } from "../modules/tree";
import { PerfWarning } from "./PerfWarning";
import "./TreeView.css";

const TREE_NODE_THRESHOLD = 10000;

/**
 * Thin bridge between the global store and treeModule.
 *
 * Step 2 of the modular refactor — the visualization itself lives at
 * src/modules/tree/. This wrapper stays for now to:
 *   - read store fields and adapt them to TreeParams
 *   - host-level perf warning (moves to ModuleHost in step 8)
 *
 * Eventually App.tsx will mount <ModuleHost moduleId={viewMode}/> directly
 * and this wrapper goes away.
 */
export function TreeView() {
  const {
    json,
    isExplodedView,
    treeLayout,
    treeDirection,
    treeSpacing,
    treeFontSize,
    treeColors,
    showArrayIndices,
    setTreeLayout,
    setTreeDirection,
    setTreeSpacing,
    setTreeFontSize,
    setTreeColors,
  } = useStore();

  const rootData = useMemo(() => {
    try {
      const parsed = JSON.parse(json);
      return jsonToHierarchy(parsed, isExplodedView, "root", showArrayIndices);
    } catch {
      return { name: "Invalid JSON" };
    }
  }, [json, isExplodedView, showArrayIndices]);

  const nodeCount = useMemo(() => countHierarchyNodes(rootData), [rootData]);
  const [bypassPerf, setBypassPerf] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBypassPerf(false);
  }, [nodeCount]);
  const perfBlocked = nodeCount > TREE_NODE_THRESHOLD && !bypassPerf;

  const data: ModuleData = useMemo(() => ({ hierarchy: rootData }), [rootData]);
  const params: TreeParams = useMemo(
    () => ({
      layout: treeLayout,
      direction: treeDirection,
      spacingX: treeSpacing.dx,
      spacingY: treeSpacing.dy,
      fontSize: treeFontSize,
      nodeColor: treeColors.node,
      linkColor: treeColors.link,
    }),
    [treeLayout, treeDirection, treeSpacing, treeFontSize, treeColors],
  );

  const handleParamChange = (path: string, value: unknown) => {
    switch (path) {
      case "layout":
        setTreeLayout(value as TreeParams["layout"]);
        break;
      case "direction":
        setTreeDirection(value as TreeParams["direction"]);
        break;
      case "spacingX":
        setTreeSpacing({ ...treeSpacing, dx: value as number });
        break;
      case "spacingY":
        setTreeSpacing({ ...treeSpacing, dy: value as number });
        break;
      case "fontSize":
        setTreeFontSize(value as number);
        break;
      case "nodeColor":
        setTreeColors({ ...treeColors, node: value as string });
        break;
      case "linkColor":
        setTreeColors({ ...treeColors, link: value as string });
        break;
    }
  };

  if (perfBlocked) {
    return (
      <div
        className="graph-panel"
        style={{ width: "100%", height: "100%", overflow: "hidden" }}
      >
        <PerfWarning
          nodeCount={nodeCount}
          viewLabel="Tree"
          countLabel="JSON tree entities"
          onBypass={() => setBypassPerf(true)}
        />
      </div>
    );
  }

  return (
    <ModuleHost
      moduleId="tree"
      data={data}
      params={params as unknown as Record<string, unknown>}
      onParamChange={handleParamChange}
    />
  );
}
