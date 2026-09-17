import json
import random
import numpy as np
import pandas as pd
from scipy.spatial import Voronoi
import shapely.geometry as sg
import shapely.ops as so
import shapely.affinity as affinity
from shapely.geometry import Polygon, LineString, mapping

random.seed(42)
np.random.seed(42)

TARGET_COUNT = 500
BASE_LON = 86.9200  # Odisha regional coordinates
BASE_LAT = 21.4900

print("1. Generating organic village cadastral boundary & parcel tessellation...")

# 1. Generate points constrained inside an organic boundary curve
pts = []
while len(pts) < 650:
    x = random.uniform(BASE_LON - 0.025, BASE_LON + 0.025)
    y = random.uniform(BASE_LAT - 0.025, BASE_LAT + 0.025)
    
    # Polar distortion to create realistic village boundary perimeter
    dx = (x - BASE_LON) / 0.022
    dy = (y - BASE_LAT) / 0.022
    r = np.sqrt(dx**2 + dy**2)
    theta = np.arctan2(dy, dx)
    max_r = 0.85 + 0.15 * np.sin(3 * theta) + 0.10 * np.cos(5 * theta)
    
    if r < max_r:
        pts.append((x, y))

# Build village boundary polygon
boundary_coords = []
for theta in np.linspace(0, 2 * np.pi, 120):
    max_r = 0.85 + 0.15 * np.sin(3 * theta) + 0.10 * np.cos(5 * theta)
    bx = BASE_LON + 0.022 * max_r * np.cos(theta)
    by = BASE_LAT + 0.022 * max_r * np.sin(theta)
    boundary_coords.append((bx, by))
village_boundary = Polygon(boundary_coords)

# 2. Partition space using Voronoi Tessellation for natural cadastral plots
vor = Voronoi(np.array(pts))
lines = [
    sg.LineString(vor.vertices[line])
    for line in vor.ridge_vertices
    if -1 not in line
]

polygons = list(so.polygonize(lines))
clipped_parcels = []
for poly in polygons:
    clipped = poly.intersection(village_boundary)
    if not clipped.is_empty and isinstance(clipped, Polygon) and clipped.area > 1e-8:
        clipped_parcels.append(clipped)

selected_parcels = clipped_parcels[:TARGET_COUNT]
print(f"-> Created {len(selected_parcels)} contiguous irregular cadastral plots.")

# 3. Helper to create realistic irregular buildings
def generate_irregular_footprint(parcel, encroach=False):
    cx, cy = parcel.centroid.x, parcel.centroid.y
    minx, miny, maxx, maxy = parcel.bounds
    scale = min(maxx - minx, maxy - miny) * random.uniform(0.28, 0.45)
    
    archetype = random.choice(["L_shape", "T_shape", "irregular_poly", "rotated_rect"])
    
    if encroach:
        # Pull centroid close to or across parcel border
        ext_coords = list(parcel.exterior.coords)
        target = random.choice(ext_coords)
        t = random.uniform(0.80, 1.05)
        cx += t * (target[0] - cx)
        cy += t * (target[1] - cy)
    else:
        cx += (random.random() - 0.5) * scale * 0.3
        cy += (random.random() - 0.5) * scale * 0.3

    w, h = scale, scale * random.uniform(0.7, 1.4)
    
    if archetype == "L_shape":
        r1 = Polygon([(cx - w/2, cy - h/2), (cx + w/2, cy - h/2), (cx + w/2, cy), (cx - w/2, cy)])
        r2 = Polygon([(cx - w/2, cy - h/2), (cx, cy - h/2), (cx, cy + h/2), (cx - w/2, cy + h/2)])
        bldg = r1.union(r2)
    elif archetype == "T_shape":
        r1 = Polygon([(cx - w/2, cy + h/6), (cx + w/2, cy + h/6), (cx + w/2, cy + h/2), (cx - w/2, cy + h/2)])
        r2 = Polygon([(cx - w/6, cy - h/2), (cx + w/6, cy - h/2), (cx + w/6, cy + h/2), (cx - w/6, cy + h/2)])
        bldg = r1.union(r2)
    elif archetype == "irregular_poly":
        n_pts = random.randint(5, 7)
        angles = sorted([random.uniform(0, 2*np.pi) for _ in range(n_pts)])
        poly_pts = [(cx + (scale/2) * random.uniform(0.6, 1.2) * np.cos(a),
                     cy + (scale/2) * random.uniform(0.6, 1.2) * np.sin(a)) for a in angles]
        bldg = Polygon(poly_pts)
    else:
        bldg = Polygon([(cx - w/2, cy - h/2), (cx + w/2, cy - h/2), (cx + w/2, cy + h/2), (cx - w/2, cy + h/2)])

    bldg = affinity.rotate(bldg, random.uniform(0, 180), origin=(cx, cy))
    
    if not bldg.is_valid:
        bldg = bldg.buffer(0)
    if bldg.geom_type == 'MultiPolygon':
        bldg = max(bldg.geoms, key=lambda p: p.area)
        
    return bldg

# 4. Generate Main Datasets (Cadastral, Buildings, Revenue)
plot_features = []
building_features = []
revenue_records = []

first_names = ["Bijay", "Subrat", "Pradeep", "Rashmi", "Manas", "Satyabrata", "Minati", "Soumya", "Tapan", "Deepak", "Jayanta", "Alok"]
last_names = ["Mohapatra", "Pradhan", "Nayak", "Panda", "Rath", "Das", "Sahoo", "Barik", "Samal", "Biswal", "Mishra", "Patra"]

print("2. Constructing GeoJSON features and tax records...")

