import { useEffect, useRef, useState } from "react";

export interface ViewSurface {
  containerRef: React.RefObject<HTMLDivElement>;
  size: { width: number; height: number };
}

export function useViewSurface(): ViewSurface {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () =>
      setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { containerRef, size };
}
