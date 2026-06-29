"""
Task 2: State Ranking - Heap Sort + Binary Search (DSA)

Aggregates the cleaned crop census data per state, computes a composite
agri_score, ranks states with a hand-rolled max-heap sort, and exposes a
binary search to look up an individual state's rank.
"""
from __future__ import annotations

from typing import Optional

import numpy as np
import pandas as pd

YIELD_WEIGHT = 0.4
IRRIGATION_WEIGHT = 0.3
REVENUE_WEIGHT = 0.2
LOSS_WEIGHT = 0.1


def _normalise(series: pd.Series) -> np.ndarray:
    """Min-max normalises a series to the 0-1 range using NumPy."""
    values = series.to_numpy(dtype=float)
    value_range = values.max() - values.min()
    if value_range == 0:
        return np.zeros_like(values)
    return (values - values.min()) / value_range


def build_state_aggregates(df: pd.DataFrame) -> pd.DataFrame:
    """Subtask 1: per-state averages used to compute the agri_score."""
    grouped = df.groupby("state").agg(
        avg_yield=("yield_kg_ha", "mean"),
        avg_irrigation_pct=("irrigation_pct", "mean"),
        avg_farm_revenue=("farm_revenue_cr", "mean"),
        avg_loss_pct=("loss_pct", "mean"),
        top_crop=("crop", lambda s: s.value_counts().idxmax()),
        water_stressed=("Water_Stressed", "any"),
    ).reset_index()
    return grouped


def compute_agri_score(aggregates: pd.DataFrame) -> pd.DataFrame:
    """Subtask 2: composite agri_score, normalised 0-1 with NumPy."""
    aggregates = aggregates.copy()
    aggregates["agri_score"] = (
        YIELD_WEIGHT * _normalise(aggregates["avg_yield"])
        + IRRIGATION_WEIGHT * _normalise(aggregates["avg_irrigation_pct"])
        + REVENUE_WEIGHT * _normalise(aggregates["avg_farm_revenue"])
        - LOSS_WEIGHT * _normalise(aggregates["avg_loss_pct"])
    )
    return aggregates


def _sift_down(records: list[dict], start: int, end: int) -> None:
    """Restores the max-heap property below index `start`."""
    root = start
    while True:
        child = 2 * root + 1
        if child > end:
            break
        if child + 1 <= end and records[child]["agri_score"] < records[child + 1]["agri_score"]:
            child += 1
        if records[root]["agri_score"] < records[child]["agri_score"]:
            records[root], records[child] = records[child], records[root]
            root = child
        else:
            break


def heap_sort_by_score(records: list[dict]) -> list[dict]:
    """Subtask 3: max-heap sort ranking records by agri_score descending."""
    records = records.copy()
    count = len(records)

    for start in range(count // 2 - 1, -1, -1):
        _sift_down(records, start, count - 1)

    for end in range(count - 1, 0, -1):
        records[0], records[end] = records[end], records[0]
        _sift_down(records, 0, end - 1)

    # _sift_down builds ascending order via repeated max-extraction into the
    # tail; reverse once to present highest agri_score first.
    return list(reversed(records))


def binary_search_state(ranked_records: list[dict], state_name: str) -> Optional[int]:
    """Subtask 4: binary search for a state's 1-indexed rank.

    The ranked list is sorted by agri_score descending, so the search key
    is each record's rank position rather than the score itself.
    """
    target = state_name.strip().lower()
    low, high = 0, len(ranked_records) - 1

    # Build a name->index lookup sorted alphabetically to binary search on,
    # then map back to the rank produced by heap_sort_by_score.
    alphabetical = sorted(
        range(len(ranked_records)),
        key=lambda i: ranked_records[i]["state"].lower(),
    )
    names_sorted = [ranked_records[i]["state"].lower() for i in alphabetical]

    low, high = 0, len(names_sorted) - 1
    while low <= high:
        mid = (low + high) // 2
        if names_sorted[mid] == target:
            original_index = alphabetical[mid]
            return original_index + 1  # rank is 1-indexed
        if names_sorted[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return None


def rank_states(df: pd.DataFrame) -> list[dict]:
    """Subtask 5: full ranking pipeline, ready for the API / frontend."""
    aggregates = build_state_aggregates(df)
    scored = compute_agri_score(aggregates)
    records = scored.to_dict(orient="records")
    ranked = heap_sort_by_score(records)
    for position, record in enumerate(ranked, start=1):
        record["rank"] = position
    return ranked
