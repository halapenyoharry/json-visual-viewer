import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { ModuleProps } from "../types";
import type { HierarchyNode } from "../../utils/jsonToHierarchy";
import { useModuleSurface } from "../useModuleSurface";
import type { TreeParams } from "./schema";

const EMPTY_TREE: HierarchyNode = { name: "Invalid JSON" };

export function TreeComponent({ data, params }: ModuleProps<TreeParams>) {
  const { containerRef, size } = useModuleSurface();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const resetRef = useRef<() => void>(() => {});

  const rootData = data.hierarchy ?? EMPTY_TREE;

  useEffect(() => {
    if (!containerRef.current || !rootData) return;
    if (size.width === 0 || size.height === 0) return;

    if (svgRef.current) {
      svgRef.current.remove();
      svgRef.current = null;
    }

    const container = containerRef.current;
    const { width, height } = size;
    const { layout, direction, spacingX, spacingY, fontSize, nodeColor, linkColor } = params;

    const root = d3.hierarchy<HierarchyNode>(rootData, (d) => d.children);
    const layoutEngine =
      layout === "cluster" ? d3.cluster<HierarchyNode>() : d3.tree<HierarchyNode>();
    layoutEngine.nodeSize([spacingX, spacingY])(root);

    let x0 = Infinity;
    let x1 = -x0;
    root.each((d) => {
      if ((d.x ?? 0) > x1) x1 = d.x ?? 0;
      if ((d.x ?? 0) < x0) x0 = d.x ?? 0;
    });

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("max-width", "100%")
      .style("height", "auto")
      .style("font-family", "sans-serif")
      .style("font-size", `${fontSize}px`);

    svgRef.current = svg.node();

    const g = svg.append("g");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom);

    const xMult = direction === "RL" ? -1 : 1;
    const yMult = direction === "BT" ? -1 : 1;
    const isVertical = direction === "TB" || direction === "BT";

    g.append("g")
      .attr("fill", "none")
      .attr("stroke", linkColor)
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(root.links() as d3.HierarchyPointLink<HierarchyNode>[])
      .join("path")
      .attr(
        "d",
        isVertical
          ? d3
              .linkVertical<
                d3.HierarchyLink<HierarchyNode>,
                d3.HierarchyPointNode<HierarchyNode>
              >()
              .x((d) => (d.x ?? 0) * xMult)
              .y((d) => (d.y ?? 0) * yMult)
          : d3
              .linkHorizontal<
                d3.HierarchyLink<HierarchyNode>,
                d3.HierarchyPointNode<HierarchyNode>
              >()
              .x((d) => (d.y ?? 0) * xMult)
              .y((d) => (d.x ?? 0) * yMult),
      );

    const node = g
      .append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
      .selectAll("g")
      .data(root.descendants() as d3.HierarchyPointNode<HierarchyNode>[])
      .join("g")
      .attr(
        "transform",
        (d) =>
          `translate(${
            isVertical ? (d.x ?? 0) * xMult : (d.y ?? 0) * xMult
          },${isVertical ? (d.y ?? 0) * yMult : (d.x ?? 0) * yMult})`,
      );

    const drag = d3
      .drag<SVGGElement, d3.HierarchyPointNode<HierarchyNode>>()
      .on("drag", function (event) {
        const selection = d3.select(this);
        const transform = selection.attr("transform");
        const match = /translate\(([^,]+),([^)]+)\)/.exec(transform);
        if (match) {
          const cx = parseFloat(match[1]) + event.dx;
          const cy = parseFloat(match[2]) + event.dy;
          selection.attr("transform", `translate(${cx},${cy})`);
        }
      });

    node.call(drag as unknown as Parameters<typeof node.call>[0]);

    node
      .append("circle")
      .attr("fill", (d) => (d.children ? linkColor : nodeColor))
      .attr("r", 3.5);

    node
      .append("text")
      .attr("dy", isVertical ? "1.25em" : "0.31em")
      .attr("x", (d) =>
        isVertical
          ? 0
          : d.children
            ? direction === "RL"
              ? 6
              : -6
            : direction === "RL"
              ? -6
              : 6,
      )
      .attr("text-anchor", (d) =>
        isVertical
          ? "middle"
          : d.children
            ? direction === "RL"
              ? "start"
              : "end"
            : direction === "RL"
              ? "end"
              : "start",
      )
      .text((d) => d.data.name)
      .style("font-size", `${fontSize}px`)
      .attr("fill", "#DCE5E7")
      .clone(true)
      .lower()
      .attr("stroke", "#080c22")
      .attr("stroke-width", 3);

    const defaultTransform = d3.zoomIdentity
      .translate(
        isVertical
          ? width / 2
          : direction === "RL"
            ? width - spacingY
            : spacingY,
        isVertical
          ? direction === "BT"
            ? height - spacingY
            : spacingY
          : height / 2 - (x0 + x1) / 2,
      )
      .scale(1);
    svg.call(zoom.transform as never, defaultTransform);

    resetRef.current = () => {
      svg
        .transition()
        .duration(500)
        .call(zoom.transform as never, defaultTransform);
    };

    return () => {
      if (svgRef.current) {
        svgRef.current.remove();
        svgRef.current = null;
      }
    };
  }, [rootData, params, size, containerRef]);

  return (
    <div
      className="graph-panel"
      ref={containerRef}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    >
      <button
        className="view-reset-btn"
        onClick={() => resetRef.current()}
        title="Reset view"
      >
        ⤢
      </button>
    </div>
  );
}
