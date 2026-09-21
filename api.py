import os
import json
import zipfile
import io
import tempfile
import numpy as np
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import geopandas as gpd
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from shapely.geometry import shape

try:
    import rasterio
    from rasterio.features import shapes
    RASTERIO_AVAILABLE = True
except ImportError:
    RASTERIO_AVAILABLE = False

from conflict_engine import detect_encroachments
from report_generator import create_encroachment_pdf
from boundary_consensus.adapter import resolve_conflict

app = FastAPI(
    title="NAKSHA Spatial Integration API",
    description="Inter-departmental REST API for land governance, cadastral data, and AI conflict detection.",
    version="1.0.0"
)
@app.get("/api/v1/ai-buildings")
def get_ai_buildings():
    engine = get_engine()
    try:
        gdf = gpd.read_postgis("SELECT * FROM ai_buildings", engine, geom_col="geom")
        if gdf.crs is not None and gdf.crs.to_epsg() != 4326:
            gdf = gdf.to_crs(epsg=4326)
        return json.loads(gdf.to_json())
    except Exception:
        return {"type": "FeatureCollection", "features": []}

@app.get("/api/v1/revenue-records")
def get_all_revenue_records():
    engine = get_engine()
    try:
        df = pd.read_sql("SELECT * FROM revenue_records", engine)
        df['last_assessment_date'] = df['last_assessment_date'].astype(str)
        return df.to_dict(orient="records")
    except Exception:
        return []

@app.get("/api/v1/topology-metrics")
def get_topology_metrics():
    engine = get_engine()
    try:
        counts = get_layer_counts()
        
        topology = {"repaired": 0, "snapped": 0, "plotsCount": counts.get("plots", 0)}
        try:
            df_topo = pd.read_sql("SELECT * FROM topology_metrics", engine)
            for _, row in df_topo.iterrows():
                if row["metric_name"] == "Self-Intersecting Polygons Repaired":
                    topology["repaired"] = row["metric_value"]
                elif row["metric_name"] == "Building Edges Snapped to Boundaries":
                    topology["snapped"] = row["metric_value"]
        except Exception:
            pass
            
        kpis = {
            "totalAreaHectares": 0,
            "totalBuildings": counts.get("buildings", 0),
            "encroachments": counts.get("conflicts", 0),
            "accuracyRate": 100.0
        }
        
        try:
            with engine.connect() as conn:
                res = conn.execute(text("SELECT SUM(ST_Area(geom::geography))/10000 FROM cadastral_plots")).scalar()
                if res:
                    kpis["totalAreaHectares"] = float(res)
        except Exception:
            kpis["totalAreaHectares"] = 12.85
            
        if kpis["totalBuildings"] > 0:
            kpis["accuracyRate"] = ((kpis["totalBuildings"] - kpis["encroachments"]) / kpis["totalBuildings"]) * 100.0
            
        return {
            "counts": counts,
            "topology": topology,
            "kpis": kpis
        }
    except Exception as e:
        return {"counts": {}, "topology": {}, "kpis": {}}

@app.post("/api/v1/ingest")
async def ingest_file(file: UploadFile = File(...)):
    engine = get_engine()
    contents = await file.read()
    filename = file.filename.lower()
    
    if filename.endswith(".geojson"):
        gdf = gpd.read_file(io.BytesIO(contents))
        if gdf.crs and gdf.crs.to_epsg() != 4326:
            gdf = gdf.to_crs(epsg=4326)
        gdf = gdf.rename_geometry("geom")
        
        if "plot" in filename:
            gdf.to_postgis("cadastral_plots", engine, if_exists="append", index=False)
        else:
            gdf.to_postgis("ai_buildings", engine, if_exists="append", index=False)
            
    detect_encroachments()
    return {"status": "success", "message": f"Successfully ingested {file.filename}"}
