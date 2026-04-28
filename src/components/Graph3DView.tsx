import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import type { ForceGraphMethods } from "react-force-graph-3d";
import SpriteText from "three-spritetext";
import type { Object3D } from "three";
import { useStore } from "../store/useStore";
import { useViewSurface } from "./useViewSurface";
import { PerfWarning } from "./PerfWarning";
import "./Graph3DView.css";

const NODE_THRESHOLD = 5000;

const KIND_COLORS: Record<string, string> = {
  node: "#00e5ff",
  hyperedge: "#7a7f99",
  "edge-as-node": "#b388ff",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attrsToHtml(attrs: Record<string, unknown> | undefined, header: string): string {
  if (!attrs) return escapeHtml(header);
  const rows = Object.entries(attrs)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .slice(0, 12)
    .map(([k, v]) => {
      const val = typeof v === "object" ? JSON.stringify(v) : String(v);
      const truncated = val.length > 80 ? val.slice(0, 77) + "..." : val;
      return `<div><span style="opacity:0.6">${escapeHtml(k)}</span>: ${escapeHtml(truncated)}</div>`;
    })
    .join("");
  return `<div><strong>${escapeHtml(header)}</strong>${rows}</div>`;
}

interface FGLink {
  source: string;
  target: string;
  label: string;
  curvature: number;
  rotation: number;
  directed: boolean;
  attrs?: Record<string, unknown>;
  role?: string;
}

interface FGNode {
  id: string;
  name: string;
  kind?: "node" | "hyperedge" | "edge-as-node";
  attrs?: Record<string, unknown>;
}

function annotateLinks(
  links: {
    source: string;
    target: string;
    label?: string;
    directed?: boolean;
    role?: string;
    attrs?: Record<string, unknown>;
  }[],
  baseCurvature: number,
): FGLink[] {
  const groups = new Map<string, number[]>();
  links.forEach((_, i) => {
    const a = links[i].source;
    const b = links[i].target;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    const arr = groups.get(key) ?? [];
    arr.push(i);
    groups.set(key, arr);
  });

  const out = new Array<FGLink>(links.length);
  for (const indices of groups.values()) {
    const n = indices.length;
    indices.forEach((idx, i) => {
      const link = links[idx];
      out[idx] = {
        source: link.source,
        target: link.target,
        label: link.label ?? "",
        curvature: n === 1 ? 0 : baseCurvature,
        rotation: n === 1 ? 0 : (i / n) * Math.PI * 2,
        directed: link.directed !== false,
        role: link.role,
        attrs: link.attrs,
      };
    });
  }
  return out;
}

export function Graph3DView() {
  const graph = useStore((s) => s.detectedGraph);
  const dimensions = useStore((s) => s.graph3dDimensions);
  const particles = useStore((s) => s.graph3dParticles);
  const labelMode = useStore((s) => s.graph3dLabelMode);
  const curvature = useStore((s) => s.graph3dCurvature);
  const freezeLayout = useStore((s) => s.freezeLayout);
  const { containerRef, size } = useViewSurface();
  const fgRef = useRef<ForceGraphMethods<FGNode, FGLink> | undefined>(undefined);

  const nodeCount = graph?.nodes.length ?? 0;
  const [bypassPerf, setBypassPerf] = useState(false);
  useEffect(() => setBypassPerf(false), [nodeCount]);
  const perfBlocked = nodeCount > NODE_THRESHOLD && !bypassPerf;

  const data = useMemo(() => {
    if (!graph) return { nodes: [] as FGNode[], links: [] as FGLink[] };
    const nodes: FGNode[] = graph.nodes.map((n) => ({
      id: n.id,
      name: n.label || n.id,
      kind: n.kind,
      attrs: n.attrs,
    }));
    const links = annotateLinks(graph.links, curvature);
    return { nodes, links };
  }, [graph, curvature]);

  useEffect(() => {
    if (!fgRef.current || perfBlocked) return;
    const t = setTimeout(() => fgRef.current?.zoomToFit(600, 60), 800);
    return () => clearTimeout(t);
  }, [data, perfBlocked]);

  // Freeze: pin every node to its current position so the simulation halts
  // visually. Camera/orbit controls keep working because the render loop runs.
  useEffect(() => {
    if (perfBlocked) return;
    const nodes = data.nodes as Array<
      FGNode & { x?: number; y?: number; z?: number; fx?: number; fy?: number; fz?: number }
    >;
    if (freezeLayout) {
      for (const n of nodes) {
        n.fx = n.x;
        n.fy = n.y;
        n.fz = n.z;
      }
    } else {
      for (const n of nodes) {
        n.fx = undefined;
        n.fy = undefined;
        n.fz = undefined;
      }
      fgRef.current?.d3ReheatSimulation();
    }
  }, [freezeLayout, data, perfBlocked]);

  const resetView = () => {
    fgRef.current?.zoomToFit(600, 60);
  };

  if (!graph) {
    return (
      <div className="graph3d-panel" ref={containerRef}>
        <div className="node-limit-warning">
          No graph structure detected in this JSON.
        </div>
      </div>
    );
  }

  const showInlineLabels = labelMode === "always";
  const tooltipsEnabled = labelMode !== "never";

  return (
    <div className="graph3d-panel" ref={containerRef}>
      {perfBlocked ? (
        <PerfWarning
          nodeCount={nodeCount}
          viewLabel="3D Graph"
          onBypass={() => setBypassPerf(true)}
        />
      ) : (
        <>
          {size.width > 0 && size.height > 0 && (
            <ForceGraph3D<FGNode, FGLink>
              ref={fgRef}
              graphData={data}
              width={size.width}
              height={size.height}
              numDimensions={dimensions}
              backgroundColor="#0a0e26"
              showNavInfo={false}
              nodeRelSize={4}
              nodeVal={(n) => (n.kind && n.kind !== "node" ? 0.5 : 1)}
              nodeColor={(n) => KIND_COLORS[n.kind ?? "node"] ?? "#00e5ff"}
              nodeOpacity={0.9}
              nodeLabel={tooltipsEnabled ? (n) => attrsToHtml(n.attrs, n.name) : () => ""}
              linkColor={() => "rgba(0, 229, 255, 0.45)"}
              linkOpacity={0.6}
              linkWidth={0.6}
              linkCurvature={(l) => l.curvature}
              linkCurveRotation={(l) => l.rotation}
              linkDirectionalArrowLength={(l) => (l.directed ? 3 : 0)}
              linkDirectionalArrowRelPos={1}
              linkDirectionalArrowColor={() => "rgba(0, 229, 255, 0.8)"}
              linkDirectionalParticles={particles && !freezeLayout ? 2 : 0}
              linkDirectionalParticleWidth={1.5}
              linkDirectionalParticleSpeed={0.006}
              linkDirectionalParticleColor={() => "#00e5ff"}
              linkLabel={
                tooltipsEnabled
                  ? (l) => attrsToHtml(l.attrs, l.role ? `${l.label} (${l.role})` : l.label)
                  : () => ""
              }
              linkThreeObjectExtend={showInlineLabels}
              linkThreeObject={
                showInlineLabels
                  ? ((l: FGLink) => {
                      const sprite = new SpriteText(l.label || "");
                      sprite.color = "#7ddff5";
                      sprite.textHeight = 2;
                      sprite.backgroundColor = "rgba(10, 14, 38, 0.7)";
                      sprite.padding = 2;
                      sprite.borderRadius = 2;
                      return sprite as unknown as Object3D;
                    })
                  : undefined
              }
              linkPositionUpdate={
                showInlineLabels
                  ? (sprite, { start, end }) => {
                      const mid = {
                        x: start.x + (end.x - start.x) / 2,
                        y: start.y + (end.y - start.y) / 2,
                        z: start.z + (end.z - start.z) / 2,
                      };
                      Object.assign((sprite as unknown as { position: typeof mid }).position, mid);
                    }
                  : undefined
              }
              cooldownTicks={150}
            />
          )}
          <button
            className="view-reset-btn"
            onClick={resetView}
            title="Reset view"
          >
            ⤢
          </button>
        </>
      )}
    </div>
  );
}
