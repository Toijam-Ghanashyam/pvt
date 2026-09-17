"""Adapter bridging Core spatial conflict records with the Boundary Consensus Swarm.

Retrieves authentic multi-source stakeholder geometries directly from PostgreSQL/PostGIS:
  - Drone: ai_buildings (matched by building_id)
  - Revenue: cadastral_plots (matched by plot_id)
  - Municipal: municipal_layers (matched via spatial intersection with conflict geometry)

Preserves schemas, does not fabricate missing records, and handles connection failures gracefully.
"""

import os
import logging
from typing import Any, Dict, List, Mapping, Optional
from contextlib import contextmanager

from shapely.geometry.base import BaseGeometry
from shapely.geometry import Polygon, MultiPolygon, LineString, Point
from shapely import wkb, wkt

from boundary_consensus.schemas import (
    Coordinates,
    ProposedBoundary,
    DisputeContext,
    ResolutionReport,
)
from boundary_consensus.consensus.orchestrator import ConsensusOrchestrator

logger = logging.getLogger("boundary_consensus.adapter")


# -----------------------------------------------------------------------------
# Database Connection Management
# -----------------------------------------------------------------------------
@contextmanager
def get_db_connection():
    """Yield a database connection using psycopg2.

    Reads database configuration using the Core Application's exact environment variables:
    DB_USER, DB_PASS, DB_HOST, DB_PORT, and DB_NAME.
    """
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    dbname = os.getenv("DB_NAME", "postgres")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASS", "")

    conn = None
    try:
        import psycopg2
        conn = psycopg2.connect(
            host=host,
            port=port,
            dbname=dbname,
            user=user,
            password=password,
            connect_timeout=5,
        )
        yield conn
    except Exception as exc:
        logger.warning(f"Database connection could not be established: {exc}")
        yield None
    finally:
        if conn is not None:
            try:
                conn.close()
            except Exception:
                pass


# -----------------------------------------------------------------------------
# Geometry Helper Utilities
# -----------------------------------------------------------------------------
def parse_db_geometry(raw_geom: Any) -> Optional[BaseGeometry]:
    """Safely convert raw database geometry to BaseGeometry.

    Handles:
      - Shapely BaseGeometry
      - memoryview (frequently returned by psycopg2 for bytea/ST_AsBinary)
      - bytes / bytearray (standard WKB binary)
      - WKB hex string
      - WKT string
    """
    if raw_geom is None:
        return None

    if isinstance(raw_geom, BaseGeometry):
        return raw_geom

    # Handle memoryview buffer from psycopg2 binary cursors
    if isinstance(raw_geom, memoryview):
        try:
            return wkb.loads(raw_geom.tobytes())
        except Exception as exc:
            logger.debug(f"Failed to parse memoryview via wkb.loads: {exc}")
            return None

    # Handle standard bytes / bytearray
    if isinstance(raw_geom, (bytes, bytearray)):
        try:
            return wkb.loads(bytes(raw_geom))
        except Exception as exc:
            logger.debug(f"Failed to parse bytes via wkb.loads: {exc}")
            return None

    # Handle text representations (WKB Hex or WKT)
    if isinstance(raw_geom, str):
        stripped = raw_geom.strip()
        if not stripped:
            return None

        # Check if hex-encoded WKB
        if all(c in "0123456789abcdefABCDEF" for c in stripped) and len(stripped) % 2 == 0:
            try:
                return wkb.loads(bytes.fromhex(stripped))
            except Exception:
                pass

        # Try parsing as standard WKT
        try:
            return wkt.loads(stripped)
        except Exception as exc:
            logger.debug(f"Failed to parse string geometry via wkt.loads: {exc}")
            return None

    return None


