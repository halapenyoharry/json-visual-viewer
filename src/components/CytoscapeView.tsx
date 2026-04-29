import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import type { Core, ElementDefinition, LayoutOptions } from "cytoscape";
import fcose from "cytoscape-fcose";
import { useStore } from "../store/useStore";
import type { CytoscapeLayout } from "../store/useStore";
import { useViewSurface } from "./useViewSurface";
import { PerfWarning } from "./PerfWarning";
import { colorForLayer } from "../utils/layers";
import "./CytoscapeView.css";

cytoscape.use(fcose);

const NODE_THRESHOLD = 1500;

interface TooltipState {
  x: number;
  y: number;
  header: string;
  attrs?: Record<string, unknown>;
}

function formatAttrs(attrs: Record<string, unknown> | undefined): [string, string][] {
  if (!attrs) return [];
  return Object.entries(attrs)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .slice(0, 12)
    .map(([k, v]) => {
      const val = typeof v === "object" ? JSON.stringify(v) : String(v);
      const truncated = val.length > 80 ? val.slice(0, 77) + "..." : val;
      return [k, truncated];
    });
}

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
  const layerVisibility = useStore((s) => s.layerVisibility);
  const { containerRef, size } = useViewSurface();
  const cyRef = useRef<Core | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
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
        data: {
          id: n.id,
          label: n.label || n.id,
          kind: n.kind ?? "node",
          attrs: n.attrs,
        },
        classes: n.kind && n.kind !== "node" ? `kind-${n.kind}` : undefined,
      })),
      ...graph.links.map((l, i) => ({
        data: {
          id: `e${i}-${l.source}-${l.target}`,
          source: l.source,
          target: l.target,
          label: l.label || "",
          directed: l.directed !== false,
          role: l.role ?? "",
          layer: l.layer ?? "",
          layerColor: l.layer ? colorForLayer(l.layer) : "",
          attrs: l.attrs,
        },
        classes: [
          l.directed === false ? "undirected" : null,
          l.layer ? "has-layer" : null,
        ]
          .filter(Boolean)
          .join(" ") || undefined,
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
          selector: "node.kind-hyperedge",
          style: {
            "background-color": "#1a1d33",
            "border-color": "rgba(122, 127, 153, 0.7)",
            "border-style": "dashed",
            shape: "diamond",
            width: 18,
            height: 18,
            color: "rgba(125, 223, 245, 0.6)",
          },
        },
        {
          selector: "node.kind-edge-as-node",
          style: {
            "background-color": "#1a1233",
            "border-color": "rgba(179, 136, 255, 0.7)",
            shape: "diamond",
            width: 22,
            height: 22,
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
          selector: "edge.undirected",
          style: {
            "target-arrow-shape": "none",
          },
        },
        {
          selector: "edge.has-layer",
          style: {
            "line-color": "data(layerColor)",
            "target-arrow-color": "data(layerColor)",
            color: "data(layerColor)",
          },
        },
        {
          selector: "edge.layer-hidden",
          style: {
            display: "none",
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
      // Perf flags: hide expensive layers during pan/zoom, cache to texture,
      // skip retina supersampling. Big wins at 1k+ nodes.
      hideEdgesOnViewport: true,
      hideLabelsOnViewport: true,
      textureOnViewport: true,
      motionBlur: true,
      motionBlurOpacity: 0.2,
      pixelRatio: 1,
    });

    cyRef.current = cy;

    cy.on("mouseover", "node, edge", (evt) => {
      const ele = evt.target;
      const attrs = ele.data("attrs") as Record<string, unknown> | undefined;
      const label = (ele.data("label") as string) || "";
      const role = (ele.data("role") as string) || "";
      const isEdge = ele.isEdge();
      const renderedPos = isEdge
        ? ele.midpoint()
        : ele.renderedPosition();
      const containerRect = containerRef.current?.getBoundingClientRect();
      const containerLeft = containerRect?.left ?? 0;
      const containerTop = containerRect?.top ?? 0;
      const pan = cy.pan();
      const zoom = cy.zoom();
      const screenX = isEdge
        ? renderedPos.x * zoom + pan.x
        : renderedPos.x;
      const screenY = isEdge
        ? renderedPos.y * zoom + pan.y
        : renderedPos.y;
      setTooltip({
        x: screenX + 12,
        y: screenY + 12,
        header: role ? `${label} (${role})` : label,
        attrs,
      });
      void containerLeft;
      void containerTop;
    });

    cy.on("mouseout", "node, edge", () => {
      setTooltip(null);
    });

    cy.on("pan zoom drag", () => {
      setTooltip(null);
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [graph, size.width, size.height, layout, curveEdges, perfBlocked, containerRef]);

  // Apply layer visibility without rebuilding the cytoscape instance.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.batch(() => {
      cy.edges().forEach((edge) => {
        const layer = edge.data("layer") as string | undefined;
        if (!layer) return;
        const on = layerVisibility[layer] !== false;
        if (on) {
          edge.removeClass("layer-hidden");
        } else {
          edge.addClass("layer-hidden");
        }
      });
    });
  }, [layerVisibility]);

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
        <>
          <button
            className="view-reset-btn"
            onClick={resetView}
            title="Reset view"
          >
            ⤢
          </button>
          {tooltip && (
            <div
              className="cytoscape-tooltip"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <strong>{tooltip.header}</strong>
              {formatAttrs(tooltip.attrs).map(([k, v]) => (
                <div key={k} className="cytoscape-tooltip-row">
                  <span className="cytoscape-tooltip-key">{k}</span>: {v}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
