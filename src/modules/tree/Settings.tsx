import type { SettingsProps, EnumParam } from "../types";
import type { TreeParams, TreeLayout, TreeDirection } from "./schema";
import { treeSchema } from "./schema";

export function TreeSettingsComponent({ params, onChange }: SettingsProps<TreeParams>) {
  const layoutOptions = (treeSchema.layout as EnumParam<TreeLayout>).options;
  const directionOptions = (treeSchema.direction as EnumParam<TreeDirection>).options;

  return (
    <>
      <div className="settings-section">
        <div className="settings-section-title">Layout Style</div>
        <div className="settings-group">
          {layoutOptions.map((l) => (
            <button
              key={l.value}
              className={`settings-btn ${params.layout === l.value ? "active" : ""}`}
              onClick={() => onChange("layout", l.value)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Orientation</div>
        <div className="settings-group" style={{ flexWrap: "wrap" }}>
          {directionOptions.map((d) => (
            <button
              key={d.value}
              className={`settings-btn ${params.direction === d.value ? "active" : ""}`}
              style={{ flexBasis: "40%" }}
              onClick={() => onChange("direction", d.value)}
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
            value={params.spacingY}
            onChange={(e) => onChange("spacingY", Number(e.target.value))}
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
            value={params.spacingX}
            onChange={(e) => onChange("spacingX", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Aesthetics</div>
        <div className="settings-row">
          <label>Font Size ({params.fontSize}px)</label>
          <input
            type="range"
            className="settings-slider"
            min="6"
            max="24"
            step="1"
            value={params.fontSize}
            onChange={(e) => onChange("fontSize", Number(e.target.value))}
          />
        </div>
        <div className="settings-row">
          <div className="color-picker">
            <input
              type="color"
              className="color-input"
              value={params.nodeColor}
              onChange={(e) => onChange("nodeColor", e.target.value)}
            />
            <label>Node Color</label>
          </div>
        </div>
        <div className="settings-row">
          <div className="color-picker">
            <input
              type="color"
              className="color-input"
              value={params.linkColor}
              onChange={(e) => onChange("linkColor", e.target.value)}
            />
            <label>Link Stroke Color</label>
          </div>
        </div>
      </div>
    </>
  );
}