def geometry_to_proposed_boundary(
    geom: Optional[BaseGeometry], uncertainty_buffer_meters: float = 1.0
) -> ProposedBoundary:
    """Convert a Shapely geometry into the swarm's ProposedBoundary model.

    Safely extracts vertex sequences from Polygon, MultiPolygon, LineString,
    and Point geometries. Presumes EPSG:4326 (x=lng, y=lat) coordinate
    ordering. Returns an empty ProposedBoundary if geom is None or empty.

    Args:
        geom: Shapely geometry object representing the boundary.
        uncertainty_buffer_meters: Buffer uncertainty margin in meters.

    Returns:
        ProposedBoundary: Validated Pydantic boundary model.
    """
    if geom is None or geom.is_empty:
        return ProposedBoundary(
            coordinates=[],
            uncertainty_buffer_meters=float(uncertainty_buffer_meters),
        )

    coords_list: List[Coordinates] = []
    raw_coords: List[tuple] = []

    if isinstance(geom, Polygon):
        raw_coords = list(geom.exterior.coords)
    elif isinstance(geom, MultiPolygon):
        largest_poly = max(geom.geoms, key=lambda p: p.area, default=None)
        if largest_poly:
            raw_coords = list(largest_poly.exterior.coords)
    elif isinstance(geom, LineString):
        raw_coords = list(geom.coords)
    elif isinstance(geom, Point):
        raw_coords = [(geom.x, geom.y)]
    elif hasattr(geom, "geoms"):
        for part in getattr(geom, "geoms", []):
            if isinstance(part, (Polygon, LineString, Point)):
                sub_boundary = geometry_to_proposed_boundary(
                    part, uncertainty_buffer_meters
                )
                coords_list.extend(sub_boundary.coordinates)
        return ProposedBoundary(
            coordinates=coords_list,
            uncertainty_buffer_meters=float(uncertainty_buffer_meters),
        )

    # Convert (x, y) -> Coordinates(lat=y, lng=x)
    for pt in raw_coords:
        if len(pt) >= 2:
            coords_list.append(Coordinates(lat=float(pt[1]), lng=float(pt[0])))

    return ProposedBoundary(
        coordinates=coords_list,
        uncertainty_buffer_meters=float(uncertainty_buffer_meters),
    )


# -----------------------------------------------------------------------------
# Database Source Evidence Retrieval
# -----------------------------------------------------------------------------
def fetch_building_evidence(conn: Any, building_id: Any) -> tuple[Optional[BaseGeometry], Optional[float]]:
    """Query ai_buildings for real building geometry and confidence score."""
    if conn is None or building_id is None or str(building_id).strip().upper() in ("N/A", "NONE", ""):
        return None, None

    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT ST_AsBinary(geom), confidence_score
                FROM ai_buildings
                WHERE building_id = %s
                LIMIT 1;
                """,
                (building_id,),
            )
            row = cur.fetchone()
            if row:
                geom = parse_db_geometry(row[0])
                conf = float(row[1]) if row[1] is not None else None
                return geom, conf
    except Exception as exc:
        logger.warning(f"Error querying ai_buildings for building_id {building_id}: {exc}")
    return None, None


def fetch_cadastral_evidence(conn: Any, plot_id: Any) -> Optional[BaseGeometry]:
    """Query cadastral_plots for real plot boundary geometry."""
    if conn is None or plot_id is None or str(plot_id).strip().upper() in ("N/A", "NONE", ""):
        return None

    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT ST_AsBinary(geom)
                FROM cadastral_plots
                WHERE plot_id = %s
                LIMIT 1;
                """,
                (plot_id,),
            )
            row = cur.fetchone()
            if row:
                return parse_db_geometry(row[0])
    except Exception as exc:
        logger.warning(f"Error querying cadastral_plots for plot_id {plot_id}: {exc}")
    return None


