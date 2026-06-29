const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "etl", label: "ETL Results" },
  { id: "ranking", label: "State Rankings" },
  { id: "dashboard", label: "Crop Dashboard" },
  { id: "riskmap", label: "Risk Map" },
  { id: "outputs", label: "Outputs" },
];

function Emblem() {
  // Stylized agri-emblem: stalk inside a circular badge
  return (
    <svg viewBox="0 0 64 64" width="46" height="46" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M32 8 C 26 18, 24 28, 32 56 C 40 28, 38 18, 32 8 Z"
        fill="#0E3B2E"
      />
      <path
        d="M32 24 C 24 22, 16 26, 14 34 C 22 36, 28 32, 32 28"
        fill="#0E3B2E"
        opacity="0.85"
      />
      <path
        d="M32 24 C 40 22, 48 26, 50 34 C 42 36, 36 32, 32 28"
        fill="#0E3B2E"
        opacity="0.85"
      />
      <path d="M32 8 L 32 56" stroke="#F4B324" strokeWidth="1.3" />
    </svg>
  );
}

export default function Header({ activeTab, onTabChange, onRefresh, refreshing }) {
  return (
    <header className="gov-header">
      <div className="gov-header-strip">
        <span className="strip-flag">
          <span className="gov-flag-stripe" />
          Krishi Drishti · Python Data Science Hackathon Submission
        </span>
        <span>Smart Agriculture & Crop Analytics Platform</span>
      </div>
      <div className="gov-header-main">
        <div className="gov-brand">
          <div className="gov-emblem">
            <Emblem />
          </div>
          <div className="gov-brand-text">
            <div className="gov-title">
              Krishi <em>Drishti</em>
            </div>
            <div className="gov-subtitle">Unified Crop Analytics &amp; Risk Platform</div>
          </div>
        </div>

        <nav className="gov-nav" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`gov-nav-link ${activeTab === item.id ? "is-active" : ""}`}
              onClick={() => onTabChange(item.id)}
            >
              {item.label}
            </button>
          ))}
          <button className="gov-nav-cta" onClick={onRefresh} disabled={refreshing}>
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </nav>
      </div>
    </header>
  );
}
