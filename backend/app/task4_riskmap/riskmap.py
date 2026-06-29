"""
Task 4: Agricultural Risk Map (Folium + JSON feed)

Builds the official agri_risk_map.html for the evaluator using Folium,
and also shapes the same per-state data as JSON so the React frontend
can render its own interactive Leaflet map with colour-coded markers.
"""
from __future__ import annotations

import os

import folium
import pandas as pd

GREEN_THRESHOLD = 0.6
ORANGE_THRESHOLD = 0.4
MARKER_RADIUS_SCALE = 20
MAP_CENTER = [22.0, 78.0]
MAP_ZOOM = 5

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "outputs")
OUTPUT_HTML_PATH = os.path.join(OUTPUT_DIR, "agri_risk_map.html")

STATE_COORDS = {
    "Punjab": [31.1471, 75.3412], "Haryana": [29.0588, 76.0856],
    "Up": [26.8467, 80.9462], "Bihar": [25.0961, 85.3131],
    "Mp": [23.4734, 77.9470], "Maharashtra": [19.6633, 75.3003],
    "Gujarat": [22.2587, 71.1924], "Rajasthan": [27.0238, 73.3119],
    "Karnataka": [15.3173, 75.7139], "Ap": [15.9129, 79.7400],
    "Tamil Nadu": [11.1271, 78.6569], "Odisha": [20.9517, 85.0985],
    "Wb": [22.9868, 87.8550], "Assam": [26.2006, 92.9376],
    "Kerala": [10.8505, 76.2711],
}


def _score_colour(agri_score: float) -> str:
    """Subtask 2: green/orange/red banding by agri_score."""
    if agri_score > GREEN_THRESHOLD:
        return "green"
    if agri_score >= ORANGE_THRESHOLD:
        return "orange"
    return "red"


def build_riskmap_payload(ranked_states: list[dict]) -> list[dict]:
    """Shapes ranked state records into map-ready markers for the frontend."""
    markers = []
    for record in ranked_states:
        coords = STATE_COORDS.get(record["state"])
        if coords is None:
            continue
        markers.append({
            "state": record["state"],
            "lat": coords[0],
            "lng": coords[1],
            "agri_score": round(record["agri_score"], 4),
            "rank": record["rank"],
            "top_crop": record["top_crop"],
            "water_stressed": bool(record["water_stressed"]),
            "farm_revenue_cr": round(record["avg_farm_revenue"], 2),
            "radius": round(record["agri_score"] * MARKER_RADIUS_SCALE, 2),
            "colour": _score_colour(record["agri_score"]),
        })
    return markers


def render_riskmap_html(ranked_states: list[dict]) -> str:
    """Subtasks 1, 3, 4, 5: builds the official Folium HTML risk map."""
    fmap = folium.Map(location=MAP_CENTER, zoom_start=MAP_ZOOM)
    water_stressed_layer = folium.FeatureGroup(name="Water Stressed States")

    markers = build_riskmap_payload(ranked_states)
    for marker in markers:
        popup_html = (
            f"<b>State:</b> {marker['state']}<br>"
            f"<b>Agri Score:</b> {marker['agri_score']}<br>"
            f"<b>Top Crop:</b> {marker['top_crop']}<br>"
            f"<b>Water Stressed:</b> {'Yes' if marker['water_stressed'] else 'No'}<br>"
            f"<b>Farm Revenue:</b> \u20b9{marker['farm_revenue_cr']} Cr"
        )
        circle = folium.CircleMarker(
            location=[marker["lat"], marker["lng"]],
            radius=marker["radius"],
            color=marker["colour"],
            fill=True,
            fill_color=marker["colour"],
            fill_opacity=0.7,
            popup=folium.Popup(popup_html, max_width=250),
        )
        circle.add_to(fmap)
        if marker["water_stressed"]:
            circle_clone = folium.CircleMarker(
                location=[marker["lat"], marker["lng"]],
                radius=marker["radius"],
                color="blue",
                fill=True,
                fill_color="blue",
                fill_opacity=0.4,
                popup=folium.Popup(popup_html, max_width=250),
            )
            circle_clone.add_to(water_stressed_layer)

    water_stressed_layer.add_to(fmap)
    folium.LayerControl().add_to(fmap)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    fmap.save(OUTPUT_HTML_PATH)
    return OUTPUT_HTML_PATH
