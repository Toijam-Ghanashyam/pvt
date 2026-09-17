from pydantic import BaseModel, Field
from typing import List, Optional

class Location(BaseModel):
    lat: float
    lng: float

class Source(BaseModel):
    name: str
    centroid: Location

class ConflictPolygonMetrics(BaseModel):
    area_sqm: float = Field(..., ge=0)
    perimeter_m: float = Field(..., ge=0)

class Conflict(BaseModel):
    id: str
    type: str
    location_centroid: Location
    source_a: Source
    source_b: Source
    conflict_polygon_metrics: ConflictPolygonMetrics

class ClusterMetrics(BaseModel):
    average_shift_m: float
    shift_variance_m: float
    average_sliver_index: float
    conflict_count: int

class Cluster(BaseModel):
    cluster_id: str
    root_cause_hypothesis: str
    confidence: float
    description: str
    conflict_ids: List[str]
    cluster_metrics: ClusterMetrics
    primary_sources: List[str]

class ClusteringRequest(BaseModel):
    conflicts: List[Conflict]

class ClusteringResponse(BaseModel):
    clusters: List[Cluster]
