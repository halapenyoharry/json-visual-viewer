/**
 * Detects whether parsed JSON represents a graph structure
 * and extracts nodes/links in a standard format.
 *
 * Recognizes patterns like:
 *   { nodes: [...], edges: [...] }
 *   { nodes: [...], links: [...] }
 *   { vertices: [...], edges: [...] }
 *   [ { source: "a", target: "b" }, ... ]  (array of edges)
 */

export interface GraphNode {
  id: string;
  label: string;
  type?: string;
  size?: number;
  color?: string;
  data?: Record<string, unknown>;
}

export interface GraphLink {
  source: string;
  target: string;
  label?: string;
}

export interface DetectedGraph {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Keys that indicate a node collection
const NODE_KEYS = ["nodes", "vertices", "elements", "items"];
// Keys that indicate an edge collection
const EDGE_KEYS = ["edges", "links", "connections", "relationships", "arcs"];
// Keys that indicate a source reference
const SOURCE_KEYS = ["source", "from", "src", "start", "origin"];
// Keys that indicate a target reference
const TARGET_KEYS = ["target", "to", "dst", "dest", "end", "destination"];

function findKey(obj: Record<string, unknown>, candidates: string[]): string | null {
  const keys = Object.keys(obj);
  for (const c of candidates) {
    const found = keys.find((k) => k.toLowerCase() === c.toLowerCase());
    if (found) return found;
  }
  return null;
}

function extractId(item: unknown, index: number): string {
  if (typeof item === "object" && item !== null) {
    const obj = item as Record<string, unknown>;
    if (typeof obj.id === "string") return obj.id;
    if (typeof obj.id === "number") return String(obj.id);
    if (typeof obj._id === "string") return obj._id;
    if (typeof obj.name === "string") return obj.name;
  }
  return `node-${index}`;
}

function extractLabel(item: unknown): string {
  if (typeof item === "object" && item !== null) {
    const obj = item as Record<string, unknown>;
    if (typeof obj.label === "string") return obj.label;
    if (typeof obj.name === "string") return obj.name;
    if (typeof obj.title === "string") return obj.title;
    if (typeof obj.id === "string") return obj.id;
    if (typeof obj.id === "number") return String(obj.id);
  }
  return String(item);
}

function isEdgeLike(obj: Record<string, unknown>): boolean {
  const srcKey = findKey(obj, SOURCE_KEYS);
  const tgtKey = findKey(obj, TARGET_KEYS);
  return srcKey !== null && tgtKey !== null;
}

export function detectGraph(json: unknown): DetectedGraph | null {
  if (typeof json !== "object" || json === null) return null;

  // Pattern 1: { nodes: [...], edges/links: [...] }
  if (!Array.isArray(json)) {
    const obj = json as Record<string, unknown>;
    const nodeKey = findKey(obj, NODE_KEYS);
    const edgeKey = findKey(obj, EDGE_KEYS);

    if (nodeKey && edgeKey && Array.isArray(obj[nodeKey]) && Array.isArray(obj[edgeKey])) {
      const rawNodes = obj[nodeKey] as unknown[];
      const rawEdges = obj[edgeKey] as unknown[];

      const nodes: GraphNode[] = rawNodes.map((n, i) => ({
        id: extractId(n, i),
        label: extractLabel(n),
        data: typeof n === "object" && n !== null ? (n as Record<string, unknown>) : undefined,
      }));

      const nodeIds = new Set(nodes.map((n) => n.id));

      const links: GraphLink[] = rawEdges
        .filter((e) => typeof e === "object" && e !== null)
        .reduce<GraphLink[]>((acc, e) => {
          const edge = e as Record<string, unknown>;
          const srcKey = findKey(edge, SOURCE_KEYS);
          const tgtKey = findKey(edge, TARGET_KEYS);
          if (!srcKey || !tgtKey) return acc;
          const source = String(edge[srcKey]);
          const target = String(edge[tgtKey]);
          const labelKey = Object.keys(edge).find(
            (k) => k.toLowerCase() === "label" || k.toLowerCase() === "relation" || k.toLowerCase() === "type"
          );
          acc.push({
            source,
            target,
            label: labelKey ? String(edge[labelKey]) : undefined,
          });
          return acc;
        }, []);

      // Create nodes for any source/target IDs not in the nodes array
      for (const link of links) {
        if (!nodeIds.has(link.source)) {
          nodes.push({ id: link.source, label: link.source });
          nodeIds.add(link.source);
        }
        if (!nodeIds.has(link.target)) {
          nodes.push({ id: link.target, label: link.target });
          nodeIds.add(link.target);
        }
      }

      if (nodes.length > 0 && links.length > 0) {
        return { nodes, links };
      }
    }
  }

  // Pattern 2: Array of edge-like objects [{ source, target }, ...]
  if (Array.isArray(json) && json.length > 0) {
    const firstFew = json.slice(0, Math.min(5, json.length));
    const allEdgeLike = firstFew.every(
      (item) => typeof item === "object" && item !== null && isEdgeLike(item as Record<string, unknown>)
    );

    if (allEdgeLike) {
      const nodeIds = new Set<string>();
      const links: GraphLink[] = [];

      for (const item of json) {
        if (typeof item !== "object" || item === null) continue;
        const edge = item as Record<string, unknown>;
        const srcKey = findKey(edge, SOURCE_KEYS);
        const tgtKey = findKey(edge, TARGET_KEYS);
        if (!srcKey || !tgtKey) continue;

        const source = String(edge[srcKey]);
        const target = String(edge[tgtKey]);
        nodeIds.add(source);
        nodeIds.add(target);

        const labelKey = Object.keys(edge).find(
          (k) => k.toLowerCase() === "label" || k.toLowerCase() === "relation" || k.toLowerCase() === "type"
        );
        links.push({
          source,
          target,
          label: labelKey ? String(edge[labelKey]) : undefined,
        });
      }

      const nodes: GraphNode[] = Array.from(nodeIds).map((id) => ({
        id,
        label: id,
      }));

      if (nodes.length > 0 && links.length > 0) {
        return { nodes, links };
      }
    }
  }

  // Pattern 3: Single node with embedded edges { "node": { id, ... edges: [{target_id}] } }
  if (typeof json === "object" && json !== null && !Array.isArray(json)) {
    for (const val of Object.values(json as Record<string, unknown>)) {
      if (typeof val === "object" && val !== null) {
        const obj = val as Record<string, unknown>;
        const edgeKey = findKey(obj, EDGE_KEYS);
        
        if (edgeKey && Array.isArray(obj[edgeKey])) {
          const rootNodeId = extractId(obj, 0);
          const rawEdges = obj[edgeKey] as unknown[];
          const nodes: GraphNode[] = [];
          const links: GraphLink[] = [];
          
          nodes.push({
            id: rootNodeId,
            label: extractLabel(obj),
            data: obj
          });
          const nodeIds = new Set([rootNodeId]);
          
          for (const e of rawEdges) {
            if (typeof e === "object" && e !== null) {
              const edge = e as Record<string, unknown>;
              // Look for target key (including target_id)
              const tgtKey = Object.keys(edge).find(k => k.toLowerCase().includes("target"));
              if (tgtKey) {
                const target = String(edge[tgtKey]);
                const labelKey = Object.keys(edge).find(
                  (k) => k.toLowerCase() === "label" || k.toLowerCase().includes("relation") || k.toLowerCase() === "type"
                );
                
                links.push({
                  source: rootNodeId,
                  target,
                  label: labelKey ? String(edge[labelKey]) : undefined,
                });
                
                if (!nodeIds.has(target)) {
                  nodes.push({ id: target, label: target });
                  nodeIds.add(target);
                }
              }
            }
          }
          
          if (nodes.length > 0 && links.length > 0) {
            return { nodes, links };
          }
        }
      }
    }
  }

  return null;
}
