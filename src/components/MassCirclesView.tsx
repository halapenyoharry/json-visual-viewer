import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useStore } from "../store/useStore";
import { useViewSurface } from "./useViewSurface";
import { PerfWarning } from "./PerfWarning";
import { jsonToHierarchy } from "../utils/jsonToHierarchy";
import "./CirclesView.css";

/**
 * MassCirclesView
 * ===============
 * A second circle-packing view, weighted by substrate-normalized mass
 * instead of uniform leaf count. Text mass is line count, image mass is
 * pegged to a thousand-word document. Input shape matches the output of
 * project-mass-scanner: a tree where leaves carry {name, mass, substrate}
 * and internal nodes carry {name, children}.
 *
 * If the loaded JSON doesn't match that shape, we fall back to treating
 * the raw JSON as a hierarchy with every leaf worth 1 unit of mass, so
 * the view never crashes on arbitrary input, it just degrades to the
 * count-weighted case.
 */

const MASS_CIRCLES_NODE_THRESHOLD = 5000;

interface MassNode {
  name: string;
  mass?: number;
  substrate?: "text" | "image" | string;
  children?: MassNode[];
}

type PackNode = d3.HierarchyCircularNode<MassNode>;

function extractTree(parsed: unknown): MassNode {
  // Scanner output shape: { _meta, tree }
  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "tree" in parsed &&
    typeof (parsed as Record<string, unknown>).tree === "object"
  ) {
    return (parsed as { tree: MassNode }).tree;
  }
  // Already-shaped hierarchy: { name, children }
  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "name" in parsed
  ) {
    return parsed as MassNode;
  }
  // Arbitrary JSON: fall through to the same hierarchy conversion the
  // regular Circles view uses. Without mass fields, the .sum() fallback
  // in the effect below treats every leaf as 1 unit, which makes this
  // view degrade gracefully to count-weighted packing instead of showing
  // an empty canvas.
  return jsonToHierarchy(parsed, false, "root", true) as MassNode;
}

function countMassNodes(node: MassNode): number {
  if (!node.children || node.children.length === 0) return 1;
  let n = 1;
  for (const c of node.children) n += countMassNodes(c);
  return n;
}

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

function substrateFill(substrate: string | undefined, depth: number, maxDepth: number): string {
  // Leaves get substrate color, internal nodes get depth gradient.
  if (substrate === "text") return "#0f1447";
  if (substrate === "image") return "#ff6b9d";
  // Internal node gradient, same feel as the original CirclesView.
  const t = Math.min(depth / Math.max(maxDepth, 1), 1);
  const interp = d3.interpolateHcl("#0f1447", "#00e5ff");
  return interp(t);
}

export function MassCirclesView() {
  const { containerRef, size } = useViewSurface();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const resetRef = useRef<() => void>(() => {});
  const { json } = useStore();

  const rootData = useMemo<MassNode>(() => {
    try {
      const parsed = JSON.parse(json);
      return extractTree(parsed);
    } catch {
      return { name: "Invalid JSON", children: [] };
    }
  }, [json]);

  const nodeCount = useMemo(() => countMassNodes(rootData), [rootData]);
  const [bypassPerf, setBypassPerf] = useState(false);
  useEffect(() => {
    setBypassPerf(false);
  }, [nodeCount]);
  const perfBlocked = nodeCount > MASS_CIRCLES_NODE_THRESHOLD && !bypassPerf;

  useEffect(() => {
    if (!containerRef.current || !rootData) return;
    if (size.width === 0 || size.height === 0) return;
    if (perfBlocked) return;

    if (svgRef.current) {
      svgRef.current.remove();
      svgRef.current = null;
    }

    const { width, height } = size;
    const diameter = Math.min(width, height);
    const container = containerRef.current;

    const hierarchy = d3
      .hierarchy<MassNode>(rootData, (d) => d.children)
      // Here is the whole point of this view: weight by mass, not count.
      // Leaves with no mass still get a minimum of 1 so they don't
      // disappear entirely, but any file scored by the scanner will
      // dominate an unscored one.
      .sum((d) => {
        if (d.children && d.children.length > 0) return 0;
        return d.mass && d.mass > 0 ? d.mass : 1;
      })
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const pack = d3
      .pack<MassNode>()
      .size([diameter, diameter])
      .padding(3);

    const root = pack(hierarchy);
    const maxDepth = d3.max(root.descendants(), (d) => d.depth) ?? 1;

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
      .attr("fill", (d) => substrateFill(d.data.substrate, d.depth, maxDepth))
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

    // Tooltip with mass info, shown as a native SVG title element.
    node.append("title").text((d) => {
      const mass = d.value ?? 0;
      const substrate = d.data.substrate ?? (d.children ? "container" : "unknown");
      return `${d.data.name}\nmass: ${mass.toLocaleString()}\nsubstrate: ${substrate}`;
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
        const pathId = `mcp-${i}`;
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
        (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k}) scale(${k})`
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
  }, [rootData, size, perfBlocked]);

  return (
    <div className="circles-panel" ref={containerRef}>
      {perfBlocked ? (
        <PerfWarning
          nodeCount={nodeCount}
          viewLabel="Mass"
          onBypass={() => setBypassPerf(true)}
        />
      ) : (
        <button
          className="view-reset-btn"
          onClick={() => resetRef.current()}
          title="Reset view"
        >
          ⤢
        </button>
      )}
    </div>
  );
}
