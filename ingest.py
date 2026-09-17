"""
Ingest cadastral plot shapefiles into PostGIS.

Reads all .shp files from incoming_data/, validates/reprojects geometries,
and loads them into the cadastral_plots table.

Environment:
    DATABASE_URL  PostgreSQL connection string
                  (default: postgresql://postgres:postgres@localhost:5432/urban_land)

Usage:
    python ingest.py
"""

from __future__ import annotations

import logging
import os
import sys
from pathlib import Path

import geopandas as gpd
from shapely.geometry import GeometryCollection, MultiPolygon, Polygon
from shapely.validation import make_valid
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

INCOMING_DIR = Path(__file__).resolve().parent / "incoming_data"
TARGET_CRS = "EPSG:4326"
TABLE_NAME = "cadastral_plots"

PLOT_ID_FIELDS = (
    "plot_id",
    "PLOT_ID",
    "plotid",
    "PLOTID",
    "parcel_id",
    "PARCEL_ID",
    "parcelid",
    "id",
    "ID",
    "fid",
    "FID",
)
OWNER_NAME_FIELDS = (
    "owner_name",
    "OWNER_NAME",
    "owner",
    "OWNER",
    "owner_nm",
    "OWNER_NM",
    "name",
    "NAME",
)


def get_engine():
    DB_USER = os.environ.get('DB_USER', 'postgres')
    DB_PASS = os.environ.get('DB_PASS', 'Luwang2006@')
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_PORT = os.environ.get('DB_PORT', '5432')
    DB_NAME = os.environ.get('DB_NAME', 'postgres')
    db_url = URL.create(
        "postgresql",
        username=DB_USER,
        password=DB_PASS,
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
    )
    return create_engine(db_url)


def find_shapefiles(directory: Path) -> list[Path]:
    if not directory.exists():
        logger.error("Incoming directory does not exist: %s", directory)
        return []
    return sorted(directory.glob("**/*.shp"))


def resolve_column(columns: list[str], candidates: tuple[str, ...]) -> str | None:
    column_lookup = {col.lower(): col for col in columns}
    for candidate in candidates:
        match = column_lookup.get(candidate.lower())
        if match is not None:
            return match
    return None


def fix_geometry(geometry):
    if geometry is None or geometry.is_empty:
        return None

    repaired = make_valid(geometry)

    if isinstance(repaired, Polygon):
        return repaired
    if isinstance(repaired, MultiPolygon):
        return max(repaired.geoms, key=lambda p: p.area)
    if isinstance(repaired, GeometryCollection):
        polygons = [part for part in repaired.geoms if isinstance(part, Polygon)]
        if polygons:
            return max(polygons, key=lambda p: p.area)
        return None

    return None


def prepare_gdf(gdf: gpd.GeoDataFrame, source_path: Path) -> gpd.GeoDataFrame:
    if gdf.crs is None:
        raise ValueError(
            f"{source_path.name} has no CRS defined. "
            "Assign a CRS to the shapefile before ingestion."
        )

    logger.info("Source CRS for %s: %s", source_path.name, gdf.crs.to_string())

    if gdf.crs.to_epsg() != 4326:
        logger.info("Reprojecting %s to %s", source_path.name, TARGET_CRS)
        gdf = gdf.to_crs(TARGET_CRS)
    else:
        logger.info("%s is already in %s", source_path.name, TARGET_CRS)

    gdf = gdf.copy()
    gdf["geometry"] = gdf.geometry.apply(fix_geometry)
    gdf = gdf[gdf.geometry.notna()].copy()

    plot_field = resolve_column(list(gdf.columns), PLOT_ID_FIELDS)
    owner_field = resolve_column(list(gdf.columns), OWNER_NAME_FIELDS)

    if plot_field is None:
        logger.warning(
            "No plot_id column found in %s; generating IDs from filename.",
            source_path.name,
        )
        gdf["plot_id"] = [
            f"{source_path.stem}_{index}" for index in range(len(gdf))
        ]
    else:
        gdf["plot_id"] = gdf[plot_field].astype(str)

    if owner_field is None:
        logger.warning(
            "No owner_name column found in %s; using 'UNKNOWN'.",
            source_path.name,
        )
        gdf["owner_name"] = "UNKNOWN"
    else:
        gdf["owner_name"] = gdf[owner_field].astype(str)

    gdf = gdf[["plot_id", "owner_name", "geometry"]].copy()
    gdf = gdf.drop_duplicates(subset=["plot_id"], keep="first")
    gdf = gdf.set_geometry("geometry")
    gdf = gdf.set_crs(TARGET_CRS)

    return gdf.rename_geometry("geom")


def read_and_prepare(path: Path) -> gpd.GeoDataFrame:
    logger.info("Reading %s", path)
    gdf = gpd.read_file(path)
    return prepare_gdf(gdf, path)


def upload_to_postgis(gdf: gpd.GeoDataFrame, engine) -> int:
    if gdf.empty:
        return 0

    gdf.to_postgis(
        name=TABLE_NAME,
        con=engine,
        if_exists="append",
        index=False,
    )
    return len(gdf)


def ensure_table_exists(engine) -> None:
    with engine.connect() as conn:
        result = conn.execute(
            text(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                      AND table_name = :table_name
                )
                """
            ),
            {"table_name": TABLE_NAME},
        )
        if not result.scalar():
            raise RuntimeError(
                f"Table '{TABLE_NAME}' does not exist. Run schema.sql first."
            )


def main() -> int:
    shapefiles = find_shapefiles(INCOMING_DIR)
    if not shapefiles:
        logger.error("No shapefiles found in %s", INCOMING_DIR)
        return 1

    engine = get_engine()
    ensure_table_exists(engine)

    total_rows = 0
    failed_files = 0

    for shapefile in shapefiles:
        try:
            prepared = read_and_prepare(shapefile)
            row_count = upload_to_postgis(prepared, engine)
            total_rows += row_count
            logger.info(
                "Uploaded %d row(s) from %s to %s",
                row_count,
                shapefile.name,
                TABLE_NAME,
            )
        except Exception:
            failed_files += 1
            logger.exception("Failed to ingest %s", shapefile)

    logger.info(
        "Ingestion complete: %d file(s) processed, %d row(s) loaded, %d failure(s).",
        len(shapefiles) - failed_files,
        total_rows,
        failed_files,
    )
    return 1 if failed_files else 0


if __name__ == "__main__":
    sys.exit(main())