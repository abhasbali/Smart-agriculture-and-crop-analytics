import { useState } from "react";
import IndiaMap, { MapRampLegend } from "./IndiaMap.jsx";

function DocIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"
        stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 3v6h6M8 13h8M8 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Hero({ ranked, summary, onNavigate }) {
  const [activeCrop, setActiveCrop] = useState("All");

  const releases = [
    { title: "Composite Agri Score · Heap-sorted ranking", meta: `${ranked.length} states · refreshed in session` },
    { title: "Crop production census · ETL cleaned", meta: `${summary.row_count.toLocaleString()} records · 0 nulls remaining` },
    { title: "Water-stressed states alert", meta: `${summary.water_stressed_rows} flagged rows in risk layer` },
  ];

  return (
    <section id="home" className="hero-band">
      <div className="hero-grid">
        {/* India choropleth card */}
        <div className="hero-card">
          <div>
            <div className="hero-card-title">Composite Agri Score, 2025-26</div>
            <div className="hero-card-sub">
              State-level performance · select a crop to filter map colours
            </div>
          </div>
          <div className="india-map-host">
            <IndiaMap ranked={ranked} onCropChange={setActiveCrop} />
          </div>
          <MapRampLegend selectedCrop={activeCrop} />
        </div>

        {/* About card */}
        <div className="hero-card about-card">
          <div className="kicker">About कृषि-दृष्टि (Krishi Drishti)</div>
          <h2>One unified read on Indian crop performance and risk.</h2>
          <p className="about-lead">
            Krishi Drishti is a hackathon-built analytics platform that ingests the agricultural
            census, cleans noise and missing values, ranks states by a composite agri score,
            and surfaces water-stressed regions on an interactive risk map — all under a single
            FastAPI service.
          </p>
          <div className="about-pillars">
            <div className="pillar">
              <strong>ETL</strong>
              Pandas-driven cleaning with median imputation and outlier capping.
            </div>
            <div className="pillar">
              <strong>Ranking</strong>
              Heap-sort on composite score, binary-search lookup by state.
            </div>
            <div className="pillar">
              <strong>Dashboard</strong>
              Four-panel Matplotlib export plus live Recharts views.
            </div>
            <div className="pillar">
              <strong>Risk Map</strong>
              Folium-style interactive Leaflet map with score-scaled markers.
            </div>
          </div>
        </div>

        {/* Latest release / pipeline status card */}
        <div className="hero-card latest-card">
          <h3>Pipeline Snapshot</h3>
          <div className="latest-rule" />
          {releases.map((r, i) => (
            <div className="release-item" key={i}>
              <div className="release-icon"><DocIcon /></div>
              <div className="release-text">
                <div className="release-title">{r.title}</div>
                <div className="release-meta">{r.meta}</div>
              </div>
            </div>
          ))}
          <button className="view-all-link" onClick={() => onNavigate("outputs")}>
            View All Outputs <ArrowIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
