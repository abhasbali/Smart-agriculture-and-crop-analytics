function formatBig(n) {
  if (n >= 1e7) return (n / 1e7).toFixed(2) + " Cr";
  if (n >= 1e5) return (n / 1e5).toFixed(2) + " L";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

export default function ProductionStats({ summary, rankedCount }) {
  return (
    <div className="prod-band">
      <div className="prod-band-head">
        <span>Pipeline Output Statistics</span>
        <span className="prod-eyebrow">Live · Updated each refresh</span>
      </div>
      <div className="prod-stats">
        <div className="prod-stat">
          <div className="ps-label">States Processed</div>
          <div className="ps-value">{summary.state_count}</div>
          <div className="ps-unit">Across India</div>
        </div>
        <div className="prod-stat">
          <div className="ps-label">Crops Analysed</div>
          <div className="ps-value">{summary.crop_count}</div>
          <div className="ps-unit">Census Categories</div>
        </div>
        <div className="prod-stat">
          <div className="ps-label">Records Processed</div>
          <div className="ps-value">{summary.row_count.toLocaleString()}</div>
          <div className="ps-unit">Clean Rows</div>
        </div>
        <div className="prod-stat">
          <div className="ps-label">Total Production</div>
          <div className="ps-value">{formatBig(summary.total_production_tonnes)}</div>
          <div className="ps-unit">Tonnes</div>
        </div>
      </div>
    </div>
  );
}
