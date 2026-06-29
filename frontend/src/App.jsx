import { useCallback, useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import ProductionStats from "./components/ProductionStats.jsx";
import CropCircles from "./components/CropCircles.jsx";
import ETLPanel from "./components/ETLPanel.jsx";
import RankingPanel from "./components/RankingPanel.jsx";
import DashboardPanel from "./components/DashboardPanel.jsx";
import RiskMapPanel from "./components/RiskMapPanel.jsx";
import CropGallery from "./components/CropGallery.jsx";
import OutputsPanel from "./components/OutputsPanel.jsx";
import Footer from "./components/Footer.jsx";
import Loader from "./components/Loader.jsx";
import Chatbot from "./components/Chatbot.jsx";
import {
  fetchEtlSummary,
  fetchRanking,
  fetchDashboard,
  fetchRiskMap,
  refreshPipeline,
} from "./api.js";

const SECTION_IDS = ["home", "etl", "ranking", "dashboard", "riskmap", "outputs"];

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState(null);
  const [ranked, setRanked] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [markers, setMarkers] = useState([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, r, d, m] = await Promise.all([
        fetchEtlSummary(),
        fetchRanking(),
        fetchDashboard(),
        fetchRiskMap(),
      ]);
      setSummary(s);
      setRanked(r);
      setDashboard(d);
      setMarkers(m);
    } catch (e) {
      setError(
        "Could not reach the FastAPI backend at " +
          (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000") +
          ". Make sure it's running (uvicorn app.main:app)."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Smooth-scroll nav
  const handleNavigate = (tabId) => {
    setActiveTab(tabId);
    const el = document.getElementById(tabId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Scroll-spy
  useEffect(() => {
    const handler = () => {
      const scroll = window.scrollY + 140;
      for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTION_IDS[i]);
        if (el && el.offsetTop <= scroll) {
          setActiveTab(SECTION_IDS[i]);
          return;
        }
      }
      setActiveTab("home");
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshPipeline();
      await loadAll();
    } catch (e) {
      // surface in console only — UI keeps working with last-loaded data
      console.error("Refresh failed", e);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div>
      <Header
        activeTab={activeTab}
        onTabChange={handleNavigate}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <main className="page">
        {loading && !summary && <Loader label="Loading agricultural data from FastAPI…" />}

        {error && (
          <div
            className="panel"
            style={{
              marginTop: 32,
              borderLeft: "4px solid var(--c-risk-red)",
              background: "#FBEAEA",
            }}
          >
            <h3 className="panel-title" style={{ color: "var(--c-risk-red)" }}>
              Backend unreachable
            </h3>
            <p style={{ fontSize: 14, color: "var(--c-text-soft)", marginTop: 8 }}>{error}</p>
            <button
              onClick={loadAll}
              className="download-btn"
              style={{ marginTop: 14, alignSelf: "flex-start" }}
            >
              Retry
            </button>
          </div>
        )}

        {summary && ranked.length > 0 && dashboard && (
          <>
            <Hero ranked={ranked} summary={summary} onNavigate={handleNavigate} />
            <ProductionStats summary={summary} rankedCount={ranked.length} />
            <CropCircles ranked={ranked} />
            <ETLPanel summary={summary} />
            <RankingPanel ranked={ranked} />
            <DashboardPanel dashboard={dashboard} />
            <RiskMapPanel markers={markers} />
            <CropGallery ranked={ranked} dashboard={dashboard} />
            <OutputsPanel />
          </>
        )}
      </main>

      <Footer />
      <Chatbot />
    </div>
  );
}
