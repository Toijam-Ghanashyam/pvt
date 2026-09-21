import os
import json
import geopandas as gpd
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL

# Setup Connection
DB_USER = os.environ.get('DB_USER', 'postgres')
DB_PASS = os.environ.get('DB_PASS', 'Luwang2006@')
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_PORT = os.environ.get('DB_PORT', '5432')
DB_NAME = os.environ.get('DB_NAME', 'postgres')

db_url = URL.create("postgresql", username=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT, database=DB_NAME)
engine = create_engine(db_url)

print("Ingesting data into database...")

# Ingest cadastral plots
if os.path.exists('cadastral.geojson'):
    gdf = gpd.read_file('cadastral.geojson')
    gdf = gdf.rename_geometry("geom")
    gdf.to_postgis("cadastral_plots", engine, if_exists="replace", index=False)
    print("Ingested cadastral plots.")

# Ingest ai buildings
if os.path.exists('buildings.geojson'):
    gdf = gpd.read_file('buildings.geojson')
    gdf = gdf.rename_geometry("geom")
    gdf.to_postgis("ai_buildings", engine, if_exists="replace", index=False)
    print("Ingested ai buildings.")

# Ingest municipal zones
if os.path.exists('municipal_zones.geojson'):
    gdf = gpd.read_file('municipal_zones.geojson')
    gdf = gdf.rename_geometry("geom")
    gdf.to_postgis("municipal_layers", engine, if_exists="replace", index=False)
    print("Ingested municipal zones.")

# Ingest utility lines
if os.path.exists('utility_lines.geojson'):
    gdf = gpd.read_file('utility_lines.geojson')
    gdf = gdf.rename_geometry("geom")
    gdf.to_postgis("utility_lines", engine, if_exists="replace", index=False)
    print("Ingested utility lines.")

# Ingest revenue records
if os.path.exists('revenue.csv'):
    df = pd.read_csv('revenue.csv')
    df.to_sql("revenue_records", engine, if_exists="replace", index=False)
    print("Ingested revenue records.")

# Ingest GT surveys
if os.path.exists('gt_surveys.csv'):
    df = pd.read_csv('gt_surveys.csv')
    gdf = gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df.lon, df.lat), crs="EPSG:4326").rename_geometry("geom")
    gdf.to_postgis("gt_surveys", engine, if_exists="replace", index=False)
    print("Ingested GT surveys.")

# Ingest GNSS CORS
if os.path.exists('gnss_cors.csv'):
    df = pd.read_csv('gnss_cors.csv')
    gdf = gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df.lon, df.lat), crs="EPSG:4326").rename_geometry("geom")
    gdf.to_postgis("gnss_cors", engine, if_exists="replace", index=False)
    print("Ingested GNSS CORS.")

print("Done populating DB. Running conflict engine to generate conflicts...")

from conflict_engine import detect_encroachments
detect_encroachments()
print("All done!")
