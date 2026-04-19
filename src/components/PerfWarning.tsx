interface Props {
  nodeCount: number;
  viewLabel: string;
  onBypass: () => void;
}

export function PerfWarning({ nodeCount, viewLabel, onBypass }: Props) {
  return (
    <div className="perf-warning">
      <h3>Large dataset: {nodeCount.toLocaleString()} nodes</h3>
      <p>{viewLabel} view may hang or feel slow.</p>
      <button onClick={onBypass}>Render anyway</button>
    </div>
  );
}
