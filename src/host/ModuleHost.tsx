import { useMemo } from "react";
import { getModule } from "../modules/registry";
import type { ModuleData } from "../modules/types";

export interface ModuleHostProps {
  moduleId: string;
  data: ModuleData;
  params: Record<string, unknown>;
  layerVisibility?: Record<string, boolean>;
  freeze?: boolean;
  onParamChange: (path: string, value: unknown) => void;
  onSelect?: (id: string | null) => void;
  onError?: (err: unknown) => void;
}

export function ModuleHost({
  moduleId,
  data,
  params,
  layerVisibility,
  freeze,
  onParamChange,
  onSelect,
  onError,
}: ModuleHostProps) {
  const mod = useMemo(() => getModule(moduleId), [moduleId]);
  if (!mod) {
    return (
      <div className="module-host module-host--missing">
        Unknown module: {moduleId}
      </div>
    );
  }
  const Component = mod.Component as React.ComponentType<{
    data: ModuleData;
    params: Record<string, unknown>;
    layerVisibility?: Record<string, boolean>;
    freeze?: boolean;
    onParamChange?: (path: string, value: unknown) => void;
    onSelect?: (id: string | null) => void;
    onError?: (err: unknown) => void;
  }>;
  return (
    <Component
      data={data}
      params={params}
      layerVisibility={mod.capabilities.layers ? layerVisibility : undefined}
      freeze={mod.capabilities.freeze ? freeze : undefined}
      onParamChange={onParamChange}
      onSelect={onSelect}
      onError={onError}
    />
  );
}

