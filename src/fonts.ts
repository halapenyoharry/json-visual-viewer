export interface FontEntry {
  id: string;
  name: string;
  family: string;
  category: "sans-serif" | "monospace";
  description: string;
  accessibility: string | null;
}

export const FONT_REGISTRY: FontEntry[] = [
  {
    id: "system",
    name: "System Default",
    family:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    category: "sans-serif",
    description: "Your OS default font",
    accessibility: null,
  },
  {
    id: "opendyslexic",
    name: "OpenDyslexic",
    family: '"OpenDyslexic", sans-serif',
    category: "sans-serif",
    description: "Weighted bottoms reduce letter confusion",
    accessibility: "dyslexia",
  },
  {
    id: "atkinson",
    name: "Atkinson Hyperlegible",
    family: '"Atkinson Hyperlegible", sans-serif',
    category: "sans-serif",
    description: "Max character distinction — Braille Institute",
    accessibility: "low-vision",
  },
  {
    id: "inter",
    name: "Inter",
    family: '"Inter", sans-serif',
    category: "sans-serif",
    description: "Clean, excellent at small sizes",
    accessibility: null,
  },
  {
    id: "jetbrains",
    name: "JetBrains Mono",
    family: '"JetBrains Mono", monospace',
    category: "monospace",
    description: "Monospace designed for code readability",
    accessibility: null,
  },
];

const STORAGE_KEY = "jvv-font-preference";

export function getSavedFont(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveFont(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // localStorage unavailable
  }
}

export function applyFont(id: string): void {
  const font = FONT_REGISTRY.find((f) => f.id === id);
  if (!font) return;
  document.documentElement.style.fontFamily = font.family;
  document.documentElement.dataset.font = id;
}
