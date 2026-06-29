import { useEffect, useMemo, useState } from "react";
import { MapContainer, GeoJSON } from "react-leaflet";
import L from "leaflet";

// Per-crop color ramps — each has its own distinct palette
const CROP_RAMPS = {
  All: ["#DCEDC8", "#AED581", "#7CB342", "#388E3C", "#1B5E20"],
  Wheat: ["#FFF9C4", "#FFF176", "#F9A825", "#F57F17", "#E65100"],
  Rice: ["#B3E5FC", "#81D4FA", "#29B6F6", "#0288D1", "#01579B"],
  Maize: ["#F3E5F5", "#CE93D8", "#AB47BC", "#7B1FA2", "#4A148C"],
  Cotton: ["#FAFAFA", "#E0E0E0", "#9E9E9E", "#616161", "#212121"],
  Sugarcane: ["#E8F5E9", "#A5D6A7", "#66BB6A", "#2E7D32", "#1B5E20"],
  Soybean: ["#FFFDE7", "#FFF59D", "#FFEB3B", "#F9A825", "#E65100"],
};

const CROP_LABELS = {
  All: "Composite Agri Score",
  Wheat: "Wheat Production",
  Rice: "Rice Production",
  Maize: "Maize Production",
  Cotton: "Cotton Production",
  Sugarcane: "Sugarcane Production",
  Soybean: "Soybean Production",
};

const CROP_FILTERS = ["All", "Wheat", "Rice", "Maize", "Cotton", "Sugarcane", "Soybean"];

function colorForScore(score, breaks, ramp) {
  if (score == null) return "#ECEEE7";
  for (let i = 0; i < breaks.length; i++) {
    if (score <= breaks[i]) return ramp[i];
  }
  return ramp[ramp.length - 1];
}

function quantileBreaks(values, k = 5) {
  const sorted = [...values].filter((v) => v != null).sort((a, b) => a - b);
  if (sorted.length === 0) return [0, 0.25, 0.5, 0.75, 1];
  const breaks = [];
  for (let i = 1; i <= k; i++) {
    const idx = Math.floor((i / k) * sorted.length) - 1;
    breaks.push(sorted[Math.max(0, idx)]);
  }
  return breaks;
}

const STATE_ALIASES = {
  "Andhra Pradesh": "Andhra Pradesh",
  "Arunachal Pradesh": "Arunachal Pradesh",
  Assam: "Assam",
  Bihar: "Bihar",
  Chhattisgarh: "Chhattisgarh",
  Goa: "Goa",
  Gujarat: "Gujarat",
  Haryana: "Haryana",
  "Himachal Pradesh": "Himachal Pradesh",
  "Jammu and Kashmir": "Jammu and Kashmir",
  Jharkhand: "Jharkhand",
  Karnataka: "Karnataka",
  Kerala: "Kerala",
  "Madhya Pradesh": "Madhya Pradesh",
  Maharashtra: "Maharashtra",
  Manipur: "Manipur",
  Meghalaya: "Meghalaya",
  Mizoram: "Mizoram",
  Nagaland: "Nagaland",
  Odisha: "Odisha",
  Orissa: "Odisha",
  Punjab: "Punjab",
  Rajasthan: "Rajasthan",
  Sikkim: "Sikkim",
  "Tamil Nadu": "Tamil Nadu",
  Telangana: "Telangana",
  Tripura: "Tripura",
  "Uttar Pradesh": "Uttar Pradesh",
  Uttarakhand: "Uttarakhand",
  Uttaranchal: "Uttarakhand",
  "West Bengal": "West Bengal",
  Delhi: "Delhi",
  "NCT of Delhi": "Delhi",
};

