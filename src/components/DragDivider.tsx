import { useEffect, useRef } from "react";
import "./DragDivider.css";

interface DragDividerProps {
  /** Called with the pointer's clientX during drag. */
  onChange: (clientX: number) => void;
  /** Optional: called on double-click to reset. */
  onReset?: () => void;
}

export function DragDivider({ onChange, onReset }: DragDividerProps) {
  const draggingRef = useRef(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      onChange(e.clientX);
    };
    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [onChange]);

  return (
    <div
      className="drag-divider"
      role="separator"
      aria-orientation="vertical"
      title="Drag to resize · Double-click to reset"
      onMouseDown={(e) => {
        e.preventDefault();
        draggingRef.current = true;
        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";
      }}
      onDoubleClick={onReset}
    />
  );
}
