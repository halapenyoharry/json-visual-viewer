import { useStore } from "../store/useStore";
import { TreeSettingsComponent } from "../modules/tree/Settings";
import { treeSchema, type TreeParams } from "../modules/tree";
import { ArrayDisplaySection } from "./ArrayDisplaySection";
import { ExplodeToggle } from "./ExplodeToggle";

/**
 * Thin bridge that maps store fields to TreeParams and back, then defers
 * to the module's SettingsComponent. Shared data toggles
 * (ArrayDisplaySection, ExplodeToggle) are appended at the host level.
 */
export function TreeSettings() {
  const {
    treeLayout,
    setTreeLayout,
    treeDirection,
    setTreeDirection,
    treeSpacing,
    setTreeSpacing,
    treeFontSize,
    setTreeFontSize,
    treeColors,
    setTreeColors,
  } = useStore();

  const params: TreeParams = {
    layout: treeLayout,
    direction: treeDirection,
    spacingX: treeSpacing.dx,
    spacingY: treeSpacing.dy,
    fontSize: treeFontSize,
    nodeColor: treeColors.node,
    linkColor: treeColors.link,
  };

  const handleChange = (path: string, value: unknown) => {
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

  return (
    <>
      <TreeSettingsComponent
        params={params}
        schema={treeSchema}
        onChange={handleChange}
      />
      <ArrayDisplaySection />
      <ExplodeToggle />
    </>
  );
}
