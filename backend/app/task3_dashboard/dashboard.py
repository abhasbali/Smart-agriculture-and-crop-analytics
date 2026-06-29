"""
Task 3: Crop Dashboard (Matplotlib + JSON feed)

Produces the official 4-panel agri_dashboard.png for the evaluator, and
also shapes the same underlying data as JSON so the React frontend can
render its own interactive bubble chart, stacked bar, histogram and
trend line with recharts.
"""
from __future__ import annotations

import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "outputs")
OUTPUT_PNG_PATH = os.path.join(OUTPUT_DIR, "agri_dashboard.png")
TREND_YEARS = 5
TREND_VOLATILITY = 0.05
TREND_RANDOM_SEED = 42


def _bubble_chart_data(df: pd.DataFrame) -> list[dict]:
    """Subtask 1 data: rainfall vs yield, sized by area, coloured by crop."""
    return df[["state", "crop", "rainfall_mm", "yield_kg_ha", "area_ha"]].rename(
        columns={"rainfall_mm": "x", "yield_kg_ha": "y"}
    ).assign(size=lambda d: d["area_ha"] / 10000.0).to_dict(orient="records")


def _stacked_bar_data(df: pd.DataFrame) -> dict:
    """Subtask 2 data: total production per crop, stacked by top 8 states."""
    top_states = (
        df.groupby("state")["total_production_tonnes"].sum()
        .sort_values(ascending=False).head(8).index.tolist()
    )
    pivot = (
        df[df["state"].isin(top_states)]
        .pivot_table(index="state", columns="crop", values="total_production_tonnes", aggfunc="sum")
        .fillna(0)
        .reindex(top_states)
    )
    return {
        "states": top_states,
        "crops": pivot.columns.tolist(),
        "series": pivot.round(1).to_dict(orient="index"),
    }


def _histogram_data(df: pd.DataFrame, bins: int = 12) -> dict:
    """Subtask 3 data: yield distribution per crop for overlapping histograms."""
    histograms = {}
    edges = np.histogram_bin_edges(df["yield_kg_ha"], bins=bins)
    for crop, group in df.groupby("crop"):
        counts, _ = np.histogram(group["yield_kg_ha"], bins=edges)
        histograms[crop] = counts.tolist()
    return {"bin_edges": np.round(edges, 0).tolist(), "histograms": histograms}


def _trend_line_data(df: pd.DataFrame) -> dict:
    """Subtask 4 data: simulated 5-year yield trend for the top 3 crops."""
    rng = np.random.default_rng(TREND_RANDOM_SEED)
    top_crops = (
        df.groupby("crop")["total_production_tonnes"].sum()
        .sort_values(ascending=False).head(3).index.tolist()
    )
    trends = {}
    for crop in top_crops:
        base = df.loc[df["crop"] == crop, "yield_kg_ha"].mean()
        path = [base]
        for _ in range(TREND_YEARS - 1):
            shock = rng.uniform(-TREND_VOLATILITY, TREND_VOLATILITY)
            path.append(path[-1] * (1 + shock))
        path = np.array(path)
        trends[crop] = {
            "values": path.round(1).tolist(),
            "mean": float(path.mean()),
            "std": float(path.std()),
        }
    years = [f"Year {i + 1}" for i in range(TREND_YEARS)]
    return {"years": years, "crops": trends}


def build_dashboard_payload(df: pd.DataFrame) -> dict:
    """Assembles all four chart datasets for the frontend API response."""
    return {
        "bubble_chart": _bubble_chart_data(df),
        "stacked_bar": _stacked_bar_data(df),
        "histogram": _histogram_data(df),
        "trend_line": _trend_line_data(df),
    }


def render_dashboard_png(df: pd.DataFrame) -> str:
    """Renders the official 4-panel agri_dashboard.png at 150 DPI."""
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))

    # Panel 1: bubble chart.
    ax = axes[0, 0]
    for crop, group in df.groupby("crop"):
        ax.scatter(
            group["rainfall_mm"], group["yield_kg_ha"],
            s=group["area_ha"] / 10000.0, alpha=0.6, label=crop,
        )
    ax.set_xlabel("Rainfall (mm)")
    ax.set_ylabel("Yield (kg/ha)")
    ax.set_title("Rainfall vs Yield (bubble = area)")
    ax.legend(fontsize=7, loc="upper right")

    # Panel 2: stacked bar.
    ax = axes[0, 1]
    stacked = _stacked_bar_data(df)
    bottom = np.zeros(len(stacked["states"]))
    for crop in stacked["crops"]:
        values = np.array([stacked["series"][s].get(crop, 0) for s in stacked["states"]])
        ax.bar(stacked["states"], values, bottom=bottom, label=crop)
        bottom += values
    ax.set_ylabel("Total production (tonnes)")
    ax.set_title("Production by crop - top 8 states")
    ax.tick_params(axis="x", rotation=45)
    ax.legend(fontsize=7)

    # Panel 3: overlapping histograms.
    ax = axes[1, 0]
    for crop, group in df.groupby("crop"):
        ax.hist(group["yield_kg_ha"], bins=12, alpha=0.5, label=crop)
    ax.set_xlabel("Yield (kg/ha)")
    ax.set_ylabel("Frequency")
    ax.set_title("Yield distribution per crop")
    ax.legend(fontsize=7)

    # Panel 4: trend line with shaded mean +/- std.
    ax = axes[1, 1]
    trend = _trend_line_data(df)
    for crop, series in trend["crops"].items():
        values = np.array(series["values"])
        ax.plot(trend["years"], values, marker="o", label=crop)
        ax.fill_between(
            trend["years"], values - series["std"], values + series["std"], alpha=0.15,
        )
    ax.set_ylabel("Yield (kg/ha)")
    ax.set_title("5-year simulated yield trend (top 3 crops)")
    ax.legend(fontsize=7)

    fig.tight_layout()
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    fig.savefig(OUTPUT_PNG_PATH, dpi=150)
    plt.close(fig)
    return OUTPUT_PNG_PATH
