import type { ComponentType } from "react";
import type { DetectedGraph } from "../graphDetect";
import type { HierarchyNode } from "../utils/jsonToHierarchy";

export type ParamType =
  | "boolean"
  | "number"
  | "integer"
  | "string"
  | "color"
  | "enum"
  | "object"
  | "vector2"
  | "vector3"
  | "json";

export interface ParamMetaBase<T> {
  type: ParamType;
  label: string;
  description?: string;
  default: T;
  group?: string;
  advanced?: boolean;
  hidden?: boolean;
  experimental?: boolean;
  showWhen?: (params: Record<string, unknown>) => boolean;
}

export interface NumberParam extends ParamMetaBase<number> {
  type: "number" | "integer";
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  format?: "slider" | "input" | "stepper";
}

export interface EnumParam<T extends string = string> extends ParamMetaBase<T> {
  type: "enum";
  options: { value: T; label: string; hint?: string }[];
}

export interface ColorParam extends ParamMetaBase<string> {
  type: "color";
  alpha?: boolean;
}

export interface BooleanParam extends ParamMetaBase<boolean> {
  type: "boolean";
}

export interface StringParam extends ParamMetaBase<string> {
  type: "string";
  multiline?: boolean;
  placeholder?: string;
}

export interface ObjectParam
  extends ParamMetaBase<Record<string, unknown>> {
  type: "object";
  schema: ParamSchema;
}

export interface Vector2Param
  extends ParamMetaBase<{ x: number; y: number }> {
  type: "vector2";
  min?: number;
  max?: number;
  step?: number;
}

export interface Vector3Param
  extends ParamMetaBase<{ x: number; y: number; z: number }> {
  type: "vector3";
  min?: number;
  max?: number;
  step?: number;
}

export interface JsonParam extends ParamMetaBase<unknown> {
  type: "json";
}

export type ParamMeta =
  | NumberParam
  | EnumParam
  | ColorParam
  | BooleanParam
  | StringParam
  | ObjectParam
  | Vector2Param
  | Vector3Param
  | JsonParam;

export type ParamSchema = Record<string, ParamMeta>;

export type ParamsOf<S extends ParamSchema> = {
  [K in keyof S]: S[K] extends ParamMetaBase<infer V> ? V : never;
};

export type DataKind = "rawJson" | "hierarchy" | "graph" | "massTree";

export interface DataContract {
  accepts: DataKind[];
  preferred: DataKind;
}

export interface Capabilities {
  exportSvg?: boolean;
  exportPng?: boolean;
  freeze?: boolean;
  layers?: boolean;
  resetView?: boolean;
}

export interface MassNode {
  name: string;
  children?: MassNode[];
  mass?: number;
  substrate?: "text" | "image" | string;
}

export interface ModuleData {
  rawJson?: string;
  hierarchy?: HierarchyNode;
  graph?: DetectedGraph | null;
  massTree?: MassNode;
}

export interface ModuleProps<P> {
  data: ModuleData;
  params: P;
  layerVisibility?: Record<string, boolean>;
  freeze?: boolean;
  onParamChange?: (path: string, value: unknown) => void;
  onSelect?: (id: string | null) => void;
  onError?: (err: unknown) => void;
}

export interface SettingsProps<P> {
  params: P;
  schema: ParamSchema;
  onChange: (path: string, value: unknown) => void;
  showAdvanced?: boolean;
  capabilities?: Capabilities;
}

export interface JsonModule<S extends ParamSchema = ParamSchema> {
  id: string;
  label: string;
  description: string;
  version: string;
  schema: S;
  defaults: ParamsOf<S>;
  data: DataContract;
  capabilities: Capabilities;
  Component: ComponentType<ModuleProps<ParamsOf<S>>>;
  SettingsComponent?: ComponentType<SettingsProps<ParamsOf<S>>>;
}
