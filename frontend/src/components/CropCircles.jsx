import { useMemo } from "react";
import { CropImage, ALL_CROPS } from "../data/cropImages.jsx";

export default function CropCircles({ ranked }) {
  // Aggregate "frequency as top crop" per crop type to display a number
  const topCount = useMemo(() => {
    const m = {};
    ALL_CROPS.forEach((c) => (m[c] = 0));
    ranked.forEach((r) => {
      if (m[r.top_crop] != null) m[r.top_crop] += 1;
    });
    return m;
  }, [ranked]);

  return (
    <section className="crop-band">
      <div className="crop-band-head">
        <div>
          <div className="kicker">Crop Coverage</div>
          <h3>Six staples driving the analysis</h3>
        </div>
        <div className="crop-band-sub">
          Number indicates states where the crop is ranked top by composite score
        </div>
      </div>
      <div className="crop-circles">
        {ALL_CROPS.map((crop) => (
          <div className="crop-circle" key={crop}>
            <div className="crop-disc">
              <CropImage crop={crop} alt={`${crop} crop`} />
            </div>
            <div className="crop-name">{crop}</div>
            <div className="crop-value">{topCount[crop]}</div>
            <div className="crop-value-unit">Top in {topCount[crop] === 1 ? "state" : "states"}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
