from .conference_schemas import Conference,ConferenceRanking,PublicationConference
from .revue_schemas import Revue,RevueRanking,PublicationRevue
from Chercheurs.schemas import Chercheur
from sqlmodel import SQLModel
from typing import Optional
# Utility functions:

def safe_value(value: Optional[int]) -> int:
    """Return 0 if value is None."""
    return value or 0


def safe_division(numerator: int, denominator: int) -> float:
    """Avoid division by zero."""
    return round(numerator / denominator, 2) if denominator > 0 else 0.0


def normalize_distribution(rows: list[tuple[Optional[str], int]]) -> dict[str, int]:
    """
    Convert SQL result rows to dict and handle None values.
    Example: [(‘Q1’, 10), (None, 2)] → {‘Q1’: 10, ‘Unknown’: 2}
    """
    distribution = {}
    for rank, count in rows:
        key = rank if rank else "Unknown"
        distribution[key] = safe_value(count)
    if not distribution:
        distribution = {"Unknown": 0}
    return distribution












# Statistics classes:
class RankingStats(SQLModel):
    scimago_distribution: dict[str, int]
    dgrsdt_distribution: dict[str, int]
    core_distribution: dict[str, int]

class PublicationStats(SQLModel):
    total_publications: int
    publications_by_type: dict[str, int]
    open_access: dict[str, float | int]
    rankings: RankingStats

class ResearcherStats(SQLModel):
    total: int
    with_lab: int 
    without_lab: int

class GlobalStatistics(SQLModel):
    overview: PublicationStats
    researchers: ResearcherStats



class LabStatistics(SQLModel):
    overview : PublicationStats
    total: int