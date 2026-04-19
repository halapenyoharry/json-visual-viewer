import { useStore } from "../store/useStore";

export function openJsonFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,.jsonc";
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const store = useStore.getState();
      store.setJson(text);
      if (store.graphAvailable) {
        store.setViewMode("graph");
      } else {
        store.setViewMode("tree");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

export function downloadBlob(data: BlobPart, filename: string, mime: string) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function saveCurrentJson() {
  const json = useStore.getState().json;
  downloadBlob(json, "data.json", "application/json");
}

const VIEW_CONTAINER_SELECTORS = [
  ".graph-panel",
  ".force-graph-panel",
  ".circles-panel",
];

export function exportCurrentViewAsSvg() {
  let container: Element | null = null;
  for (const sel of VIEW_CONTAINER_SELECTORS) {
    container = document.querySelector(sel);
    if (container) break;
  }
  const svg = container?.querySelector("svg");
  if (!svg) return;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  if (!clone.getAttribute("xmlns")) {
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }
  const source = new XMLSerializer().serializeToString(clone);
  const viewMode = useStore.getState().viewMode;
  downloadBlob(source, `jvv-${viewMode}.svg`, "image/svg+xml");
}