for idx, parcel in enumerate(selected_parcels, 1):
    plot_id = str(idx)
    owner = f"{random.choice(first_names)} {random.choice(last_names)}"
    
    parcel = parcel.simplify(0.00001, preserve_topology=True)
    plot_coords = [[[round(c[0], 6), round(c[1], 6)] for c in parcel.exterior.coords]]
    
    plot_features.append({
        "type": "Feature",
        "properties": {"plot_id": plot_id, "owner_name": owner},
        "geometry": {"type": "Polygon", "coordinates": plot_coords}
    })
    
    approx_sqm = round(parcel.area * (111000 * np.cos(np.radians(BASE_LAT))) * 111000, 2)
    tax_id = f"TAX-OD-{plot_id.zfill(4)}"
    
    if random.random() < 0.20:
        reg_area = round(approx_sqm * random.uniform(0.85, 1.20), 2)
    else:
        reg_area = approx_sqm
        
    revenue_records.append({
        "tax_id": tax_id,
        "plot_id": plot_id,
        "registered_area_sqm": reg_area,
        "tax_status": random.choices(["Paid", "Pending", "Defaulter"], weights=[0.70, 0.20, 0.10])[0],
        "last_assessment_date": f"2026-{random.randint(1, 8):02d}-{random.randint(1, 28):02d}"
    })
    
    encroach = (random.random() < 0.15)
    b_geom = generate_irregular_footprint(parcel, encroach=encroach)
    b_geom = b_geom.simplify(0.000005, preserve_topology=True)
    b_coords = [[[round(c[0], 6), round(c[1], 6)] for c in b_geom.exterior.coords]]
    
    building_features.append({
        "type": "Feature",
        "properties": {
            "building_id": idx,
            "elevation_m": round(float(random.uniform(4.0, 18.5)), 1),
            "confidence_score": round(float(random.uniform(0.85, 0.98)), 2)
        },
        "geometry": {"type": "Polygon", "coordinates": b_coords}
    })

# 5. Generate Auxiliary Layers (Municipal, Utilities, GT, GNSS)
print("3. Generating Auxiliary Layers (Zoning, Utilities, Surveys)...")

# A. Municipal Green Belt / Flood Plain (Covers the southern portion of the village)
muni_poly = Polygon([
    (BASE_LON - 0.025, BASE_LAT - 0.025),
    (BASE_LON + 0.025, BASE_LAT - 0.025),
    (BASE_LON + 0.025, BASE_LAT - 0.010),
    (BASE_LON - 0.025, BASE_LAT - 0.010)
])
muni_feature = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "properties": {"zone_name": "Eco-Sensitive Green Belt & Flood Zone"},
        "geometry": mapping(muni_poly)
    }]
}

# B. Utility Network (High Tension LineString crossing the habitations diagonally)
utility_line = LineString([
    (BASE_LON - 0.020, BASE_LAT + 0.020),
    (BASE_LON + 0.020, BASE_LAT - 0.020)
])
utility_feature = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "properties": {"utility_type": "400kV High-Tension Transmission Corridor"},
        "geometry": mapping(utility_line)
    }]
}

# C. Ground Truthing Points (Scattered CSV coordinates)
gt_df = pd.DataFrame([
    {"point_id": "GT_101", "surveyor": "Surveyor A. Nayak", "lat": BASE_LAT + 0.005, "lon": BASE_LON + 0.005, "accuracy_m": 0.02},
    {"point_id": "GT_102", "surveyor": "Surveyor S. Mohapatra", "lat": BASE_LAT - 0.008, "lon": BASE_LON - 0.008, "accuracy_m": 0.03},
    {"point_id": "GT_103", "surveyor": "Surveyor R. Das", "lat": BASE_LAT + 0.012, "lon": BASE_LON - 0.003, "accuracy_m": 0.01},
    {"point_id": "GT_104", "surveyor": "Surveyor B. Sahoo", "lat": BASE_LAT - 0.010, "lon": BASE_LON + 0.015, "accuracy_m": 0.02}
])

# D. GNSS CORS Stations (Base stations outside the main cluster)
cors_df = pd.DataFrame([
    {"station_id": "CORS_ODISHA_01", "lat": BASE_LAT + 0.022, "lon": BASE_LON - 0.022, "accuracy": "±0.008m (Fixed)"},
    {"station_id": "CORS_ODISHA_02", "lat": BASE_LAT - 0.022, "lon": BASE_LON + 0.022, "accuracy": "±0.006m (Fixed)"}
])

# 6. Save all generated files
with open("cadastral.geojson", "w") as f:
    json.dump({"type": "FeatureCollection", "features": plot_features}, f, indent=2)

with open("buildings.geojson", "w") as f:
    json.dump({"type": "FeatureCollection", "features": building_features}, f, indent=2)

pd.DataFrame(revenue_records).to_csv("revenue.csv", index=False)

with open("municipal_zones.geojson", "w") as f:
    json.dump(muni_feature, f, indent=2)

with open("utility_lines.geojson", "w") as f:
    json.dump(utility_feature, f, indent=2)

gt_df.to_csv("gt_surveys.csv", index=False)
cors_df.to_csv("gnss_cors.csv", index=False)

print(f"Successfully exported 7 files to root directory:")
print(f" • cadastral.geojson ({len(plot_features)} plots)")
print(f" • buildings.geojson ({len(building_features)} buildings)")
print(f" • revenue.csv ({len(revenue_records)} records)")
print(f" • municipal_zones.geojson (1 restricted zone polygon)")
print(f" • utility_lines.geojson (1 transmission corridor linestring)")
print(f" • gt_surveys.csv (4 ground truth points)")
print(f" • gnss_cors.csv (2 base stations)")