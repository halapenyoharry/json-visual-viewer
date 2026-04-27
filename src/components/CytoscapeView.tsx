import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import type { Core, ElementDefinition, LayoutOptions } from "cytoscape";
import fcose from "cytoscape-fcose";
import { useStore } from "../store/useStore";
import type { CytoscapeLayout } from "../store/useStore";
import { useViewSurface } from "./useViewSurface";
import { PerfWarning } from "./PerfWarning";
import "./CytoscapeView.css";

cytoscape.use(fcose);

const NODE_THRESHOLD = 1500;

function buildLayout(name: CytoscapeLayout): LayoutOptions {
  switch (name) {
    case "fcose":
      return {
        name: "fcose",
        animate: true,
        animationDuration: 600,
        randomize: true,
        nodeRepulsion: 4500,
        idealEdgeLength: 90,
        edgeElasticity: 0.45,
      } as LayoutOptions;
    case "cose":
      return { name: "cose", animate: true, idealEdgeLength: () => 90 } as LayoutOptions;
    case "breadthfirst":
      return { name: "breadthfirst", directed: true, padding: 30, spacingFactor: 1.2 } as LayoutOptions;
    case "concentric":
      return { name: "concentric", padding: 30, minNodeSpacing: 20 } as LayoutOptions;
    case "circle":
      return { name: "circle", padding: 30 } as LayoutOptions;
    case "grid":
      return { name: "grid", padding: 30 } as LayoutOptions;
    case "random":
      return { name: "random", padding: 30 } as LayoutOptions;
  }
}

export function CytoscapeView() {
  const graph = useStore((s) => s.detectedGraph);
  const layout = useStore((s) => s.cytoscapeLayout);
  const curveEdges = useStore((s) => s.cytoscapeCurveEdges);
  const { containerRef, size } = useViewSurface();
  const cyRef = useRef<Core | null>(null);
  const nodeCount = graph?.nodes.length ?? 0;
  const [bypassPerf, setBypassPerf] = useState(false);
  useEffect(() => setBypassPerf(false), [nodeCount]);
  const perfBlocked = nodeCount > NODE_THRESHOLD && !bypassPerf;

  useEffect(() => {
    if (!containerRef.current || !graph) return;
    if (size.width === 0 || size.height === 0) return;
    if (perfBlocked) return;

    const elements: ElementDefinition[] = [
      ...graph.nodes.map((n) => ({
        data: { id: n.id, label: n.label || n.id },
      })),
      ...graph.links.map((l, i) => ({
        data: {
          id: `e${i}-${l.source}-${l.target}`,
          source: l.source,
          target: l.target,
          label: l.label || "",
        },
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#0d1233",
            "border-color": "rgba(0, 229, 255, 0.5)",
            "border-width": 1.5,
            label: "data(label)",
            color: "#7ddff5",
            "font-size": 11,
            "text-valign": "bottom",
            "text-margin-y": 6,
            "text-outline-color": "#0a0e26",
            "text-outline-width": 2,
            width: 28,
            height: 28,
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-color": "#00e5ff",
            "border-width": 2.5,
            "background-color": "#131940",
          },
        },
        {
          selector: "edge",
          style: {
            width: 1.5,
            "line-color": "rgba(0, 229, 255, 0.25)",
            "target-arrow-color": "rgba(0, 229, 255, 0.4)",
            "target-arrow-shape": "triangle",
            "curve-style": curveEdges ? "bezier" : "straight",
            label: "data(label)",
            "font-size": 9,
            color: "rgba(0, 229, 255, 0.5)",
            "text-rotation": "autorotate" as unknown as undefined,
            "text-background-color": "#0a0e26",
            "text-background-opacity": 0.8,
            "text-background-padding": "2px",
          },
        },
        {
          selector: "edge:selected",
          style: {
            "line-color": "#00e5ff",
            "target-arrow-color": "#00e5ff",
            width: 2.5,
          },
        },
      ],
      layout: buildLayout(layout),
      wheelSensitivity: 0.2,
      minZoom: 0.1,
      maxZoom: 4,
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [graph, size.width, size.height, layout, curveEdges, perfBlocked, containerRef]);

  const resetView = () => {
    cyRef.current?.fit(undefined, 40);
  };

  if (!graph) {
    return (
      <div className="cytoscape-panel">
        <div className="node-limit-warning">
          No graph structure detected in this JSON.
        </div>
      </div>
    );
  }

  return (
    <div className="cytoscape-panel" ref={containerRef}>
      {perfBlocked ? (
        <PerfWarning
          nodeCount={nodeCount}
          viewLabel="Cytoscape"
          onBypass={() => setBypassPerf(true)}
        />
      ) : (
        <button
          className="view-reset-btn"
          onClick={resetView}
          title="Reset view"
        >
          ⤢
        </button>
      )}
    </div>
  );
}
