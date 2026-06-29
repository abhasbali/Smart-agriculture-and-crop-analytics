import { useMemo } from "react";
import { CropImage, CROP_DESCRIPTIONS, ALL_CROPS } from "../data/cropImages.jsx";

export default function CropGallery({ ranked, dashboard }) {
  // Use dashboard.stacked_bar to get production sums per crop where possible
  const productionByCrop = useMemo(() => {
    if (!dashboard?.stacked_bar?.series) return {};
    const totals = {};
    const { series, crops } = dashboard.stacked_bar;
    crops.forEach((c) => (totals[c] = 0));
    Object.values(series).forEach((stateRow) => {
      Object.entries(stateRow).forEach(([crop, val]) => {
        if (totals[crop] != null) totals[crop] += val;
      });
    });
    return totals;
  }, [dashboard]);

  const topStateForCrop = useMemo(() => {
    const m = {};
    ALL_CROPS.forEach((c) => (m[c] = null));
    ranked.forEach((r) => {
      if (m[r.top_crop] == null) m[r.top_crop] = r.state;
    });
    return m;
  }, [ranked]);

  return (
    <section id="gallery">
      <div className="section-head">
        <div>
          <div className="section-eyebrow">Crop Gallery</div>
          <h2>Six crops, six geographies</h2>
        </div>
        <p className="section-desc">
          Each card pairs a representative image with the strongest performing state from the
          ranking output, giving evaluators a quick visual key into the data.
        </p>
      </div>

      <div className="gallery-grid">
        {ALL_CROPS.map((crop) => {
          const prod = productionByCrop[crop];
          const top = topStateForCrop[crop];
          return (
            <article className="gallery-card" key={crop}>
              <div className="gallery-thumb">
                <CropImage crop={crop} alt={`${crop} field`} />
                <div className="gallery-overlay">
                  <span className="gallery-overlay-eyebrow">{crop}</span>
                  {top && (
                    <span style={{ fontSize: 11, opacity: 0.9, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Top in {top}
                    </span>
                  )}
                </div>
              </div>
              <div className="gallery-body">
                <div className="gallery-name">{crop}</div>
                <div className="gallery-desc">{CROP_DESCRIPTIONS[crop]}</div>
                <div className="gallery-meta">
                  <span>Top State</span>
                  <strong>{top || "—"}</strong>
                </div>
                {prod != null && prod > 0 && (
                  <div className="gallery-meta" style={{ borderTop: "none", paddingTop: 0 }}>
                    <span>Total Production</span>
                    <strong>{(prod / 1e6).toFixed(2)} M t</strong>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
