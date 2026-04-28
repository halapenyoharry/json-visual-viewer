interface Props {
  nodeCount: number;
  viewLabel: string;
  onBypass: () => void;
  /**
   * What the count denominates. Graph-family views render `graph nodes` (the
   * vertices of the detected graph). Tree-family views render `JSON tree
   * entities` (every object / array / scalar in the parsed document). Saying
   * the right denominator avoids the "33,786 nodes" confusion when the user
   * actually has 1,337 graph nodes.
   */
  countLabel?: "graph nodes" | "JSON tree entities";
}

export function PerfWarning({
  nodeCount,
  viewLabel,
  onBypass,
  countLabel = "graph nodes",
}: Props) {
  return (
    <div className="perf-warning">
      <h3>
        Large dataset: {nodeCount.toLocaleString()} {countLabel}
      </h3>
      <p>{viewLabel} view may hang or feel slow.</p>
      <button onClick={onBypass}>Render anyway</button>
    </div>
  );
}
