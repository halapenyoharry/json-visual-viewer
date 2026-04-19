import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { useStore } from "../store/useStore";
import { jsonToHierarchy } from "../utils/jsonToHierarchy";
import type { HierarchyNode } from "../utils/jsonToHierarchy";
import { useViewSurface } from "./useViewSurface";
import "./CirclesView.css";

type PackNode = d3.HierarchyCircularNode<HierarchyNode>;

function splitIntoLines(words: string[], n: number): string[] {
  if (n <= 1) return [words.join(" ")];
  if (words.length <= n) return words.slice();
  const totalChars = words.reduce((s, w) => s + w.length, 0);
  const target = totalChars / n;
  const lines: string[][] = Array.from({ length: n }, () => [] as string[]);
  let currentLine = 0;
  let currentChars = 0;
  for (const w of words) {
    if (
      currentChars > 0 &&
      currentChars + w.length / 2 >= target &&
      currentLine < n - 1
    ) {
      currentLine++;
      currentChars = 0;
    }
    lines[currentLine].push(w);
    currentChars += w.length;
  }
  return lines.map((l) => l.join(" ")).filter((l) => l.length > 0);
}

function renderLines(
  textSel: d3.Selection<SVGTextElement, unknown, null, undefined>,
  lines: string[]
): void {
  textSel.selectAll("tspan").remove();
  const n = lines.length;
  const firstDy = n > 1 ? `${-(n - 1) * 0.55}em` : "0";
  lines.forEach((line, i) => {
    textSel
      .append("tspan")
      .attr("x", 0)
      .attr("dy", i === 0 ? firstDy : "1.1em")
      .text(line);
  });
}

function fitWrappedLeafText(
  textSel: d3.Selection<SVGTextElement, unknown, null, undefined>,
  text: string,
  r: number
): void {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    textSel.text("");
    return;
  }
  const node = textSel.node() as SVGTextElement;
  const maxDiag = r * 1.85;
  const maxLines = Math.min(words.length, 6);
  let bestScale = 0;
  let bestLines: string[] = [text];
  for (let n = 1; n <= maxLines; n++) {
    const lines = splitIntoLines(words, n);
    renderLines(textSel, lines);
    const bbox = node.getBBox();
    const diag = Math.hypot(bbox.width, bbox.height);
    const scale = diag > 0 ? maxDiag / diag : 0;
    if (scale > bestScale) {
      bestScale = scale;
      bestLines = lines;
    }
  }
  renderLines(textSel, bestLines);
  textSel.attr("transform", `scale(${bestScale})`);
}


export function CirclesView() {
  const { containerRef, size } = useViewSurface();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const resetRef = useRef<() => void>(() => {});
  const { json, isExplodedView, showArrayIndices } = useStore();

  const rootData = useMemo<HierarchyNode>(() => {
    try {
      const parsed = JSON.parse(json);
      return jsonToHierarchy(parsed, isExplodedView, "root", showArrayIndices);
    } catch {
      return { name: "Invalid JSON" };
    }
  }, [json, isExplodedView, showArrayIndices]);

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

    const panZoomGroup = svg.append("g").attr("class", "circles-pan-zoom");

    const node = panZoomGroup
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

    const label = panZoomGroup
      .append("g")
      .attr("class", "circle-labels")
      .attr("pointer-events", "none")
      .selectAll<SVGGElement, PackNode>("g.circle-label")
      .data(root.descendants())
      .join("g")
      .attr("class", "circle-label")
      .style("opacity", (d) => (d.parent === root ? 1 : 0))
      .style("display", (d) => (d.parent === root ? null : "none"));

    label.each(function (d, i) {
      const g = d3.select<SVGGElement, PackNode>(this);
      const isLeaf = !d.children || d.children.length === 0;

      if (isLeaf) {
        const textEl = g
          .append("text")
          .attr("class", "leaf-text")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .style("font-size", "16px");
        fitWrappedLeafText(textEl, d.data.name, d.r);
      } else {
        const pathId = `cp-${i}`;
        const pathR = d.r * 0.92;
        g.append("path")
          .attr("id", pathId)
          .attr("d", circlePathTopClockwise(pathR))
          .attr("fill", "none")
          .attr("stroke", "none");
        const fontSize = Math.max(d.r * 0.16, 3);
        g.append("text")
          .attr("class", "container-text")
          .style("font-size", `${fontSize}px`)
          .append("textPath")
          .attr("href", `#${pathId}`)
          .attr("startOffset", "0")
          .style("text-anchor", "start")
          .text(d.data.name);
      }
    });

    // d3.zoom on the whole svg — layered ON TOP of Bostock's click-to-zoom
    // focus semantics. User can scroll/drag to pan & zoom freely; click-to-
    // zoom still navigates between focuses. Reset restores both.
    let isZoomDrag = false;
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 12])
      .on("start", () => {
        isZoomDrag = false;
      })
      .on("zoom", (event) => {
        if (event.sourceEvent) isZoomDrag = true;
        panZoomGroup.attr("transform", event.transform.toString());
      });

    svg.call(zoomBehavior).on("dblclick.zoom", null);

    svg.on("click", () => {
      if (isZoomDrag) return;
      if (focus !== root) zoom(root);
    });

    resetRef.current = () => {
      svg
        .transition()
        .duration(500)
        .call(zoomBehavior.transform as never, d3.zoomIdentity);
      if (focus !== root) zoom(root);
    };

    zoomTo(view);

    function zoomTo(v: [number, number, number]) {
      const k = diameter / v[2];
      view = v;
      label.attr(
        "transform",
        (d) =>
          `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k}) scale(${k})`
      );
      node.attr(
        "transform",
        (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
      );
      node.attr("r", (d) => d.r * k);
    }

    function circlePathTopClockwise(r: number): string {
      return `M 0 ${-r} A ${r} ${r} 0 0 1 0 ${r} A ${r} ${r} 0 0 1 0 ${-r}`;
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
            (this as SVGGElement).style.display !== "none"
          );
        })
        .transition(
          transition as unknown as d3.Transition<SVGGElement, PackNode, SVGGElement, unknown>
        )
        .style("opacity", (d) => (d.parent === focus ? 1 : 0))
        .on("start", function (d) {
          if (d.parent === focus)
            (this as SVGGElement).style.display = "";
        })
        .on("end", function (d) {
          if (d.parent !== focus)
            (this as SVGGElement).style.display = "none";
        });
    }

    return () => {
      if (svgRef.current) {
        svgRef.current.remove();
        svgRef.current = null;
      }
    };
  }, [rootData, size]);

  return (
    <div className="circles-panel" ref={containerRef}>
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
