import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getSavedFont, saveFont, applyFont } from "../fonts";
import { detectGraph } from "../graphDetect";
import type { DetectedGraph } from "../graphDetect";

const SAMPLE_JSON = {
  _metadata: {
    creator: "Harold",
    github: "halapenyoharry",
    philosophy: "Narrative Topology and Consciousness Framework"
  },
  node: {
    id: "concept_relationship_topology",
    type: "Mental_Model",
    label: "Topology of Relationships",
    properties: {
      definition: "The structural and mathematical modeling of how two distinct cognitive operating systems interface, replacing the passive folk-psychology model of 'chemistry'.",
      core_mechanic: "Entanglement of matter and processing methods creates a new, measurable joint structure.",
      key_variables: [
        "Surface Area of Cognition",
        "Structural Compatibility",
        "Friction/Resistance"
      ],
      intuition_mechanism: "The default mode network running a high-speed, probabilistic simulation of the joint topology to predict structural stability. Outputs a biological 'Yes' or 'No' based on computational energy cost.",
      failure_state: "Attempting to force an incompatible topological connection by ignoring the biological intuition output, resulting in continuous system friction and energy drain."
    },
    edges: [
      {
        target_id: "concept_folk_psychology",
        relation_type: "REPLACES",
        context: "Discards the passive 'chemistry' model."
      },
      {
        target_id: "system_executive_function",
        relation_type: "TAXES",
        context: "Incompatible topologies require heavy masking and manual processing, draining executive function."
      },
      {
        target_id: "concept_mu_wei",
        relation_type: "ALIGNS_WITH",
        context: "A compatible topological structure allows for effortless action and frictionless data transfer between nodes."
      }
    ]
  }
};

export type ViewMode = "tree" | "graph" | "cytoscape" | "graph3d" | "circles" | "mass";
export type CytoscapeLayout =
  | "fcose"
  | "cose"
  | "breadthfirst"
  | "concentric"
  | "circle"
  | "grid"
  | "random";
export type TreeLayoutType = "cluster" | "tidy";
export type TreeDirection = "LR" | "RL" | "TB" | "BT";
export type Graph3DDimensions = 2 | 3;
export type Graph3DLabelMode = "always" | "hover" | "never";

interface AppState {
  json: string;
  showEditor: boolean;
  showControlPanel: boolean;
  editorWidth: number;
  fontId: string;
  viewMode: ViewMode;
  detectedGraph: DetectedGraph | null;
  graphAvailable: boolean;
  isExplodedView: boolean;
  
  // Tree Settings
  treeLayout: TreeLayoutType;
  treeDirection: TreeDirection;
  treeSpacing: { dx: number; dy: number };
  treeFontSize: number;
  treeColors: { node: string; link: string };
  showArrayIndices: boolean;

  // Cytoscape Settings
  cytoscapeLayout: CytoscapeLayout;
  cytoscapeCurveEdges: boolean;

  // 3D Graph Settings
  graph3dDimensions: Graph3DDimensions;
  graph3dParticles: boolean;
  graph3dLabelMode: Graph3DLabelMode;
  graph3dCurvature: number;

  // Cross-view: freeze layout (Explore mode)
  freezeLayout: boolean;

  // Actions
  setJson: (json: string) => void;
  toggleEditor: () => void;
  toggleControlPanel: () => void;
  setEditorWidth: (px: number) => void;
  setFont: (id: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setIsExplodedView: (val: boolean) => void;
  setTreeLayout: (val: TreeLayoutType) => void;
  setTreeDirection: (val: TreeDirection) => void;
  setTreeSpacing: (val: { dx: number; dy: number }) => void;
  setTreeFontSize: (val: number) => void;
  setTreeColors: (val: { node: string; link: string }) => void;
  setShowArrayIndices: (val: boolean) => void;
  setCytoscapeLayout: (val: CytoscapeLayout) => void;
  setCytoscapeCurveEdges: (val: boolean) => void;
  setGraph3dDimensions: (val: Graph3DDimensions) => void;
  setGraph3dParticles: (val: boolean) => void;
  setGraph3dLabelMode: (val: Graph3DLabelMode) => void;
  setGraph3dCurvature: (val: number) => void;
  setFreezeLayout: (val: boolean) => void;
  toggleFreezeLayout: () => void;
}

const initialFont = getSavedFont() || "system";
const initialJson = JSON.stringify(SAMPLE_JSON, null, 2);

function tryDetectGraph(jsonStr: string): DetectedGraph | null {
  try {
    const parsed = JSON.parse(jsonStr);
    return detectGraph(parsed);
  } catch {
    return null;
  }
}

const initialGraph = tryDetectGraph(initialJson);

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      json: initialJson,

