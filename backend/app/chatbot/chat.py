"""
Groq-backed chatbot module.

Builds a compact, deterministic text context from the cached pipeline
state (cleaned dataframe + state ranking + dashboard payload + risk map
payload) and sends it as a system prompt to Groq's OpenAI-compatible
chat completions endpoint.

The full Indian crop dataset is ~180 state-crop rows, which fits in the
context window comfortably, so we hand the model everything it needs to
answer factual questions without retrieval.
"""
from __future__ import annotations

import logging
import os
from typing import List, Optional

import httpx
import pandas as pd

logger = logging.getLogger(__name__)

GROQ_BASE_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_TIMEOUT = float(os.getenv("GROQ_TIMEOUT", "30"))


# --------------------------------------------------------------------------- #
# Context builder                                                              #
# --------------------------------------------------------------------------- #
def build_context_summary(
    df: pd.DataFrame,
    ranked: list[dict],
    dashboard: dict,
    riskmap: list[dict],
) -> str:
    """Return a Markdown-formatted compact summary of the entire dataset."""
    # ---- 1. headline numbers ------------------------------------------------
    totals = {
        "rows": int(len(df)),
        "states": int(df["state"].nunique()),
        "crops": int(df["crop"].nunique()),
        "avg_yield_kg_ha": round(float(df["yield_kg_ha"].mean()), 2),
        "avg_irrigation_pct": round(float(df["irrigation_pct"].mean()), 2),
        "total_production_tonnes": round(float(df["total_production_tonnes"].sum()), 2),
        "total_farm_revenue_cr": round(float(df["farm_revenue_cr"].sum()), 2),
        "water_stressed_rows": int(df["Water_Stressed"].sum()),
    }

    # ---- 2. per-crop aggregates --------------------------------------------
    crop_agg = (
        df.groupby("crop")
        .agg(
            avg_yield_kg_ha=("yield_kg_ha", "mean"),
            avg_irrigation_pct=("irrigation_pct", "mean"),
            total_production_tonnes=("total_production_tonnes", "sum"),
            total_revenue_cr=("farm_revenue_cr", "sum"),
            states_grown_in=("state", "nunique"),
        )
        .round(2)
        .reset_index()
        .sort_values("total_production_tonnes", ascending=False)
    )

    # ---- 3. top-producing states per crop ----------------------------------
    top_by_crop: dict[str, list[str]] = {}
    for crop, sub in df.groupby("crop"):
        top = sub.nlargest(3, "total_production_tonnes")[
            ["state", "total_production_tonnes"]
        ]
        top_by_crop[crop] = [
            f"{r.state} ({r.total_production_tonnes:,.0f} t)"
            for r in top.itertuples()
        ]

    # ---- 4. risk distribution ----------------------------------------------
    risk_counts = {"green": 0, "orange": 0, "red": 0, "water_stressed": 0}
    for m in riskmap:
        risk_counts[m["colour"]] = risk_counts.get(m["colour"], 0) + 1
        if m.get("water_stressed"):
            risk_counts["water_stressed"] += 1

    # ---- 5. assemble markdown ----------------------------------------------
    lines: list[str] = []
    lines.append("# Krishi Drishti — Project Data Context")
    lines.append(
        "This is the entire dataset produced by the Krishi Drishti ETL + "
        "ranking + dashboard + risk pipeline. Use it as ground truth when "
        "answering the user. If a fact is not present here, say so plainly."
    )

    lines.append("\n## Headline Numbers")
    lines.append(f"- States covered: {totals['states']}")
    lines.append(f"- Crops covered: {totals['crops']}")
    lines.append(f"- Total state-crop rows: {totals['rows']}")
    lines.append(f"- Average yield: {totals['avg_yield_kg_ha']} kg/ha")
    lines.append(f"- Average irrigation: {totals['avg_irrigation_pct']}%")
    lines.append(
        f"- Total production: {totals['total_production_tonnes']:,.0f} tonnes"
    )
    lines.append(
        f"- Total farm revenue: ₹{totals['total_farm_revenue_cr']:,.2f} crore"
    )
    lines.append(
        f"- Water-stressed state-crop rows: {totals['water_stressed_rows']}"
    )

    lines.append("\n## Per-Crop Aggregates")
    lines.append(
        "| Crop | Avg Yield (kg/ha) | Avg Irrigation (%) | Total Prod (t) | "
        "Total Revenue (₹ Cr) | States |"
    )
    lines.append("|---|---|---|---|---|---|")
    for r in crop_agg.itertuples():
        lines.append(
            f"| {r.crop} | {r.avg_yield_kg_ha} | {r.avg_irrigation_pct} | "
            f"{r.total_production_tonnes:,.0f} | {r.total_revenue_cr:,.2f} | "
            f"{r.states_grown_in} |"
        )

    lines.append("\n## Top 3 Producing States per Crop")
    for crop, tops in top_by_crop.items():
        lines.append(f"- **{crop}**: {', '.join(tops)}")

    lines.append("\n## State Ranking (Composite Agri Score)")
    lines.append(
        "| Rank | State | Top Crop | Agri Score | Avg Yield (kg/ha) | "
        "Avg Irrigation (%) | Water Stressed | Avg Revenue (₹ Cr) |"
    )
    lines.append("|---|---|---|---|---|---|---|---|")
    for r in ranked:
        lines.append(
            f"| {r['rank']} | {r['state']} | {r['top_crop']} | "
            f"{r['agri_score']} | {r['avg_yield']} | "
            f"{r['avg_irrigation_pct']} | {r['water_stressed']} | "
            f"{r['avg_farm_revenue']} |"
        )

    lines.append("\n## Risk Distribution")
    lines.append(f"- Green (low risk) states: {risk_counts['green']}")
    lines.append(f"- Orange (medium risk) states: {risk_counts['orange']}")
    lines.append(f"- Red (high risk) states: {risk_counts['red']}")
    lines.append(
        f"- States flagged water-stressed: {risk_counts['water_stressed']}"
    )

    lines.append("\n## Full State-Crop Records")
    lines.append(
        "| State | Crop | Yield (kg/ha) | Area (ha) | Production (t) | "
        "Irrigation (%) | Rainfall (mm) | Revenue (₹ Cr) | Water Stressed |"
    )
    lines.append("|---|---|---|---|---|---|---|---|---|")
    for r in df.itertuples():
        lines.append(
            f"| {r.state} | {r.crop} | {r.yield_kg_ha} | "
            f"{getattr(r, 'area_ha', '-')} | {r.total_production_tonnes:,.0f} | "
            f"{r.irrigation_pct} | {getattr(r, 'rainfall_mm', '-')} | "
            f"{r.farm_revenue_cr:,.2f} | "
            f"{'yes' if r.Water_Stressed else 'no'} |"
        )

    return "\n".join(lines)