def fetch_municipal_evidence(conn: Any, conflict_geom: Optional[BaseGeometry]) -> Optional[BaseGeometry]:
    """Query municipal_layers for the zone geometry spatially intersecting the conflict."""
    if conn is None or conflict_geom is None or conflict_geom.is_empty:
        return None

    try:
        wkt_val = conflict_geom.wkt
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT ST_AsBinary(geom)
                FROM municipal_layers
                WHERE ST_Intersects(geom, ST_GeomFromText(%s, 4326))
                LIMIT 1;
                """,
                (wkt_val,),
            )
            row = cur.fetchone()
            if row:
                return parse_db_geometry(row[0])
    except Exception as exc:
        logger.warning(f"Error querying municipal_layers by intersection: {exc}")
    return None


# -----------------------------------------------------------------------------
# Public Core Adapter Functions
# -----------------------------------------------------------------------------
def conflict_to_dispute_context(conflict: Mapping[str, Any]) -> DisputeContext:
    """Convert a spatial_conflicts record into a multi-source DisputeContext.

    Retrieves real stakeholder source evidence from PostgreSQL:
      - 'Drone': ai_buildings.geom (matched by building_id)
      - 'Revenue': cadastral_plots.geom (matched by plot_id)
      - 'Municipal': municipal_layers.geom (intersecting conflict_geom)

    If a stakeholder layer or record is unavailable, an empty ProposedBoundary
    is assigned rather than fabricating synthetic geometries or copying the conflict.

    Args:
        conflict: Mapping containing spatial_conflicts fields:
            'building_id', 'plot_id', 'confidence_score', 'conflict_type', 'geom'.

    Returns:
        DisputeContext: Input schema for ConsensusOrchestrator.
    """
    plot_id = conflict.get("plot_id")
    building_id = conflict.get("building_id")
    conflict_type = conflict.get("conflict_type")
    core_confidence = conflict.get("confidence_score")
    raw_conflict_geom = conflict.get("geom") if "geom" in conflict else conflict.get("geometry")
    conflict_geom = parse_db_geometry(raw_conflict_geom)

    # Sanitize identifier labels
    clean_plot_id = None if plot_id is None or str(plot_id).strip().upper() in ("N/A", "NONE", "") else plot_id
    clean_bldg_id = None if building_id is None or str(building_id).strip().upper() in ("N/A", "NONE", "") else building_id

    # Construct stable dispute identifier
    if clean_plot_id is not None and clean_bldg_id is not None:
        dispute_id = f"DISPUTE-P{clean_plot_id}-B{clean_bldg_id}"
    elif clean_plot_id is not None:
        dispute_id = f"DISPUTE-PLOT-{clean_plot_id}"
    elif clean_bldg_id is not None:
        dispute_id = f"DISPUTE-BLDG-{clean_bldg_id}"
    else:
        dispute_id = f"DISPUTE-REC-{id(conflict)}"

    region_id = str(clean_plot_id) if clean_plot_id is not None else "CORE_CADASTRE"

    # Query real stakeholder source evidence from database tables
    bldg_geom = None
    bldg_conf = None
    plot_geom = None
    muni_geom = None

    with get_db_connection() as conn:
        if conn is not None:
            bldg_geom, bldg_conf = fetch_building_evidence(conn, clean_bldg_id)
            plot_geom = fetch_cadastral_evidence(conn, clean_plot_id)
            muni_geom = fetch_municipal_evidence(conn, conflict_geom)

    # Map authentic boundaries; empty if no authentic evidence exists
    drone_boundary = (
        geometry_to_proposed_boundary(bldg_geom, uncertainty_buffer_meters=0.5)
        if bldg_geom is not None and not bldg_geom.is_empty
        else ProposedBoundary(coordinates=[], uncertainty_buffer_meters=0.5)
    )

    revenue_boundary = (
        geometry_to_proposed_boundary(plot_geom, uncertainty_buffer_meters=1.0)
        if plot_geom is not None and not plot_geom.is_empty
        else ProposedBoundary(coordinates=[], uncertainty_buffer_meters=1.0)
    )

    municipal_boundary = (
        geometry_to_proposed_boundary(muni_geom, uncertainty_buffer_meters=2.0)
        if muni_geom is not None and not muni_geom.is_empty
        else ProposedBoundary(coordinates=[], uncertainty_buffer_meters=2.0)
    )

    initial_boundaries: Dict[str, ProposedBoundary] = {
        "Drone": drone_boundary,
        "Revenue": revenue_boundary,
        "Municipal": municipal_boundary,
    }

    # Record genuine audit trail and metadata
    metadata = {
        "building_id": clean_bldg_id,
        "plot_id": clean_plot_id,
        "conflict_type": conflict_type,
        "core_confidence_score": float(core_confidence) if core_confidence is not None else None,
        "drone_source_used": "ai_buildings" if (bldg_geom is not None and not bldg_geom.is_empty) else "none",
        "drone_ai_confidence": bldg_conf,
        "revenue_source_used": "cadastral_plots" if (plot_geom is not None and not plot_geom.is_empty) else "none",
        "municipal_source_used": "municipal_layers" if (muni_geom is not None and not muni_geom.is_empty) else "none",
        "municipal_evidence_found": muni_geom is not None and not muni_geom.is_empty,
    }

    return DisputeContext(
        dispute_id=dispute_id,
        region_id=region_id,
        initial_claimed_boundaries=initial_boundaries,
        metadata=metadata,
    )


def resolve_conflict(conflict: Mapping[str, Any]) -> ResolutionReport:
    """Orchestrate consensus resolution on a Core spatial conflict record.

    Converts the record into a DisputeContext containing genuine stakeholder
    evidence, initializes ConsensusOrchestrator, and executes the resolution cycle.

    Args:
        conflict: Mapping representing a spatial_conflicts record.

    Returns:
        ResolutionReport: Complete consensus report including winning boundary,
            consensus score, payoffs, and audit trail.
    """
    context = conflict_to_dispute_context(conflict)
    orchestrator = ConsensusOrchestrator()
    return orchestrator.run_resolution_cycle(context)