      showEditor: true,
      showControlPanel: false,
      editorWidth: 400,
      fontId: initialFont,
      viewMode: initialGraph !== null ? "graph" : "tree",
      detectedGraph: initialGraph,
      graphAvailable: initialGraph !== null,
      isExplodedView: false,
      treeLayout: "cluster",
      treeDirection: "LR",
      treeSpacing: { dx: 14, dy: 200 },
      treeFontSize: 11,
      treeColors: { node: "#00e5ff", link: "#555555" },
      showArrayIndices: true,
      cytoscapeLayout: "fcose",
      cytoscapeCurveEdges: true,
      graph3dDimensions: 3,
      graph3dParticles: true,
      graph3dLabelMode: "hover",
      graph3dCurvature: 0.3,
      freezeLayout: false,

      setJson: (json) => {
        const graph = tryDetectGraph(json);
        set({
          json,
          detectedGraph: graph,
          graphAvailable: graph !== null,
        });
      },

      toggleEditor: () => set((s) => ({ showEditor: !s.showEditor })),
      toggleControlPanel: () => set((s) => ({ showControlPanel: !s.showControlPanel })),
      setEditorWidth: (px) => set({ editorWidth: Math.max(200, Math.min(px, 4000)) }),
      setFont: (id) => {
        applyFont(id);
        saveFont(id);
        set({ fontId: id });
      },
      setViewMode: (viewMode) => set({ viewMode }),
      setIsExplodedView: (isExplodedView) => set({ isExplodedView }),
      setTreeLayout: (treeLayout) => set({ treeLayout }),
      setTreeDirection: (treeDirection) => set({ treeDirection }),
      setTreeSpacing: (treeSpacing) => set({ treeSpacing }),
      setTreeFontSize: (treeFontSize) => set({ treeFontSize }),
      setTreeColors: (treeColors) => set({ treeColors }),
      setShowArrayIndices: (showArrayIndices) => set({ showArrayIndices }),
      setCytoscapeLayout: (cytoscapeLayout) => set({ cytoscapeLayout }),
      setCytoscapeCurveEdges: (cytoscapeCurveEdges) => set({ cytoscapeCurveEdges }),
      setGraph3dDimensions: (graph3dDimensions) => set({ graph3dDimensions }),
      setGraph3dParticles: (graph3dParticles) => set({ graph3dParticles }),
      setGraph3dLabelMode: (graph3dLabelMode) => set({ graph3dLabelMode }),
      setGraph3dCurvature: (graph3dCurvature) => set({ graph3dCurvature }),
      setFreezeLayout: (freezeLayout) => set({ freezeLayout }),
      toggleFreezeLayout: () => set((s) => ({ freezeLayout: !s.freezeLayout })),
    }),
    {
      name: "jvv-state",
      partialize: (state) => ({
        viewMode: state.viewMode,
        showEditor: state.showEditor,
        showControlPanel: state.showControlPanel,
        editorWidth: state.editorWidth,
        isExplodedView: state.isExplodedView,
        showArrayIndices: state.showArrayIndices,
        treeLayout: state.treeLayout,
        treeDirection: state.treeDirection,
        treeSpacing: state.treeSpacing,
        treeFontSize: state.treeFontSize,
        treeColors: state.treeColors,
        cytoscapeLayout: state.cytoscapeLayout,
        cytoscapeCurveEdges: state.cytoscapeCurveEdges,
        graph3dDimensions: state.graph3dDimensions,
        graph3dParticles: state.graph3dParticles,
        graph3dLabelMode: state.graph3dLabelMode,
        graph3dCurvature: state.graph3dCurvature,
        freezeLayout: state.freezeLayout,
      }),
    }
  )
);

// Apply saved font on load
applyFont(initialFont);
