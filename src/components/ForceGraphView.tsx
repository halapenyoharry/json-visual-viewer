import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import type { GraphNode } from "../graphDetect";
import { useStore } from "../store/useStore";
import { useViewSurface } from "./useViewSurface";
import "./ForceGraphView.css";

interface SimNode extends GraphNode, d3.SimulationNodeDatum {}
interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  label?: string;
}

export function ForceGraphView() {
  const graph = useStore((s) => s.detectedGraph);
  const { containerRef, size } = useViewSurface();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);

  const destroyGraph = useCallback(() => {
    if (simulationRef.current) {
      simulationRef.current.stop();
      simulationRef.current = null;
    }
    if (svgRef.current) {
      svgRef.current.remove();
      svgRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || !graph) return;
    if (size.width === 0 || size.height === 0) return;

    destroyGraph();

    const container = containerRef.current;
    const { width, height } = size;

    // Clone data so D3 can mutate it
    const nodes: SimNode[] = graph.nodes.map((n) => ({ ...n }));
    const links: SimLink[] = graph.links.map((l) => ({ ...l }));

    // Create SVG
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    svgRef.current = svg.node();

    // Zoom
    const g = svg.append("g");
    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 8])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        })
    );

    // Arrow marker for directed edges
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "rgba(0, 229, 255, 0.4)");

    // Simulation — "perfect physics" from universal-graph-viewer
    const simulation = d3
      .forceSimulation<SimNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance(120)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force(
        "collide",
        d3
          .forceCollide<SimNode>()
          .radius(30)
          .strength(0.9)
          .iterations(1)
      )
      .force("center", d3.forceCenter(width / 2, height / 2))
      .velocityDecay(0.85)
      .alphaDecay(0.05)
      .alphaMin(0.01);

    simulationRef.current = simulation;

    // Links
    const link = g
      .selectAll<SVGLineElement, SimLink>(".graph-link")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "graph-link")
      .attr("marker-end", "url(#arrowhead)");

    // Link labels
    const linkLabel = g
      .selectAll<SVGTextElement, SimLink>(".graph-link-label")
      .data(links.filter((l) => l.label))
      .enter()
      .append("text")
      .attr("class", "graph-link-label")
      .text((d) => d.label || "");

    // Nodes
    const node = g
      .selectAll<SVGGElement, SimNode>(".graph-node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "graph-node")
      .call(
        d3
          .drag<SVGGElement, SimNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Node circles
    node
      .append("circle")
      .attr("r", 14)
      .attr("class", "graph-node-circle");

    // Node labels
    node
      .append("text")
      .attr("class", "graph-node-label")
      .attr("dy", 28)
      .attr("text-anchor", "middle")
      .text((d) => {
        const label = d.label || d.id;
        return label.length > 20 ? label.slice(0, 18) + "..." : label;
      });

    // Tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as SimNode).x!)
        .attr("y1", (d) => (d.source as SimNode).y!)
        .attr("x2", (d) => (d.target as SimNode).x!)
        .attr("y2", (d) => (d.target as SimNode).y!);

      linkLabel
        .attr("x", (d) => ((d.source as SimNode).x! + (d.target as SimNode).x!) / 2)
        .attr("y", (d) => ((d.source as SimNode).y! + (d.target as SimNode).y!) / 2);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Center the view initially after simulation settles a bit
    setTimeout(() => {
      const bounds = g.node()?.getBBox();
      if (bounds && svgRef.current) {
        const cx = bounds.x + bounds.width / 2;
        const cy = bounds.y + bounds.height / 2;
        const scale = Math.min(
          width / (bounds.width + 100),
          height / (bounds.height + 100),
          1.5
        );
        svg.call(
          d3.zoom<SVGSVGElement, unknown>().transform as never,
          d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(scale)
            .translate(-cx, -cy)
        );
      }
    }, 1500);

    return () => {
      destroyGraph();
    };
  }, [graph, destroyGraph, size]);

  if (!graph) {
    return (
      <div className="force-graph-panel">
        <div className="node-limit-warning">
          No graph structure detected in this JSON.
        </div>
      </div>
    );
  }

  return <div className="force-graph-panel" ref={containerRef} />;
}
