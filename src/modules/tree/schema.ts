import type {
  ParamSchema,
  EnumParam,
  NumberParam,
  ColorParam,
} from "../types";

export type TreeLayout = "cluster" | "tidy";
export type TreeDirection = "LR" | "RL" | "TB" | "BT";

export interface TreeParams {
  layout: TreeLayout;
  direction: TreeDirection;
  spacingX: number;
  spacingY: number;
  fontSize: number;
  nodeColor: string;
  linkColor: string;
}

const layoutParam: EnumParam<TreeLayout> = {
  type: "enum",
  label: "Layout Style",
  group: "Layout",
  default: "cluster",
  options: [
    { value: "cluster", label: "Cluster" },
    { value: "tidy", label: "Tidy Tree" },
  ],
};

const directionParam: EnumParam<TreeDirection> = {
  type: "enum",
  label: "Orientation",
  group: "Layout",
  default: "LR",
  options: [
    { value: "LR", label: "L → R" },
    { value: "RL", label: "R → L" },
    { value: "TB", label: "T ↓ B" },
    { value: "BT", label: "B ↑ T" },
  ],
};

const spacingXParam: NumberParam = {
  type: "number",
  label: "Density (Vertical)",
  description: "Tighter / looser node packing along the perpendicular axis.",
  group: "Layout",
  default: 14,
  min: 5,
  max: 60,
  step: 1,
  format: "slider",
};

const spacingYParam: NumberParam = {
  type: "number",
  label: "Spread (Horizontal)",
  description: "Distance between depth levels.",
  group: "Layout",
  default: 200,
  min: 50,
  max: 400,
  step: 10,
  format: "slider",
};

const fontSizeParam: NumberParam = {
  type: "number",
  label: "Font Size",
  group: "Typography",
  default: 11,
  min: 6,
  max: 24,
  step: 1,
  unit: "px",
  format: "slider",
};

const nodeColorParam: ColorParam = {
  type: "color",
  label: "Node Color",
  group: "Aesthetics",
  default: "#00e5ff",
};

const linkColorParam: ColorParam = {
  type: "color",
  label: "Link Stroke Color",
  group: "Aesthetics",
  default: "#555555",
};

export const treeSchema: ParamSchema = {
  layout: layoutParam,
  direction: directionParam,
  spacingX: spacingXParam,
  spacingY: spacingYParam,
  fontSize: fontSizeParam,
  nodeColor: nodeColorParam,
  linkColor: linkColorParam,
};

export const treeDefaults: TreeParams = {
  layout: layoutParam.default,
  direction: directionParam.default,
  spacingX: spacingXParam.default,
  spacingY: spacingYParam.default,
  fontSize: fontSizeParam.default,
  nodeColor: nodeColorParam.default,
  linkColor: linkColorParam.default,
};
