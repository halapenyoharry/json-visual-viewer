import { FONT_REGISTRY } from "../fonts";
import { useStore } from "../store/useStore";
import "./FontPicker.css";

export function FontPicker() {
  const { fontId, setFont } = useStore();

  return (
    <div className="font-picker">
      <label className="font-picker-label" htmlFor="font-select">
        Aa
      </label>
      <select
        id="font-select"
        className="font-picker-select"
        value={fontId}
        onChange={(e) => setFont(e.target.value)}
      >
        {FONT_REGISTRY.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
            {f.accessibility === "dyslexia" ? " ✦" : ""}
            {f.accessibility === "low-vision" ? " ◉" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
