import { useMemo } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  Line,
} from "recharts";
import { dashboardPngUrl } from "../api.js";

const CROP_COLOURS = {
  Wheat: "#E5A52B",
  Rice: "#2E7D32",
  Maize: "#F4B324",
  Sugarcane: "#558B2F",
  Cotton: "#90A4AE",
  Soybean: "#8D6E63",
};
const colourFor = (c) => CROP_COLOURS[c] || "#1B5E20";

export default function DashboardPanel({ dashboard }) {
  const bubbleByCrop = useMemo(() => {
    if (!dashboard) return {};
    return dashboard.bubble_chart.reduce((acc, p) => {
      (acc[p.crop] = acc[p.crop] || []).push(p);
      return acc;
    }, {});
  }, [dashboard]);

  const stackedBarRows = useMemo(() => {
    if (!dashboard) return [];
    const { states, series } = dashboard.stacked_bar;
    return states.map((state) => ({ state, ...series[state] }));
  }, [dashboard]);

  const histogramRows = useMemo(() => {
    if (!dashboard) return [];
    const { bin_edges, histograms } = dashboard.histogram;
    return bin_edges.slice(0, -1).map((edge, i) => {
      const row = { bin: `${Math.round(edge)}` };
      Object.entries(histograms).forEach(([crop, counts]) => (row[crop] = counts[i]));
      return row;
    });
  }, [dashboard]);

  const trendRows = useMemo(() => {
    if (!dashboard) return [];
    const { years, crops } = dashboard.trend_line;
    return years.map((year, i) => {
      const row = { year };
      Object.entries(crops).forEach(([crop, series]) => {
        row[`${crop}_value`] = series.values[i];
        row[`${crop}_high`] = series.mean + series.std;
      });
      return row;
    });
  }, [dashboard]);

  const crops = Object.keys(bubbleByCrop);
  const trendCrops = Object.keys(dashboard.trend_line.crops);

  return (
    <section id="dashboard">
      <div className="section-head">
        <div>
          <div className="section-eyebrow">Task 3 · Crop Dashboard</div>
          <h2>Four-panel analytics on yield, distribution, and trend</h2>
        </div>
        <p className="section-desc">
          Bubble, stacked-bar, histogram, and trend views — rendered live with Recharts and
          also exported as a static Matplotlib PNG for offline evaluation.
        </p>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Rainfall vs Yield</h3>
            <span className="panel-note">Bubble size = area cultivated</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid stroke="#e7ecdf" />
              <XAxis type="number" dataKey="x" name="Rainfall" unit=" mm" tick={{ fontSize: 11 }} />
              <YAxis type="number" dataKey="y" name="Yield" unit=" kg/ha" tick={{ fontSize: 11 }} />
              <ZAxis type="number" dataKey="size" range={[20, 320]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {crops.map((crop) => (
                <Scatter
                  key={crop}
                  name={crop}
                  data={bubbleByCrop[crop]}
                  fill={colourFor(crop)}
                  fillOpacity={0.65}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Production by Crop</h3>
            <span className="panel-note">Top 8 states, stacked tonnes</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stackedBarRows} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid stroke="#e7ecdf" vertical={false} />
              <XAxis dataKey="state" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {dashboard.stacked_bar.crops.map((crop) => (
                <Bar key={crop} dataKey={crop} stackId="production" fill={colourFor(crop)} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Yield Distribution</h3>
            <span className="panel-note">Overlapping histogram per crop</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={histogramRows} barGap={-22} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid stroke="#e7ecdf" vertical={false} />
              <XAxis dataKey="bin" tick={{ fontSize: 10 }} label={{ value: "Yield (kg/ha)", position: "insideBottom", offset: -2, fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: "Frequency", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {Object.keys(dashboard.histogram.histograms).map((crop) => (
                <Bar key={crop} dataKey={crop} fill={colourFor(crop)} fillOpacity={0.55} barSize={22} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">5-Year Yield Trend</h3>
            <span className="panel-note">Simulated random walk · top 3 crops · shaded ±1 std</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={trendRows} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid stroke="#e7ecdf" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: "kg/ha", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {trendCrops.map((crop) => (
                <Area
                  key={`${crop}-band`}
                  dataKey={`${crop}_high`}
                  stackId={`band-${crop}`}
                  stroke="none"
                  fill={colourFor(crop)}
                  fillOpacity={0.12}
                  legendType="none"
                />
              ))}
              {trendCrops.map((crop) => (
                <Line
                  key={crop}
                  dataKey={`${crop}_value`}
                  name={crop}
                  stroke={colourFor(crop)}
                  strokeWidth={2.4}
                  dot={{ r: 3 }}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Matplotlib Export · agri_dashboard.png</h3>
          <span className="panel-note">Static 4-panel render for offline evaluators</span>
        </div>
        <a href={dashboardPngUrl} target="_blank" rel="noreferrer">
          <img
            src={dashboardPngUrl}
            alt="Static agricultural dashboard export"
            style={{ width: "100%", borderRadius: "10px", border: "1px solid var(--c-card-border)" }}
          />
        </a>
      </div>
    </section>
  );
}
