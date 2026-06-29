import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl } from "react-leaflet";
import { riskMapHtmlUrl } from "../api.js";

const COLOUR_HEX = {
  green: "#2E7D32",
  orange: "#F9A825",
  red: "#C62828",
};

export default function RiskMapPanel({ markers }) {
  const waterStressed = useMemo(() => markers.filter((m) => m.water_stressed), [markers]);

  return (
    <section id="riskmap">
      <div className="section-head">
        <div>
          <div className="section-eyebrow">Task 4 · Agricultural Risk Map</div>
          <h2>Where the water stress is highest</h2>
        </div>
        <p className="section-desc">
          Each marker is sized by composite agri score and coloured by risk bucket. Toggle the
          water-stressed overlay to highlight states needing intervention.
        </p>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Live Interactive Map</h3>
          <span className="panel-note">
            <a href={riskMapHtmlUrl} target="_blank" rel="noreferrer" style={{ color: "var(--c-primary-dark)", fontWeight: 600 }}>
              Open the Folium HTML export ↗
            </a>
          </span>
        </div>

        <div className="legend-row" style={{ marginBottom: 14 }}>
          <span><span className="legend-dot" style={{ background: COLOUR_HEX.green }} /> Score &gt; 0.6 (Healthy)</span>
          <span><span className="legend-dot" style={{ background: COLOUR_HEX.orange }} /> Score 0.4–0.6 (Watch)</span>
          <span><span className="legend-dot" style={{ background: COLOUR_HEX.red }} /> Score &lt; 0.4 (At risk)</span>
          <span><span className="legend-dot" style={{ background: "#1565C0" }} /> Water-stressed overlay</span>
        </div>

        <div className="map-wrap">
          <MapContainer center={[22.0, 80.0]} zoom={5} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LayersControl position="topright">
              <LayersControl.Overlay checked name="State risk markers">
                <>
                  {markers.map((m) => (
                    <CircleMarker
                      key={m.state}
                      center={[m.lat, m.lng]}
                      radius={Math.max(m.radius, 7)}
                      pathOptions={{
                        color: COLOUR_HEX[m.colour],
                        fillColor: COLOUR_HEX[m.colour],
                        fillOpacity: 0.7,
                        weight: 1.4,
                      }}
                    >
                      <Popup>
                        <strong>{m.state}</strong>
                        <br />Agri score: {m.agri_score}
                        <br />Top crop: {m.top_crop}
                        <br />Water stressed: {m.water_stressed ? "Yes" : "No"}
                        <br />Farm revenue: ₹{m.farm_revenue_cr} Cr
                      </Popup>
                    </CircleMarker>
                  ))}
                </>
              </LayersControl.Overlay>
              <LayersControl.Overlay name="Water-stressed overlay">
                <>
                  {waterStressed.map((m) => (
                    <CircleMarker
                      key={`ws-${m.state}`}
                      center={[m.lat, m.lng]}
                      radius={Math.max(m.radius, 7) + 5}
                      pathOptions={{ color: "#1565C0", fillColor: "#1565C0", fillOpacity: 0.3 }}
                    />
                  ))}
                </>
              </LayersControl.Overlay>
            </LayersControl>
          </MapContainer>
        </div>
      </div>
    </section>
  );
}