# --------------------------------------------------------------------------- #
# Groq call                                                                    #
# --------------------------------------------------------------------------- #
SYSTEM_PROMPT_TEMPLATE = """You are **Krishi Sahayak**, the assistant for the Krishi Drishti agricultural analytics platform.

Your job: answer the user's questions about Indian crop production, yields, irrigation, revenue, state rankings, and water-stress risk using ONLY the data context provided below. The data was produced by the platform's ETL + ranking + dashboard + risk-map pipeline.

Rules:
1. Ground every factual answer in the context. Quote exact numbers from the tables.
2. If the user asks something the context doesn't cover (e.g. a state or crop not in the data, future predictions, pricing, weather forecasts), say so plainly — do not invent.
3. Keep answers concise and direct. Use short bullet lists for comparisons.
4. Currency is Indian Rupees in crore (₹ Cr). Yields are kg/ha. Production is tonnes.
5. When the user asks "which state is best for X" or similar, use the State Ranking and the Top Producing States tables.
6. Do not mention that you are an AI or that you are using a context document — just answer.

=== DATA CONTEXT ===
{context}
=== END DATA CONTEXT ==="""


class GroqConfigError(RuntimeError):
    pass


class GroqAPIError(RuntimeError):
    pass


def chat_with_groq(
    question: str,
    context_summary: str,
    history: Optional[List[dict]] = None,
) -> str:
    """Send the question to Groq and return the assistant's text reply.

    `history` is a list of {"role": "user"|"assistant", "content": str}
    representing prior turns in the conversation (excluding the current
    question, which is passed separately).
    """
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        raise GroqConfigError(
            "GROQ_API_KEY is not set. Add it to backend/.env or export it "
            "in your shell."
        )

    messages: list[dict] = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT_TEMPLATE.format(context=context_summary),
        }
    ]
    if history:
        # Keep only the last 8 turns to stay within token budget.
        messages.extend(history[-8:])
    messages.append({"role": "user", "content": question})

    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "temperature": 0.2,
        "max_tokens": 800,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    logger.debug(f"Sending request to Groq with model: {GROQ_MODEL}")

    try:
        with httpx.Client(timeout=GROQ_TIMEOUT) as client:
            resp = client.post(GROQ_BASE_URL, json=payload, headers=headers)
    except httpx.RequestError as exc:
        logger.error(f"Network error reaching Groq: {exc}")
        raise GroqAPIError(f"Failed to reach Groq: {exc}") from exc
    except httpx.TimeoutException as exc:
        logger.error(f"Timeout reaching Groq after {GROQ_TIMEOUT}s: {exc}")
        raise GroqAPIError(f"Groq request timed out after {GROQ_TIMEOUT}s") from exc

    if resp.status_code >= 400:
        error_text = resp.text[:500]
        logger.error(
            f"Groq API error {resp.status_code}: {error_text}"
        )
        raise GroqAPIError(
            f"Groq returned {resp.status_code}: {error_text}"
        )

    try:
        data = resp.json()
    except ValueError as exc:
        logger.error(f"Failed to parse Groq response: {resp.text[:200]}")
        raise GroqAPIError(f"Invalid JSON from Groq: {exc}") from exc

    try:
        return data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        logger.error(f"Unexpected Groq response shape: {data}")
        raise GroqAPIError(f"Unexpected Groq response shape: {data}") from exc
