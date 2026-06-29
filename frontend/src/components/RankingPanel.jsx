import { useState } from "react";
import { searchRanking } from "../api.js";

export default function RankingPanel({ ranked }) {
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const maxScore = ranked.length ? Math.max(...ranked.map((r) => r.agri_score)) : 1;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchError("");
    try {
      const result = await searchRanking(query.trim());
      setSearchResult(result);
    } catch {
      setSearchResult(null);
      setSearchError(`No state matching "${query}" was found.`);
    }
  };

  return (
    <section id="ranking">
      <div className="section-head">
        <div>
          <div className="section-eyebrow">Task 2 · State Rankings</div>
          <h2>States, sorted by composite agri score</h2>
        </div>
        <p className="section-desc">
          Heap-sorted using a max-heap implementation. Use the search box for an O(log n)
          binary lookup against the ranked list.
        </p>
      </div>

      <div className="panel">
        <form className="rank-search" onSubmit={handleSearch}>
          <input
            placeholder="Search a state, e.g. Punjab"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="State search"
          />
          <button type="submit">Binary Search</button>
        </form>

        {searchResult && (
          <div className="rank-search-result">
            <strong>{searchResult.state}</strong> ranks{" "}
            <strong>#{searchResult.rank}</strong> of {ranked.length} states with a composite
            agri score of <strong>{searchResult.agri_score.toFixed(3)}</strong>.
          </div>
        )}
        {searchError && (
          <div className="rank-search-result" style={{ borderLeftColor: "var(--c-risk-red)", color: "var(--c-risk-red)" }}>
            {searchError}
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table className="rank-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>State</th>
                <th>Top Crop</th>
                <th>Avg Yield</th>
                <th>Avg Revenue</th>
                <th>Irrigation</th>
                <th>Agri Score</th>
                <th>Water</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((s) => (
                <tr key={s.state}>
                  <td>
                    <span className={`rank-badge ${s.rank <= 3 ? `r${s.rank}` : ""}`}>{s.rank}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{s.state}</td>
                  <td>{s.top_crop}</td>
                  <td className="mono">{s.avg_yield.toFixed(0)} kg/ha</td>
                  <td className="mono">₹{(s.avg_revenue ?? 0).toFixed(0)} Cr</td>
                  <td className="mono">{s.avg_irrigation_pct.toFixed(1)}%</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="score-bar-track">
                        <div className="score-bar-fill" style={{ width: `${(s.agri_score / maxScore) * 100}%` }} />
                      </div>
                      <span className="mono" style={{ fontSize: 12.5, fontWeight: 600 }}>
                        {s.agri_score.toFixed(3)}
                      </span>
                    </div>
                  </td>
                  <td>
                    {s.water_stressed ? (
                      <span className="water-pill">Stressed</span>
                    ) : (
                      <span style={{ color: "var(--c-text-muted)", fontSize: 12 }}>Stable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
