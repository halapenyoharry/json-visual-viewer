import { create } from "zustand";
import type { LayoutDirection } from "jsoncrack-react";

const SAMPLE_JSON = {
  name: "JSON Visual Viewer",
  version: "1.0.0",
  author: {
    name: "Harold",
    github: "halapenyoharry",
  },
  features: ["2D Graph View", "3D Graph View", "Dark Mode", "Monaco Editor"],
  settings: {
    theme: "midnight-alaska",
    layout: "RIGHT",
    maxNodes: 1500,
  },
  nested: {
    level1: {
      level2: {
        level3: "deep value",
        array: [1, 2, 3],
      },
    },
  },
};

interface AppState {
  json: string;
  layoutDirection: LayoutDirection;
  showEditor: boolean;
  setJson: (json: string) => void;
  setLayoutDirection: (dir: LayoutDirection) => void;
  toggleEditor: () => void;
}

export const useStore = create<AppState>((set) => ({
  json: JSON.stringify(SAMPLE_JSON, null, 2),
  layoutDirection: "RIGHT",
  showEditor: true,
  setJson: (json) => set({ json }),
  setLayoutDirection: (layoutDirection) => set({ layoutDirection }),
  toggleEditor: () => set((s) => ({ showEditor: !s.showEditor })),
}));
