-- Enable PostGIS extension if not exists
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Cadastral Plots
CREATE TABLE cadastral_plots (
    plot_id    TEXT PRIMARY KEY,
    owner_name TEXT,
    geom       geometry(Geometry, 4326)
);
CREATE INDEX idx_cadastral_plots_geom ON cadastral_plots USING GIST (geom);

-- 2. AI Buildings
CREATE TABLE ai_buildings (
    building_id      TEXT PRIMARY KEY,
    confidence_score DOUBLE PRECISION,
    elevation_m      DOUBLE PRECISION,
    geom             geometry(Geometry, 4326)
);
CREATE INDEX idx_ai_buildings_geom ON ai_buildings USING GIST (geom);

-- 3. Spatial Conflicts
CREATE TABLE spatial_conflicts (
    building_id      VARCHAR,
    plot_id          VARCHAR,
    iou              FLOAT,
    confidence_score FLOAT,
    conflict_type    VARCHAR,
    geom             geometry(Geometry, 4326)
);
CREATE INDEX idx_spatial_conflicts_geom ON spatial_conflicts USING GIST (geom);

-- 4. Topology Metrics
CREATE TABLE topology_metrics (
    metric_name  VARCHAR(100),
    metric_value INTEGER
);

-- 5. Ingestion Audit Log
CREATE TABLE ingestion_audit_log (
    id            SERIAL PRIMARY KEY,
    layer_type    TEXT,
    file_size     TEXT,
    source_agency TEXT,
    ingested_at   TIMESTAMP,
    status        TEXT,
    summary       TEXT
);

-- 6. Municipal GIS Layers (e.g., Zoning, Ward boundaries)
CREATE TABLE municipal_layers (
    layer_id   SERIAL PRIMARY KEY,
    zone_name  TEXT,
    geom       geometry(Geometry, 4326)
);
CREATE INDEX idx_municipal_geom ON municipal_layers USING GIST (geom);

-- 7. Utility Network Data (e.g., Water, Electric)
CREATE TABLE utility_lines (
    line_id      SERIAL PRIMARY KEY,
    utility_type TEXT,
    geom         geometry(Geometry, 4326)
);
CREATE INDEX idx_utility_geom ON utility_lines USING GIST (geom);

-- 8. Ground Truthing (GT) Datasets
CREATE TABLE gt_surveys (
    gt_id      SERIAL PRIMARY KEY,
    surveyor   TEXT,
    geom       geometry(Geometry, 4326)
);
CREATE INDEX idx_gt_geom ON gt_surveys USING GIST (geom);

-- 9. GNSS/CORS Survey Data
CREATE TABLE gnss_cors (
    station_id TEXT PRIMARY KEY,
    accuracy   NUMERIC(5, 4),
    geom       geometry(Geometry, 4326)
);
CREATE INDEX idx_gnss_geom ON gnss_cors USING GIST (geom);

-- 10. Non-spatial revenue and tax records
CREATE TABLE revenue_records (
    tax_id               TEXT PRIMARY KEY,
    plot_id              TEXT NOT NULL REFERENCES cadastral_plots(plot_id) ON DELETE CASCADE,
    registered_area_sqm  DOUBLE PRECISION NOT NULL,
    tax_status           TEXT NOT NULL,
    last_assessment_date DATE NOT NULL
);