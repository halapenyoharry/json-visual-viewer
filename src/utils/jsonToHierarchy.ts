export interface HierarchyNode {
  name: string;
  children?: HierarchyNode[];
  _value?: unknown;
}

/**
 * Converts any arbitrary JSON structure into a purely nested d3.hierarchy compatible layout.
 * @param json The parsed JSON object/array/primitive
 * @param isExplodedView Whether or not to decouple keys from primitive values.
 * @param nodeName Current node name assignment
 */
export function jsonToHierarchy(
  json: unknown,
  isExplodedView: boolean,
  nodeName: string = "root"
): HierarchyNode {
  if (json === null) {
    return { name: isExplodedView ? nodeName : `${nodeName}: null` };
  }

  if (Array.isArray(json)) {
    if (json.length === 0) {
      return { name: `${nodeName} []` };
    }
    const children = json.map((item, index) =>
      jsonToHierarchy(item, isExplodedView, `[${index}]`)
    );
    return { name: nodeName, children };
  }

  if (typeof json === "object") {
    const keys = Object.keys(json as Record<string, unknown>);
    if (keys.length === 0) {
      return { name: `${nodeName} {}` };
    }
    const children = keys.map((key) =>
      jsonToHierarchy((json as Record<string, unknown>)[key], isExplodedView, key)
    );
    return { name: nodeName, children };
  }

  // Primitive value handler
  const strVal = String(json);
  if (isExplodedView) {
    // Splits the key away from the value so the value gets its own leaf node bubble
    return {
      name: nodeName,
      children: [{ name: strVal, _value: json }],
    };
  }

  // Compact View: key: value grouped into one singular text span
  return { name: `${nodeName}: ${strVal}`, _value: json };
}
