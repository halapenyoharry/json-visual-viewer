import { useEffect, useRef, useMemo, useState } from "react";
import * as d3 from "d3";
import { useStore } from "../store/useStore";
import { jsonToHierarchy } from "../utils/jsonToHierarchy";
import type { HierarchyNode } from "../utils/jsonToHierarchy";
import "./TreeView.css";

export function TreeView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const {
    json,
    isExplodedView,
    treeLayout,
    treeDirection,
    treeSpacing,
    treeFontSize,
    treeColors,
  } = useStore();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () =>
      setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rootData = useMemo(() => {
    try {
      const parsed = JSON.parse(json);
      return jsonToHierarchy(parsed, isExplodedView, "root");
    } catch {
      return { name: "Invalid JSON" };
    }
  }, [json, isExplodedView]);

  useEffect(() => {
    if (!containerRef.current || !rootData) return;
    if (size.width === 0 || size.height === 0) return;

    if (svgRef.current) {
      svgRef.current.remove();
      svgRef.current = null;
    }

    const container = containerRef.current;
    const { width, height } = size;

    const root = d3.hierarchy<HierarchyNode>(rootData, (d) => d.children);

    const { dx, dy } = treeSpacing;
    const layoutEngine = treeLayout === "cluster" ? d3.cluster<HierarchyNode>() : d3.tree<HierarchyNode>();
    layoutEngine.nodeSize([dx, dy])(root);

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
      .style("font-size", "11px");

    svgRef.current = svg.node();

    const g = svg.append("g");

    // Add zoom/pan
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom);

    // Orientation Multipliers
    const xMult = treeDirection === "RL" ? -1 : 1;
    const yMult = treeDirection === "BT" ? -1 : 1;
    const isVertical = treeDirection === "TB" || treeDirection === "BT";

    g.append("g")
      .attr("fill", "none")
      .attr("stroke", treeColors.link)
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(root.links() as d3.HierarchyPointLink<HierarchyNode>[])
      .join("path")
      .attr(
        "d",
        isVertical
          ? d3.linkVertical<d3.HierarchyLink<HierarchyNode>, d3.HierarchyPointNode<HierarchyNode>>()
              .x((d) => (d.x ?? 0) * xMult)
              .y((d) => (d.y ?? 0) * yMult)
          : d3.linkHorizontal<d3.HierarchyLink<HierarchyNode>, d3.HierarchyPointNode<HierarchyNode>>()
              .x((d) => (d.y ?? 0) * xMult)
              .y((d) => (d.x ?? 0) * yMult)
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
          `translate(${isVertical ? (d.x ?? 0) * xMult : (d.y ?? 0) * xMult},${
            isVertical ? (d.y ?? 0) * yMult : (d.x ?? 0) * yMult
          })`
      );

    // Draggable behavior
    const drag = d3.drag<SVGGElement, d3.HierarchyPointNode<HierarchyNode>>()
      .on("drag", function (event) {
        // Only update visually to prevent full re-renders
        const selection = d3.select(this);
        const transform = selection.attr("transform");
        // We do a simple translate update for the dragging effect
        // Fully recalculating lines on pure drag in a static tree layout is complex 
        // without force physics, so we just let them visually nudge the nodes.
        const match = /translate\(([^,]+),([^)]+)\)/.exec(transform);
        if (match) {
          const cx = parseFloat(match[1]) + event.dx;
          const cy = parseFloat(match[2]) + event.dy;
          selection.attr("transform", `translate(${cx},${cy})`);
        }
      });
      
    node.call(drag as any);

    node
      .append("circle")
      .attr("fill", (d) => (d.children ? treeColors.link : treeColors.node))
      .attr("r", 3.5);

    node
      .append("text")
      .attr("dy", isVertical ? "1.25em" : "0.31em")
      .attr("x", (d) => (isVertical ? 0 : d.children ? (treeDirection === "RL" ? 6 : -6) : (treeDirection === "RL" ? -6 : 6)))
      .attr("text-anchor", (d) => (isVertical ? "middle" : d.children ? (treeDirection === "RL" ? "start" : "end") : (treeDirection === "RL" ? "end" : "start")))
      .text((d) => d.data.name)
      .style("font-size", `${treeFontSize}px`)
      .attr("fill", "#DCE5E7")
      .clone(true)
      .lower()
      .attr("stroke", "#080c22")
      .attr("stroke-width", 3);

    // Initial transform to center the tree depending on orientation
    const defaultTransform = d3.zoomIdentity
       .translate(isVertical ? width / 2 : treeDirection === "RL" ? width - dy : dy, isVertical ? (treeDirection === "BT" ? height - dy : dy) : height / 2 - (x0 + x1) / 2)
       .scale(1);
    svg.call(zoom.transform as never, defaultTransform);

    return () => {
      if (svgRef.current) {
         svgRef.current.remove();
         svgRef.current = null;
      }
    };
  }, [rootData, treeLayout, treeDirection, treeSpacing, treeFontSize, treeColors, size]);

  return <div className="graph-panel" ref={containerRef} style={{ width: "100%", height: "100%", overflow: "hidden" }} />;
}
