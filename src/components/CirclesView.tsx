import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useStore } from "../store/useStore";
import { jsonToHierarchy } from "../utils/jsonToHierarchy";
import type { HierarchyNode } from "../utils/jsonToHierarchy";
import "./CirclesView.css";

type PackNode = d3.HierarchyCircularNode<HierarchyNode>;

export function CirclesView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { json, isExplodedView } = useStore();

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

  const rootData = useMemo<HierarchyNode>(() => {
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

    const { width, height } = size;
    const diameter = Math.min(width, height);
    const container = containerRef.current;

    const hierarchy = d3
      .hierarchy<HierarchyNode>(rootData, (d) => d.children)
      .sum((d) => (d.children && d.children.length > 0 ? 0 : 1))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const pack = d3
      .pack<HierarchyNode>()
      .size([diameter, diameter])
      .padding(3);

    const root = pack(hierarchy);

    const maxDepth = d3.max(root.descendants(), (d) => d.depth) ?? 1;
    const color = d3
      .scaleLinear<string>()
      .domain([0, Math.max(maxDepth, 1)])
      .range(["#0f1447", "#00e5ff"])
      .interpolate(d3.interpolateHcl);

    const svg = d3
      .select(container)
      .append("svg")
      .attr("viewBox", `-${diameter / 2} -${diameter / 2} ${diameter} ${diameter}`)
      .attr("width", width)
      .attr("height", height)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("class", "circles-svg");

    svgRef.current = svg.node();

    let focus: PackNode = root;
    let view: [number, number, number] = [root.x, root.y, root.r * 2];

    const node = svg
      .append("g")
      .selectAll<SVGCircleElement, PackNode>("circle")
      .data(root.descendants().slice(1))
      .join("circle")
      .attr("class", "circle-node")
      .attr("fill", (d) => (d.children ? color(d.depth) : "#131940"))
      .attr("stroke", (d) =>
        d.children ? "rgba(0, 229, 255, 0.18)" : "rgba(0, 229, 255, 0.35)"
      )
      .attr("stroke-width", 0.6)
      .attr("pointer-events", (d) => (!d.children ? "none" : null))
      .on("mouseover", function () {
        d3.select(this).attr("stroke", "#00e5ff").attr("stroke-width", 2);
      })
      .on("mouseout", function () {
        const d = d3.select<SVGCircleElement, PackNode>(this).datum();
        d3.select(this)
          .attr(
            "stroke",
            d.children ? "rgba(0, 229, 255, 0.18)" : "rgba(0, 229, 255, 0.35)"
          )
          .attr("stroke-width", 0.6);
      })
      .on("click", (event: MouseEvent, d) => {
        if (focus !== d) {
          zoom(d);
          event.stopPropagation();
        }
      });

    const label = svg
      .append("g")
      .attr("class", "circle-labels")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .selectAll<SVGTextElement, PackNode>("text")
      .data(root.descendants())
      .join("text")
      .attr("class", "circle-label")
      .style("fill-opacity", (d) => (d.parent === root ? 1 : 0))
      .style("display", (d) => (d.parent === root ? "inline" : "none"))
      .text((d) => d.data.name);

    svg.on("click", () => {
      if (focus !== root) zoom(root);
    });

    zoomTo(view);

    function zoomTo(v: [number, number, number]) {
      const k = diameter / v[2];
      view = v;
      label.attr(
        "transform",
        (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
      );
      node.attr(
        "transform",
        (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
      );
      node.attr("r", (d) => d.r * k);
    }

    function zoom(d: PackNode) {
      focus = d;
      const transition = svg
        .transition()
        .duration(750)
        .tween("zoom", () => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return (t) => zoomTo(i(t) as [number, number, number]);
        });

      label
        .filter(function (d) {
          return (
            d.parent === focus ||
            (this as SVGTextElement).style.display === "inline"
          );
        })
        .transition(transition as unknown as d3.Transition<SVGTextElement, PackNode, SVGGElement, unknown>)
        .style("fill-opacity", (d) => (d.parent === focus ? 1 : 0))
        .on("start", function (d) {
          if (d.parent === focus)
            (this as SVGTextElement).style.display = "inline";
        })
        .on("end", function (d) {
          if (d.parent !== focus)
            (this as SVGTextElement).style.display = "none";
        });
    }

    return () => {
      if (svgRef.current) {
        svgRef.current.remove();
        svgRef.current = null;
      }
    };
  }, [rootData, size]);

  return <div className="circles-panel" ref={containerRef} />;
}
