import { useStore } from "../store/useStore";
import type { TreeLayoutType, TreeDirection } from "../store/useStore";
import { ArrayDisplaySection } from "./ArrayDisplaySection";

const LAYOUTS: { value: TreeLayoutType; label: string }[] = [
  { value: "cluster", label: "Cluster" },
  { value: "tidy", label: "Tidy Tree" },
];

const DIRECTIONS: { value: TreeDirection; label: string }[] = [
  { value: "LR", label: "L → R" },
  { value: "RL", label: "R → L" },
  { value: "TB", label: "T ↓ B" },
  { value: "BT", label: "B ↑ T" },
];

export function TreeSettings() {
  const {
    treeLayout,
    setTreeLayout,
    treeDirection,
    setTreeDirection,
    treeSpacing,
    setTreeSpacing,
    treeFontSize,
    setTreeFontSize,
    treeColors,
    setTreeColors,
  } = useStore();

  return (
    <>
      <div className="settings-section">
        <div className="settings-section-title">Layout Style</div>
        <div className="settings-group">
          {LAYOUTS.map((l) => (
            <button
              key={l.value}
              className={`settings-btn ${treeLayout === l.value ? "active" : ""}`}
              onClick={() => setTreeLayout(l.value)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Orientation</div>
        <div className="settings-group" style={{ flexWrap: "wrap" }}>
          {DIRECTIONS.map((d) => (
            <button
              key={d.value}
              className={`settings-btn ${treeDirection === d.value ? "active" : ""}`}
              style={{ flexBasis: "40%" }}
              onClick={() => setTreeDirection(d.value)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Spacing</div>
        <div className="settings-row">
          <label>Spread (Horizontal)</label>
          <input
            type="range"
            className="settings-slider"
            min="50"
            max="400"
            step="10"
            value={treeSpacing.dy}
            onChange={(e) => setTreeSpacing({ ...treeSpacing, dy: Number(e.target.value) })}
          />
        </div>
        <div className="settings-row">
          <label>Density (Vertical)</label>
          <input
            type="range"
            className="settings-slider"
            min="5"
            max="60"
            step="1"
            value={treeSpacing.dx}
            onChange={(e) => setTreeSpacing({ ...treeSpacing, dx: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Aesthetics</div>
        <div className="settings-row">
          <label>Font Size ({treeFontSize}px)</label>
          <input
            type="range"
            className="settings-slider"
            min="6"
            max="24"
            step="1"
            value={treeFontSize}
            onChange={(e) => setTreeFontSize(Number(e.target.value))}
          />
        </div>
        <div className="settings-row">
          <div className="color-picker">
            <input
              type="color"
              className="color-input"
              value={treeColors.node}
              onChange={(e) => setTreeColors({ ...treeColors, node: e.target.value })}
            />
            <label>Node Color</label>
          </div>
        </div>
        <div className="settings-row">
          <div className="color-picker">
            <input
              type="color"
              className="color-input"
              value={treeColors.link}
              onChange={(e) => setTreeColors({ ...treeColors, link: e.target.value })}
            />
            <label>Link Stroke Color</label>
          </div>
        </div>
      </div>

      <ArrayDisplaySection />
    </>
  );
}