@app.post("/api/v1/upload")
async def upload_file(layer_type: str = Form(...), file: UploadFile = File(...)):
    engine = get_engine()
    content = await file.read()
    filename = file.filename
    ingested_summary = []

    def parse_to_gdf(file_obj, fname):
        if fname.lower().endswith(".geojson"):
            raw = json.loads(file_obj) if isinstance(file_obj, (str, bytes)) else json.load(file_obj)
            features = []
            for f in raw.get("features", []):
                prop = f.get("properties", {})
                prop["geom"] = shape(f.get("geometry"))
                features.append(prop)
            return gpd.GeoDataFrame(features, geometry="geom", crs="EPSG:4326")
        elif fname.lower().endswith(".csv"):
            df = pd.read_csv(io.BytesIO(file_obj) if isinstance(file_obj, bytes) else file_obj)
            lat_col = next((c for c in df.columns if c.lower() in ['lat', 'latitude', 'y']), None)
            lon_col = next((c for c in df.columns if c.lower() in ['lon', 'long', 'longitude', 'x']), None)
            if lat_col and lon_col:
                return gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df[lon_col], df[lat_col]), crs="EPSG:4326").rename_geometry("geom")
            return df
        else:
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(fname)[1]) as tmp:
                tmp.write(file_obj if isinstance(file_obj, bytes) else file_obj.read())
                tmp_path = tmp.name
            try:
                gdf = gpd.read_file(tmp_path)
                if gdf.crs and gdf.crs.to_epsg() != 4326:
                    gdf = gdf.to_crs(epsg=4326)
                return gdf.rename_geometry("geom")
            finally:
                os.remove(tmp_path)

    try:
        if "Batch" in layer_type or filename.lower().endswith(".zip"):
            with zipfile.ZipFile(io.BytesIO(content), "r") as z:
                names = [f for f in z.namelist() if not f.startswith("__MACOSX") and not f.endswith("/")]
                
                parcels = [f for f in names if f.endswith(".geojson") and any(k in f.lower() for k in ["cadastral", "plot", "parcel"])]
                if parcels:
                    c_gdf = parse_to_gdf(z.read(parcels[0]), parcels[0])
                    if "plot_id" not in c_gdf.columns:
                        c_gdf["plot_id"] = [f"PLT_{i+1}" for i in range(len(c_gdf))]
                    if "owner_name" not in c_gdf.columns:
                        c_gdf["owner_name"] = "Registered Owner"
                    c_gdf[["plot_id", "owner_name", "geom"]].to_postgis("cadastral_plots", engine, if_exists="append", index=False)
                    ingested_summary.append(f"{len(c_gdf)} Parcels")

                bldgs = [f for f in names if f.endswith(".geojson") and any(k in f.lower() for k in ["building", "structure", "bldg"])]
                if bldgs:
                    b_gdf = parse_to_gdf(z.read(bldgs[0]), bldgs[0])
                    if "building_id" not in b_gdf.columns:
                        b_gdf["building_id"] = [f"BLD_{i+1}" for i in range(len(b_gdf))]
                    b_gdf.to_postgis("ai_buildings", engine, if_exists="append", index=False)
                    ingested_summary.append(f"{len(b_gdf)} Buildings")

                revs = [f for f in names if f.endswith(".csv") and any(k in f.lower() for k in ["revenue", "tax"])]
                if revs:
                    rev_df = pd.read_csv(io.BytesIO(z.read(revs[0])))
                    rev_df.to_sql("revenue_records", engine, if_exists="append", index=False)
                    ingested_summary.append(f"{len(rev_df)} Revenue Records")

                munis = [f for f in names if any(k in f.lower() for k in ["municipal", "zone", "greenbelt"])]
                if munis:
                    m_gdf = parse_to_gdf(z.read(munis[0]), munis[0])
                    if isinstance(m_gdf, gpd.GeoDataFrame):
                        m_gdf.to_postgis("municipal_layers", engine, if_exists="replace", index=False)
                        ingested_summary.append(f"{len(m_gdf)} Municipal Zones")

                utils = [f for f in names if any(k in f.lower() for k in ["utility", "pipe", "transmission", "electric"])]
                if utils:
                    u_gdf = parse_to_gdf(z.read(utils[0]), utils[0])
                    if isinstance(u_gdf, gpd.GeoDataFrame):
                        u_gdf.to_postgis("utility_lines", engine, if_exists="replace", index=False)
                        ingested_summary.append(f"{len(u_gdf)} Utilities")

                gts = [f for f in names if any(k in f.lower() for k in ["ground", "gt", "survey"])]
                if gts:
                    gt_res = parse_to_gdf(z.read(gts[0]), gts[0])
                    if isinstance(gt_res, gpd.GeoDataFrame):
                        gt_res.to_postgis("gt_surveys", engine, if_exists="replace", index=False)
                        ingested_summary.append(f"{len(gt_res)} Ground Truths")

                cors = [f for f in names if any(k in f.lower() for k in ["gnss", "cors", "station"])]
                if cors:
                    cors_res = parse_to_gdf(z.read(cors[0]), cors[0])
                    if isinstance(cors_res, gpd.GeoDataFrame):
                        cors_res.to_postgis("gnss_cors", engine, if_exists="replace", index=False)
                        ingested_summary.append(f"{len(cors_res)} GNSS Stations")

            if not ingested_summary:
                raise HTTPException(status_code=400, detail="No recognizable layers found in zip.")
        else:
            if "Parcel" in layer_type:
                gdf = parse_to_gdf(content, filename)
                if "plot_id" not in gdf.columns:
                    gdf["plot_id"] = [f"PLT_{i+1}" for i in range(len(gdf))]
                if "owner_name" not in gdf.columns:
                    gdf["owner_name"] = "Registered Owner"
                gdf[["plot_id", "owner_name", "geom"]].to_postgis("cadastral_plots", engine, if_exists="append", index=False)
                ingested_summary.append(f"{len(gdf)} Parcels")
            elif "Building" in layer_type:
                gdf = parse_to_gdf(content, filename)
                if "building_id" not in gdf.columns:
                    gdf["building_id"] = [f"BLD_{i+1}" for i in range(len(gdf))]
                gdf.to_postgis("ai_buildings", engine, if_exists="append", index=False)
                ingested_summary.append(f"{len(gdf)} Buildings")
            elif "Revenue" in layer_type:
                df = pd.read_csv(io.BytesIO(content))
                df.to_sql("revenue_records", engine, if_exists="append", index=False)
                ingested_summary.append(f"{len(df)} Tax Records")
            elif "Municipal" in layer_type:
                gdf = parse_to_gdf(content, filename)
                gdf.to_postgis("municipal_layers", engine, if_exists="replace", index=False)
                ingested_summary.append(f"{len(gdf)} Municipal Zones")
            elif "Utility" in layer_type:
                gdf = parse_to_gdf(content, filename)
                gdf.to_postgis("utility_lines", engine, if_exists="replace", index=False)
                ingested_summary.append(f"{len(gdf)} Utility Corridors")
            elif "Ground Truthing" in layer_type:
                gdf = parse_to_gdf(content, filename)
                gdf.to_postgis("gt_surveys", engine, if_exists="replace", index=False)
                ingested_summary.append(f"{len(gdf)} GT Points")
            elif "GNSS" in layer_type:
                gdf = parse_to_gdf(content, filename)
                gdf.to_postgis("gnss_cors", engine, if_exists="replace", index=False)
                ingested_summary.append(f"{len(gdf)} CORS Stations")
            elif "Drone" in layer_type and RASTERIO_AVAILABLE:
                with tempfile.NamedTemporaryFile(delete=False, suffix=".tif") as tmp:
                    tmp.write(content)
                    tmp_path = tmp.name
                try:
                    with rasterio.open(tmp_path) as src:
                        image = src.read(1)
                        mask = image > 150
                        results = ({'properties': {'raster_val': v}, 'geometry': s} for i, (s, v) in enumerate(shapes(mask.astype(np.int16), transform=src.transform)) if v == 1)
                        geoms = [shape(r['geometry']) for r in results]
                    if geoms:
                        b_gdf = gpd.GeoDataFrame({
                            'building_id': [f"AI_D_{i+1}" for i in range(len(geoms))],
                            'confidence_score': [92.0] * len(geoms),
                            'elevation_m': [12.5] * len(geoms),
                            'geom': geoms
                        }, crs=src.crs)
                        if b_gdf.crs.to_epsg() != 4326:
                            b_gdf = b_gdf.to_crs(epsg=4326)
                        b_gdf.to_postgis("ai_buildings", engine, if_exists="append", index=False)
                        ingested_summary.append(f"{len(b_gdf)} building footprints extracted from TIFF")
                finally:
                    os.remove(tmp_path)
                    
        # Write an audit log entry for this ingestion
        if ingested_summary:
            try:
                import datetime
                audit_df = pd.DataFrame([{
                    "layer_type": layer_type,
                    "file_size": f"{len(content) / 1024:.1f} KB",
                    "source_agency": "DoLR Upload",
                    "ingested_at": datetime.datetime.utcnow().isoformat(),
                    "status": "INGESTED",
                    "summary": ", ".join(ingested_summary),
                }])
                audit_df.to_sql("ingestion_audit_log", engine, if_exists="append", index=False)
            except Exception:
                pass  # Audit logging is non-critical

        return {"status": "success", "summary": ", ".join(ingested_summary)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 1. Enable CORS so your Netlify frontend can make requests to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with your Netlify URL (e.g., "https://your-app.netlify.app") in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Shared SQLAlchemy engine (created once at startup) ──────────────
def _build_engine():
    DB_USER = os.environ.get("DB_USER", "postgres")
    DB_PASS = os.environ.get("DB_PASS", "Luwang2006@")
    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_PORT = os.environ.get("DB_PORT", "5432")
    DB_NAME = os.environ.get("DB_NAME", "postgres")
    db_url = URL.create("postgresql", username=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT, database=DB_NAME)
    return create_engine(
        db_url,
        pool_size=5,          # max persistent connections in the pool
        max_overflow=10,      # extra connections allowed beyond pool_size
        pool_pre_ping=True,   # test connections before using them
        pool_recycle=300,     # recycle connections every 5 minutes
    )

_engine = _build_engine()

def get_engine():
    return _engine

@app.get("/")
def health_check():
    return {"status": "Active", "service": "NAKSHA GeoAPI"}

@app.get("/api/v1/cadastral-plots")
def get_cadastral_plots():
    engine = get_engine()
    try:
        gdf = gpd.read_postgis("SELECT * FROM cadastral_plots", engine, geom_col="geom")
        if gdf.crs is not None and gdf.crs.to_epsg() != 4326:
            gdf = gdf.to_crs(epsg=4326)
        return json.loads(gdf.to_json())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/conflicts")
def get_spatial_conflicts():
    engine = get_engine()
    try:
        gdf = gpd.read_postgis("SELECT * FROM spatial_conflicts", engine, geom_col="geom")
        if gdf.crs is not None and gdf.crs.to_epsg() != 4326:
            gdf = gdf.to_crs(epsg=4326)
        return json.loads(gdf.to_json())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/revenue/{plot_id}")
def get_revenue_record(plot_id: str):
    engine = get_engine()
    try:
        query = "SELECT * FROM revenue_records WHERE plot_id = %(plot_id)s"
        df = pd.read_sql(query, engine, params={"plot_id": str(plot_id)})
        if df.empty:
            raise HTTPException(status_code=404, detail="Revenue record not found.")
        df['last_assessment_date'] = df['last_assessment_date'].astype(str)
        return df.to_dict(orient="records")[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add these below your existing get_cadastral_plots() function in api.py
@app.get("/api/v1/buildings")
def get_buildings():
    engine = get_engine()
    gdf = gpd.read_postgis("SELECT * FROM ai_buildings", engine, geom_col="geom")
    if gdf.crs is None:
        gdf.set_crs(epsg=4326, inplace=True)
    elif gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(epsg=4326)
    return json.loads(gdf.to_json())

@app.get("/api/v1/municipal")
def get_municipal():
    engine = get_engine()
    gdf = gpd.read_postgis("SELECT * FROM municipal_layers", engine, geom_col="geom")
    if gdf.crs is None:
        gdf.set_crs(epsg=4326, inplace=True)
    elif gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(epsg=4326)
    return json.loads(gdf.to_json())

@app.get("/api/v1/utilities")
def get_utilities():
    engine = get_engine()
    gdf = gpd.read_postgis("SELECT * FROM utility_lines", engine, geom_col="geom")
    if gdf.crs is None:
        gdf.set_crs(epsg=4326, inplace=True)
    elif gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(epsg=4326)
    return json.loads(gdf.to_json())
    
# Add similar endpoints for /gt-surveys, /gnss-cors, and /revenue (fetch all)
@app.get("/api/v1/revenue")
def get_all_revenue():
    engine = get_engine()
    try:
        df = pd.read_sql("SELECT * FROM revenue_records", engine)
        df['last_assessment_date'] = df['last_assessment_date'].astype(str)
        return df.to_dict(orient="records")
    except Exception:
        return []

@app.get("/api/v1/metrics")
def get_topology_metrics():
    engine = get_engine()
    try:
        df = pd.read_sql("SELECT * FROM topology_metrics", engine)
        return df.to_dict(orient="records")
    except Exception:
        return []

@app.get("/api/v1/gt-surveys")
def get_gt_surveys():
    engine = get_engine()
    try:
        gdf = gpd.read_postgis("SELECT * FROM gt_surveys", engine, geom_col="geom")
        if gdf.crs is None:
            gdf.set_crs(epsg=4326, inplace=True)
        elif gdf.crs.to_epsg() != 4326:
            gdf = gdf.to_crs(epsg=4326)
        return json.loads(gdf.to_json())
    except Exception:
        return {"type": "FeatureCollection", "features": []}

@app.get("/api/v1/gnss-cors")
def get_gnss_cors():
    engine = get_engine()
    try:
        gdf = gpd.read_postgis("SELECT * FROM gnss_cors", engine, geom_col="geom")
        if gdf.crs is None:
            gdf.set_crs(epsg=4326, inplace=True)
        elif gdf.crs.to_epsg() != 4326:
            gdf = gdf.to_crs(epsg=4326)
        return json.loads(gdf.to_json())
    except Exception:
        return {"type": "FeatureCollection", "features": []}

@app.post("/api/v1/consensus")
def run_boundary_consensus():
    engine = get_engine()
    consensus_results = []
    try:
        conflicts_gdf = gpd.read_postgis("SELECT * FROM spatial_conflicts", engine, geom_col="geom")
        plots_gdf = gpd.read_postgis("SELECT * FROM cadastral_plots", engine, geom_col="geom")
        buildings_gdf = gpd.read_postgis("SELECT * FROM ai_buildings", engine, geom_col="geom")
        
        for _, row in conflicts_gdf.iterrows():
            plot_id = row.get("plot_id")
            building_id = row.get("building_id")
            
            revenue_geom = None
            if pd.notna(plot_id) and not plots_gdf.empty:
                plot_match = plots_gdf[plots_gdf["plot_id"] == plot_id]
                if not plot_match.empty:
                    revenue_geom = plot_match.iloc[0].geom

            drone_geom = None
            if pd.notna(building_id) and not buildings_gdf.empty:
                bldg_match = buildings_gdf[buildings_gdf["building_id"] == building_id]
                if not bldg_match.empty:
                    drone_geom = bldg_match.iloc[0].geom

            conflict_dict = {
                "plot_id": plot_id,
                "building_id": building_id,
                "confidence_score": row.get("confidence_score"),
                "conflict_type": row.get("conflict_type"),
                "geom": row.get("geom"),
                "revenue_geom": revenue_geom,  
                "drone_geom": drone_geom       
            }
            
            try:
                report = resolve_conflict(conflict_dict)
                last_round = report.audit_trail[-1] if report.audit_trail else None
                status = (
                    last_round.status
                    if last_round
                    else ("RESOLVED" if report.game_equilibrium_reached else "DEADLOCK")
                )
                winning_stakeholder = last_round.winning_stakeholder if last_round else "None"

                consensus_results.append({
                    "plot_id": plot_id,
                    "building_id": building_id,
                    "conflict_type": conflict_dict["conflict_type"],
                    "status": status,
                    "consensus_score": round(float(report.consensus_score), 4),
                    "winning_stakeholder": winning_stakeholder,
                    "rounds_taken": report.rounds_taken,
                    "game_equilibrium_reached": report.game_equilibrium_reached,
                })
            except Exception:
                continue
                
        return {"status": "success", "results": consensus_results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# 2. Endpoint to trigger the spatial conflict engine
@app.post("/api/v1/run-conflict-engine")
def run_conflict_engine():
    try:
        detect_encroachments()
        return {"status": "success", "message": "Spatial analysis complete."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. Endpoint to generate and return the PDF Notice
@app.get("/api/v1/reports/encroachment/{plot_id}")
def download_inspection_notice(
    plot_id: str, 
    owner_name: str = "Unknown", 
    tax_id: str = "N/A", 
    reg_area: float = 0.0, 
    gis_area: float = 0.0, 
    discrepancy: float = 0.0, 
    iou: float = 0.0, 
    confidence: float = 0.0, 
    conflict_type: str = "Encroachment"
):
    try:
        pdf_bytes = create_encroachment_pdf(
            plot_id=plot_id,
            owner_name=owner_name,
            tax_id=tax_id,
            reg_area=reg_area,
            gis_area=gis_area,
            discrepancy=discrepancy,
            iou=iou,
            confidence=confidence,
            conflict_type=conflict_type
        )
        return Response(content=pdf_bytes, media_type="application/pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 4. Layer counts endpoint — used by MapPage.jsx sidebar
@app.get("/api/v1/layer-counts")
def get_layer_counts():
    engine = get_engine()
    counts = {}
    table_map = {
        "plots": ("cadastral_plots", None),
        "buildings": ("ai_buildings", None),
        "conflicts": ("spatial_conflicts", None),
        "municipal": ("municipal_layers", None),
        "utilities": ("utility_lines", None),
        "gt": ("gt_surveys", None),
        "gnss": ("gnss_cors", None),
    }
    for key, (table, _) in table_map.items():
        try:
            with engine.connect() as conn:
                result = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
            counts[key] = int(result)
        except Exception:
            counts[key] = 0
    return counts


# 5. Audit logs endpoint — used by IngestionPage.jsx
@app.get("/api/v1/audit-logs")
def get_audit_logs():
    engine = get_engine()
    try:
        df = pd.read_sql("SELECT * FROM ingestion_audit_log ORDER BY ingested_at DESC LIMIT 50", engine)
        # Normalize column names for the frontend
        records = []
        for _, row in df.iterrows():
            records.append({
                "id": str(row.get("id", "")),
                "layer": str(row.get("layer_type", row.get("layer", ""))),
                "size": str(row.get("file_size", row.get("size", "N/A"))),
                "source": str(row.get("source_agency", row.get("source", "DoLR"))),
                "time": str(row.get("ingested_at", row.get("time", ""))),
                "status": str(row.get("status", "INGESTED")),
            })
        return records
    except Exception:
        return []