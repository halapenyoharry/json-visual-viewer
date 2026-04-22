import "./MassCirclesSettings.css";

/**
 * MassCirclesSettings
 * ===================
 * Legend and orientation for the MassCircles view. Explode and array
 * display settings don't apply here because MassCircles expects the
 * scanner output shape, which has already made those decisions upstream.
 *
 * If you want to steer this view, the knobs live in the scanner:
 *   --image-mass, --max-depth, and which extensions count as text.
 */
export function MassCirclesSettings() {
  return (
    <>
      <div className="settings-section">
        <div className="settings-section-title">Substrate Legend</div>
        <div className="mass-legend">
          <div className="mass-legend-row">
            <span className="mass-swatch" style={{ background: "#0f1447" }} />
            <span className="mass-legend-label">text</span>
            <span className="mass-legend-meta">lines of code or writing</span>
          </div>
          <div className="mass-legend-row">
            <span className="mass-swatch" style={{ background: "#ff6b9d" }} />
            <span className="mass-legend-label">image</span>
            <span className="mass-legend-meta">pegged to 1000 words</span>
          </div>
          <div className="mass-legend-row">
            <span
              className="mass-swatch"
              style={{ background: "linear-gradient(135deg, #0f1447, #00e5ff)" }}
            />
            <span className="mass-legend-label">container</span>
            <span className="mass-legend-meta">depth gradient</span>
          </div>
        </div>
      </div>
      <div className="settings-section">
        <div className="settings-section-title">About Mass</div>
        <div className="mass-about">
          Circles are sized by substrate-normalized mass, not by count. Text
          contributes line count, images contribute a fixed peg. Run the{" "}
          <code>project-mass-scanner</code> on any directory tree to produce
          input for this view.
        </div>
      </div>
    </>
  );
}
