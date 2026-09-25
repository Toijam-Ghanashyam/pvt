import os
import geopandas as gpd
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from shapely.validation import make_valid
from shapely.ops import snap

# Database connection parameters
database_url = os.environ.get("DATABASE_URL")
if database_url:
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    engine = create_engine(database_url)
else:
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
    engine = create_engine(db_url)

def safe_load_postgis(table_name: str, crs_target="EPSG:3857"):
    """Safely loads PostGIS layers and guarantees they are projected properly."""
    try:
        gdf = gpd.read_postgis(f"SELECT * FROM {table_name}", engine, geom_col='geom')
        if gdf.empty:
            return gpd.GeoDataFrame()
        if gdf.crs is None:
            gdf = gdf.set_crs("EPSG:4326")
        return gdf.to_crs(crs_target)
    except Exception:
        return gpd.GeoDataFrame()

def detect_encroachments():
    print(">>> Loading spatial datasets...")
    plots_gdf = safe_load_postgis("cadastral_plots")
    buildings_gdf = safe_load_postgis("ai_buildings")
    municipal_gdf = safe_load_postgis("municipal_layers")
    utilities_gdf = safe_load_postgis("utility_lines")

    if plots_gdf.empty and buildings_gdf.empty:
        print("No cadastral plots or buildings found in database.")
        return

    # =====================================================================
    # 1. AUTOMATED TOPOLOGY DIAGNOSTICS & SANITIZATION
    # =====================================================================
    print(">>> Running Automated Topology Diagnostics...")
    invalid_fixed = 0
    buildings_snapped = 0

    def fix_geom(geom):
        nonlocal invalid_fixed
        if geom is not None and not geom.is_valid:
            invalid_fixed += 1
            res = make_valid(geom)
            return res.geoms[0] if hasattr(res, 'geoms') else res
        return geom

    if not plots_gdf.empty:
        plots_gdf['geom'] = plots_gdf['geom'].apply(fix_geom)
    if not buildings_gdf.empty:
        buildings_gdf['geom'] = buildings_gdf['geom'].apply(fix_geom)

    # 5 meters auto-snapping tolerance in EPSG:3857 metric space
    TOLERANCE = 5.0  
    snapped_geoms = []
    
    if not plots_gdf.empty and not buildings_gdf.empty:
        for idx, b_row in buildings_gdf.iterrows():
            b_geom = b_row['geom']
            nearby_plots = plots_gdf[plots_gdf.intersects(b_geom.buffer(TOLERANCE))]
            if not nearby_plots.empty:
                p_geom = nearby_plots.iloc[0]['geom']
                snapped = snap(b_geom, p_geom, TOLERANCE)
                if not snapped.equals(b_geom):
                    buildings_snapped += 1
                snapped_geoms.append(snapped)
            else:
                snapped_geoms.append(b_geom)
        buildings_gdf['geom'] = snapped_geoms

    # Save diagnostic KPI metrics to DB
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS topology_metrics"))
        conn.execute(text("""
            CREATE TABLE topology_metrics (
                metric_name VARCHAR(100),
                metric_value INTEGER
            )
        """))
        conn.execute(text("INSERT INTO topology_metrics VALUES ('Self-Intersecting Polygons Repaired', :val)"), {"val": invalid_fixed})
        conn.execute(text("INSERT INTO topology_metrics VALUES ('Building Edges Snapped to Boundaries', :val)"), {"val": buildings_snapped})

    conflicts = []

    # =====================================================================
    # 2. CADASTRAL PLOT ENCROACHMENT DETECTION
    # =====================================================================
    if not plots_gdf.empty and not buildings_gdf.empty:
        print(">>> Analyzing Cadastral Boundary Encroachments...")
        overlaps = gpd.sjoin(buildings_gdf, plots_gdf, how='inner', predicate='intersects')
        
        for idx, row in overlaps.iterrows():
            b_geom = row['geom']
            p_geom = plots_gdf.loc[row['index_right'], 'geom']
            
            inter = b_geom.intersection(p_geom)
            union = b_geom.union(p_geom)
            iou = inter.area / union.area if union.area > 0 else 0
            
            # Check if building spills beyond parcel by > 1m safety buffer
            encroachment_part = b_geom.difference(p_geom.buffer(1.0))
            if not encroachment_part.is_empty and encroachment_part.area > 0.01:
                conflicts.append({
                    'building_id': str(row.get('building_id', 'Unknown')),
                    'plot_id': str(row.get('plot_id', 'Unknown')),
                    'iou': round(float(iou), 4),
                    'confidence_score': round((float(row.get('confidence_score', 0.90)) * 100) if float(row.get('confidence_score', 0.90)) <= 1.0 else float(row.get('confidence_score', 0.90)), 2),
                    'conflict_type': 'Cadastral Encroachment',
                    'geom': b_geom
                })

    # =====================================================================
    # 3. UTILITY NETWORK RIGHT-OF-WAY (RoW) BUFFER VIOLATIONS
    # =====================================================================
    if not utilities_gdf.empty and not buildings_gdf.empty:
        print(">>> Analyzing Utility Corridor & Right-of-Way Violations...")
        # Add 10-meter strict right-of-way safety buffer to utility lines
        utilities_buffered = utilities_gdf.copy()
        utilities_buffered['geom'] = utilities_buffered['geom'].buffer(10.0)

        util_overlaps = gpd.sjoin(buildings_gdf, utilities_buffered, how='inner', predicate='intersects')
        for idx, row in util_overlaps.iterrows():
            b_geom = row['geom']
            u_name = str(row.get('utility_type', row.get('name', 'Restricted Utility Corridor')))
            conflicts.append({
                'building_id': str(row.get('building_id', 'Unknown')),
                'plot_id': 'N/A',
                'iou': 0.0,
                'confidence_score': round((float(row.get('confidence_score', 0.95)) * 100) if float(row.get('confidence_score', 0.95)) <= 1.0 else float(row.get('confidence_score', 0.95)), 2),
                'conflict_type': f'Utility RoW Violation ({u_name})',
                'geom': b_geom
            })

    # =====================================================================
    # 4. MUNICIPAL ZONING & ECO-SENSITIVE VIOLATIONS
    # =====================================================================
    if not municipal_gdf.empty and not buildings_gdf.empty:
        print(">>> Analyzing Municipal Zoning Restrictions...")
        muni_overlaps = gpd.sjoin(buildings_gdf, municipal_gdf, how='inner', predicate='intersects')
        for idx, row in muni_overlaps.iterrows():
            b_geom = row['geom']
            zone_name = str(row.get('zone_name', row.get('zone_type', row.get('name', 'Restricted Zone'))))
            
            # Determine if intersection is in an unauthorized construction zone
            is_restricted = any(k in zone_name.lower() for k in ['green', 'eco', 'flood', 'forest', 'buffer', 'water', 'restricted', 'non-buildable'])
            
            if is_restricted or 'zone_name' not in row:
                conflicts.append({
                    'building_id': str(row.get('building_id', 'Unknown')),
                    'plot_id': 'N/A',
                    'iou': 0.0,
                    'confidence_score': round((float(row.get('confidence_score', 0.95)) * 100) if float(row.get('confidence_score', 0.95)) <= 1.0 else float(row.get('confidence_score', 0.95)), 2),
                    'conflict_type': f'Zoning Violation ({zone_name})',
                    'geom': b_geom
                })

    # =====================================================================
    # 5. PERSIST TO POSTGIS IN EPSG:4326 (GEOGRAPHIC)
    # =====================================================================
    if conflicts:
        conflicts_df = pd.DataFrame(conflicts)
        # Cast back to EPSG:4326 so Folium and web components can render correctly
        conflicts_gdf = gpd.GeoDataFrame(conflicts_df, geometry='geom', crs="EPSG:3857").to_crs(epsg=4326)
        print(f"Recorded {len(conflicts_gdf)} total spatial conflicts. Saving to PostGIS...")
        # ALWAYS use 'replace' here to prevent SRID mismatch database errors
        conflicts_gdf.to_postgis('spatial_conflicts', engine, if_exists='replace', index=False)
    else:
        with engine.begin() as conn:
            conn.execute(text("DROP TABLE IF EXISTS spatial_conflicts"))
            conn.execute(text("""
                CREATE TABLE spatial_conflicts (
                    building_id VARCHAR,
                    plot_id VARCHAR,
                    iou FLOAT,
                    confidence_score FLOAT,
                    conflict_type VARCHAR,
                    geom geometry(Geometry, 4326)
                )
            """))
        print("No conflicts found. Spatial conflicts table safely reset.")

if __name__ == '__main__':
    detect_encroachments()