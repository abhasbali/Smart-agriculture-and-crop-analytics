import { csvDownloadUrl } from "../api.js";

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ETLPanel({ summary }) {
  return (
    <section id="etl">
      <div className="section-head">
        <div>
          <div className="section-eyebrow">Task 1 · Extract Transform Load</div>
          <h2>Census cleaned, noise removed</h2>
        </div>
        <p className="section-desc">
          The raw crop census is ingested into a single tidy frame: missing values imputed,
          outlier yields capped, irrigation percentages bounded, and a Water_Stressed flag
          derived from rainfall and irrigation thresholds.
        </p>
      </div>

      <div className="panel">
        <div className="etl-grid">
          <div>
            <h4 style={{ fontFamily: "var(--f-body)", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--c-primary-dark)", marginBottom: 8 }}>
              Cleaning Summary
            </h4>
            <ul className="etl-summary-list">
              <li><span className="etl-key">Rows after cleaning</span><span className="etl-val">{summary.row_count.toLocaleString()}</span></li>
              <li><span className="etl-key">Unique states</span><span className="etl-val">{summary.state_count}</span></li>
              <li><span className="etl-key">Unique crops</span><span className="etl-val">{summary.crop_count}</span></li>
              <li><span className="etl-key">Average yield</span><span className="etl-val">{summary.avg_yield_kg_ha.toLocaleString()} kg/ha</span></li>
              <li><span className="etl-key">Average irrigation</span><span className="etl-val">{summary.avg_irrigation_pct}%</span></li>
              <li><span className="etl-key">Total production</span><span className="etl-val">{(summary.total_production_tonnes / 1e6).toFixed(2)} M tonnes</span></li>
              <li><span className="etl-key">Total farm revenue</span><span className="etl-val">₹{(summary.total_farm_revenue_cr / 1000).toFixed(1)}K Cr</span></li>
              <li><span className="etl-key">Water-stressed rows</span><span className="etl-val">{summary.water_stressed_rows}</span></li>
            </ul>
          </div>

          <div className="noise-card">
            <h4>Noise Issues Resolved</h4>
            <div className="noise-row">
              <span>Missing yield, irrigation, rainfall values</span>
              <span className="check"><CheckIcon /></span>
            </div>
            <div className="noise-row">
              <span>Inconsistent state name capitalisation</span>
              <span className="check"><CheckIcon /></span>
            </div>
            <div className="noise-row">
              <span>Crop-name typo normalisation</span>
              <span className="check"><CheckIcon /></span>
            </div>
            <div className="noise-row">
              <span>Outlier yields capped at the 99th percentile</span>
              <span className="check"><CheckIcon /></span>
            </div>
            <div className="noise-row">
              <span>Irrigation % clamped to [0, 100]</span>
              <span className="check"><CheckIcon /></span>
            </div>
            <div className="noise-row">
              <span>Water_Stressed flag derived from rainfall + irrigation</span>
              <span className="check"><CheckIcon /></span>
            </div>

            <a
              className="download-btn alt"
              href={csvDownloadUrl}
              target="_blank"
              rel="noreferrer"
              style={{ marginTop: 16, alignSelf: "stretch" }}
            >
              <DownloadIcon /> Download crop_census.csv
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
