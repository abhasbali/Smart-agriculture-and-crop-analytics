"""
Task 1: Agricultural Data ETL (Pandas)

Generates a synthetic crop census dataset, injects the official noise
pattern described in the hackathon brief, then cleans and enriches it.
All seven data-quality issues are resolved here:

    1. ' ha' string suffix on area_ha
    2. NaN values in yield_kg_ha
    3. -1 sensor faults in rainfall_mm
    4. irrigation_pct values above 100
    5. ALL CAPS state names
    6. Mixed-case crop names
    7. NaN values in loss_pct
"""
from __future__ import annotations

import os

import numpy as np
import pandas as pd

STATES = [
    "Punjab", "Haryana", "UP", "Bihar", "MP", "Maharashtra",
    "Gujarat", "Rajasthan", "Karnataka", "AP", "Tamil Nadu",
    "Odisha", "WB", "Assam", "Kerala",
]
CROPS = ["Wheat", "Rice", "Maize", "Sugarcane", "Cotton", "Soybean"]

RANDOM_SEED = 21
WATER_STRESS_IRRIGATION_THRESHOLD = 40.0
WATER_STRESS_RAINFALL_THRESHOLD = 600.0
QUINTALS_PER_TONNE = 10
RUPEES_PER_CRORE = 1e7

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "outputs")
OUTPUT_CSV_PATH = os.path.join(OUTPUT_DIR, "crop_census.csv")


def _generate_raw_dataset() -> pd.DataFrame:
    """Builds the base state x crop dataset and injects official noise."""
    np.random.seed(RANDOM_SEED)
    rng = np.random.default_rng(RANDOM_SEED)

    rows = []
    for state in STATES:
        for crop in CROPS:
            rows.append({
                "state": state,
                "crop": crop,
                "area_ha": np.random.randint(5000, 500000),
                "yield_kg_ha": np.random.uniform(800, 6000),
                "rainfall_mm": np.random.uniform(300, 2000),
                "fertilizer_kg_ha": np.random.uniform(50, 400),
                "irrigation_pct": np.random.uniform(10, 95),
                "msp_rs_qtl": np.random.uniform(1200, 4500),
                "loss_pct": np.random.choice([np.nan, 5, 10, 15, 20, 25], 1)[0],
            })
    df = pd.DataFrame(rows)

    # --- noise injection (mirrors the official starter code) ---
    area = df["area_ha"].values.astype(object)
    yld = df["yield_kg_ha"].values.astype(object)
    rain = df["rainfall_mm"].values.astype(float)
    irr = df["irrigation_pct"].values.astype(float)
    state_col = df["state"].values.astype(object)

    noisy_idx = rng.choice(len(df), size=25, replace=False)
    for i in noisy_idx[:6]:
        yld[i] = np.nan
    for i in noisy_idx[6:12]:
        area[i] = str(int(area[i])) + " ha"
    for i in noisy_idx[12:18]:
        rain[i] = -1
    for i in noisy_idx[18:22]:
        state_col[i] = str(state_col[i]).upper()
    for i in noisy_idx[22:25]:
        irr[i] = 110

    df["area_ha"] = area
    df["yield_kg_ha"] = yld
    df["rainfall_mm"] = rain
    df["irrigation_pct"] = irr
    df["state"] = state_col

    rng_crop = np.random.default_rng(200)
    wheat_mask = df["crop"] == "Wheat"
    df.loc[wheat_mask, "crop"] = rng_crop.choice(
        ["Wheat", "wheat", "WHEAT"], wheat_mask.sum()
    )

    return df


def _clean_area_ha(df: pd.DataFrame) -> pd.DataFrame:
    """Subtask 1: strip the ' ha' suffix and cast area_ha to int."""
    df["area_ha"] = (
        df["area_ha"].astype(str).str.replace(" ha", "", regex=False).astype(int)
    )
    return df


def _fix_rainfall(df: pd.DataFrame) -> pd.DataFrame:
    """Subtask 2: replace sensor-fault -1 readings with the state median."""
    df["rainfall_mm"] = df["rainfall_mm"].replace(-1, np.nan)
    df["rainfall_mm"] = df.groupby("state_clean")["rainfall_mm"].transform(
        lambda s: s.fillna(s.median())
    )
    return df


def _cap_irrigation(df: pd.DataFrame) -> pd.DataFrame:
    """Subtask 3: cap irrigation_pct at 100.0."""
    df["irrigation_pct"] = df["irrigation_pct"].clip(upper=100.0)
    return df


def _standardise_text_and_fill(df: pd.DataFrame) -> pd.DataFrame:
    """Subtask 4: Title-case state/crop, fill loss_pct and yield_kg_ha."""
    df["loss_pct"] = df.groupby("crop")["loss_pct"].transform(
        lambda s: s.fillna(s.median()).infer_objects(copy=False)
    )
    df["yield_kg_ha"] = df.groupby(["state_clean", "crop"])["yield_kg_ha"].transform(
        lambda s: s.fillna(s.median()).infer_objects(copy=False)
    )
    # Fallback for any group that was entirely NaN (crop-wise median).
    df["yield_kg_ha"] = df.groupby("crop")["yield_kg_ha"].transform(
        lambda s: s.fillna(s.median()).infer_objects(copy=False)
    )
    df["yield_kg_ha"] = df["yield_kg_ha"].astype(float)
    df["state"] = df["state_clean"]
    df = df.drop(columns=["state_clean"])
    return df


def _enrich(df: pd.DataFrame) -> pd.DataFrame:
    """Subtask 5: derived columns + Water_Stressed flag."""
    df["total_production_tonnes"] = (df["area_ha"] * df["yield_kg_ha"]) / 1000.0
    df["farm_revenue_cr"] = (
        df["total_production_tonnes"] * QUINTALS_PER_TONNE * df["msp_rs_qtl"]
    ) / RUPEES_PER_CRORE
    df["Water_Stressed"] = (
        (df["irrigation_pct"] < WATER_STRESS_IRRIGATION_THRESHOLD)
        | (df["rainfall_mm"] < WATER_STRESS_RAINFALL_THRESHOLD)
    )
    return df


def run_etl() -> pd.DataFrame:
    """Runs the full ETL pipeline and writes crop_census.csv to disk."""
    df = _generate_raw_dataset()

    # Title-case normalisation done early so groupby keys are consistent,
    # stored as a helper column until the final rename in _standardise step.
    df["state_clean"] = df["state"].astype(str).str.title()
    df["crop"] = df["crop"].astype(str).str.title()

    df = _clean_area_ha(df)
    df = _fix_rainfall(df)
    df = _cap_irrigation(df)
    df = _standardise_text_and_fill(df)
    df = _enrich(df)

    column_order = [
        "state", "crop", "area_ha", "yield_kg_ha", "rainfall_mm",
        "fertilizer_kg_ha", "irrigation_pct", "msp_rs_qtl", "loss_pct",
        "total_production_tonnes", "farm_revenue_cr", "Water_Stressed",
    ]
    df = df[column_order]

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    df.to_csv(OUTPUT_CSV_PATH, index=False)
    return df


def load_or_run_etl() -> pd.DataFrame:
    """Loads the cached CSV if present, otherwise runs the ETL pipeline."""
    if os.path.exists(OUTPUT_CSV_PATH):
        return pd.read_csv(OUTPUT_CSV_PATH)
    return run_etl()
