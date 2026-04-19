export interface HierarchyNode {
  name: string;
  children?: HierarchyNode[];
  _value?: unknown;
}

export function countHierarchyNodes(node: HierarchyNode): number {
  if (!node.children) return 1;
  let count = 1;
  for (const child of node.children) {
    count += countHierarchyNodes(child);
  }
  return count;
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
  nodeName: string = "root",
  showArrayIndices: boolean = true
): HierarchyNode {
  if (json === null) {
    return { name: isExplodedView ? nodeName : `${nodeName}: null` };
  }

  if (Array.isArray(json)) {
    if (json.length === 0) {
      return { name: `${nodeName} []` };
    }
    const children = json.map((item, index) => {
      // When showArrayIndices is false AND the item is a primitive, use
      // the primitive's value as the label directly (no `[N]:` prefix).
      // Objects and arrays inside arrays still get `[N]` because they
      // need some kind of label, but it's made less noisy.
      const childName = showArrayIndices
        ? `[${index}]`
        : (item !== null && typeof item === "object" ? `[${index}]` : "");
      return jsonToHierarchy(item, isExplodedView, childName, showArrayIndices);
    });
    return { name: nodeName, children };
  }

  if (typeof json === "object") {
    const keys = Object.keys(json as Record<string, unknown>);
    if (keys.length === 0) {
      return { name: `${nodeName} {}` };
    }
    const children = keys.map((key) =>
      jsonToHierarchy((json as Record<string, unknown>)[key], isExplodedView, key, showArrayIndices)
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

  // Compact View: key: value grouped into one singular text span.
  // If nodeName is empty (array item with indices hidden), show just the value.
  if (nodeName === "") {
    return { name: strVal, _value: json };
  }
  return { name: `${nodeName}: ${strVal}`, _value: json };
}
