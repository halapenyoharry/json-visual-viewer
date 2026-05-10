import { useEffect, useRef, useState } from "react";

export interface ModuleSurface {
  containerRef: React.RefObject<HTMLDivElement | null>;
  size: { width: number; height: number };
}

/**
 * Hook a module uses to track its container's measured size.
 * The host renders the container; the module attaches the ref.
 *
 * Internal to src/modules — modules cannot import src/components/useViewSurface
 * (ESLint isolation guard). In Step 8 of the refactor, this lifts up into
 * ModuleHost and the module API switches to receiving size via props.
 */
export function useModuleSurface(): ModuleSurface {
  const containerRef = useRef<HTMLDivElement | null>(null);
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