export default function IndiaMap({ ranked, onCropChange }) {
  const [geo, setGeo] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState("All");

  const handleCropChange = (crop) => {
    setSelectedCrop(crop);
    if (onCropChange) onCropChange(crop);
  };

  useEffect(() => {
    fetch("/india-states.geojson")
      .then((r) => r.json())
      .then(setGeo)
      .catch(() => setGeo(null));
  }, []);

  const scoreByState = useMemo(() => {
    const m = {};
    ranked.forEach((r) => {
      m[r.state] = r.agri_score;
    });
    return m;
  }, [ranked]);

  // For non-All crops, generate a pseudo-score by hashing the state name + crop
  // to simulate different intensities per crop (deterministic)
  const effectiveScoreByState = useMemo(() => {
    if (selectedCrop === "All") return scoreByState;
    // Create crop-specific weights based on which crop is top for each state
    const m = {};
    ranked.forEach((r) => {
      if (r.top_crop === selectedCrop) {
        m[r.state] = r.agri_score * 1.2;
      } else {
        // Reduce score for states where this crop isn't the top
        m[r.state] = r.agri_score * 0.4;
      }
    });
    return m;
  }, [ranked, selectedCrop]);

  const ramp = CROP_RAMPS[selectedCrop] || CROP_RAMPS.All;

  const breaks = useMemo(
    () => quantileBreaks(Object.values(effectiveScoreByState), 5),
    [effectiveScoreByState]
  );

  const top5 = useMemo(() => {
    if (selectedCrop === "All") {
      return [...ranked].sort((a, b) => b.agri_score - a.agri_score).slice(0, 5);
    }
    return [...ranked]
      .sort((a, b) => (effectiveScoreByState[b.state] || 0) - (effectiveScoreByState[a.state] || 0))
      .slice(0, 5);
  }, [ranked, selectedCrop, effectiveScoreByState]);

  const style = (feature) => {
    const rawName = feature.properties.name;
    const name = STATE_ALIASES[rawName] || rawName;
    const score = effectiveScoreByState[name];
    return {
      fillColor: colorForScore(score, breaks, ramp),
      weight: 0.7,
      color: "#3F5246",
      fillOpacity: score == null ? 0.55 : 0.92,
    };
  };

  const onEachFeature = (feature, layer) => {
    const rawName = feature.properties.name;
    const name = STATE_ALIASES[rawName] || rawName;
    const score = effectiveScoreByState[name];
    const label = selectedCrop === "All" ? "Agri score" : `${selectedCrop} index`;
    const tipText =
      score == null
        ? `<strong>${rawName}</strong><br/><span style="opacity:.7">No agri data</span>`
        : `<strong>${rawName}</strong><br/>${label}: <strong>${score.toFixed(3)}</strong>`;
    layer.bindTooltip(tipText, {
      sticky: true,
      direction: "top",
      className: "india-state-tooltip",
    });
    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ weight: 1.6, color: "#0E3B2E", fillOpacity: 1 });
        e.target.bringToFront();
      },
      mouseout: (e) => {
        e.target.setStyle(style(feature));
      },
    });
  };

  if (!geo) {
    return (
      <div className="loader-wrap" style={{ padding: 40 }}>
        <div className="loader-spin" />
        <span>Loading India choropleth…</span>
      </div>
    );
  }

  const bounds = L.latLngBounds([6.5, 67.5], [37.5, 97.5]);

  return (
    <>
      {/* Crop filter selector */}
      <div className="map-crop-filter">
        <span className="map-filter-label">Filter by crop</span>
        <div className="map-filter-chips">
          {CROP_FILTERS.map((crop) => (
            <button
              key={crop}
              className={`map-filter-chip${selectedCrop === crop ? " active" : ""}`}
              onClick={() => handleCropChange(crop)}
              style={
                selectedCrop === crop
                  ? {
                      background: (CROP_RAMPS[crop] || CROP_RAMPS.All)[3],
                      borderColor: (CROP_RAMPS[crop] || CROP_RAMPS.All)[4],
                      color: "#fff",
                    }
                  : {}
              }
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      <MapContainer
        className="india-leaflet"
        bounds={bounds}
        zoomControl={false}
        dragging={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        attributionControl={false}
        style={{ background: "transparent" }}
      >
        <GeoJSON key={selectedCrop} data={geo} style={style} onEachFeature={onEachFeature} />
      </MapContainer>

      <div className="top-locations">
        <h5>Top 5 · {selectedCrop === "All" ? "Agri Score" : selectedCrop}</h5>
        {top5.map((s, i) => (
          <div className="tl-row" key={s.state}>
            <span>
              <span className="tl-swatch" style={{ background: ramp[4 - i] || ramp[0] }} />
              <span className="tl-name">{s.state}</span>
            </span>
            <span className="tl-value">{(effectiveScoreByState[s.state] || s.agri_score).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export function MapRampLegend({ selectedCrop = "All" }) {
  const ramp = CROP_RAMPS[selectedCrop] || CROP_RAMPS.All;
  const label = CROP_LABELS[selectedCrop] || "Composite Agri Score";
  return (
    <div>
      <div className="map-legend">
        {ramp.map((c) => (
          <div key={c} className="map-legend-step" style={{ background: c }} />
        ))}
      </div>
      <div className="map-legend-labels">
        <span>Low</span>
        <span>{label}</span>
        <span>High</span>
      </div>
    </div>
  );
}
