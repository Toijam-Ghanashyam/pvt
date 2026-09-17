import os
import geopandas as gpd
from shapely.geometry import Polygon

# Target directory matching ingest.py's expected folder
incoming_dir = os.path.join(os.path.dirname(__file__), "incoming_data")
os.makedirs(incoming_dir, exist_ok=True)

# Coordinate baseline (matching your project location near Delhi)
base_lon, base_lat = 77.0, 28.0

# 1. Irregular L-Shaped Parcel (6 vertices)
poly_l_shape = Polygon([
    (base_lon + 0.0000, base_lat + 0.0000),
    (base_lon + 0.0006, base_lat + 0.0000),
    (base_lon + 0.0006, base_lat + 0.0002),
    (base_lon + 0.0002, base_lat + 0.0002),
    (base_lon + 0.0002, base_lat + 0.0006),
    (base_lon + 0.0000, base_lat + 0.0006)
])

# 2. Irregular Slanted/Trapezoidal Parcel (5 vertices)
poly_slanted = Polygon([
    (base_lon + 0.0008, base_lat + 0.0001),
    (base_lon + 0.0014, base_lat + 0.0000),
    (base_lon + 0.0017, base_lat + 0.0004),
    (base_lon + 0.0011, base_lat + 0.0006),
    (base_lon + 0.0007, base_lat + 0.0003)
])

# 3. Complex Non-Rectangular Parcel (7 vertices)
poly_complex = Polygon([
    (base_lon + 0.0001, base_lat + 0.0008),
    (base_lon + 0.0005, base_lat + 0.0007),
    (base_lon + 0.0009, base_lat + 0.0010),
    (base_lon + 0.0008, base_lat + 0.0014),
    (base_lon + 0.0003, base_lat + 0.0015),
    (base_lon + 0.0000, base_lat + 0.0012),
    (base_lon + 0.0001, base_lat + 0.0010)
])

# Build dataset attributes matching resolve_column logic in ingest.py
data = [
    {"PLOT_ID": "IRR_101", "OWNER_NAME": "Vikram Singh", "geometry": poly_l_shape},
    {"PLOT_ID": "IRR_102", "OWNER_NAME": "Priya Sharma", "geometry": poly_slanted},
    {"PLOT_ID": "IRR_103", "OWNER_NAME": "Anil Verma", "geometry": poly_complex}
]

# Create GeoDataFrame in WGS84 CRS (EPSG:4326)
gdf = gpd.GeoDataFrame(data, crs="EPSG:4326")

# Export as Shapefile directly into incoming_data/
output_path = os.path.join(incoming_dir, "irregular_cadastral_plots.shp")
gdf.to_file(output_path)

print(f"Successfully generated irregular shapefile at: {output_path}")