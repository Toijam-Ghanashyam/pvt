import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import geopandas as gpd
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.engine import URL

# Import logic previously executed directly by Streamlit
from conflict_engine import detect_encroachments
from report_generator import create_encroachment_pdf

app = FastAPI(
    title="NAKSHA Spatial Integration API",
    description="Inter-departmental REST API for land governance, cadastral data, and AI conflict detection.",
    version="1.0.0"
)

# 1. Enable CORS so your Netlify frontend can make requests to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with your Netlify URL (e.g., "https://your-app.netlify.app") in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_engine():
    DB_USER = os.environ.get("DB_USER", "postgres")
    DB_PASS = os.environ.get("DB_PASS", "Luwang2006@")
    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_PORT = os.environ.get("DB_PORT", "5432")
    DB_NAME = os.environ.get("DB_NAME", "postgres")
    db_url = URL.create("postgresql", username=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT, database=DB_NAME)
    return create_engine(db_url)

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