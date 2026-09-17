-- Municipal GIS Layers (e.g., Zoning, Ward boundaries)
CREATE TABLE municipal_layers (
    layer_id   SERIAL PRIMARY KEY,
    zone_name  TEXT NOT NULL,
    geom       geometry(Polygon, 4326) NOT NULL
);
CREATE INDEX idx_municipal_geom ON municipal_layers USING GIST (geom);

-- Utility Network Data (e.g., Water, Electric)
CREATE TABLE utility_lines (
    line_id    SERIAL PRIMARY KEY,
    utility_type TEXT NOT NULL,
    geom       geometry(LineString, 4326) NOT NULL
);
CREATE INDEX idx_utility_geom ON utility_lines USING GIST (geom);

-- Ground Truthing (GT) Datasets
CREATE TABLE gt_surveys (
    gt_id      SERIAL PRIMARY KEY,
    surveyor   TEXT NOT NULL,
    geom       geometry(Point, 4326) NOT NULL
);
CREATE INDEX idx_gt_geom ON gt_surveys USING GIST (geom);

-- GNSS/CORS Survey Data
CREATE TABLE gnss_cors (
    station_id TEXT PRIMARY KEY,
    accuracy   NUMERIC(5, 4),
    geom       geometry(Point, 4326) NOT NULL
);
CREATE INDEX idx_gnss_geom ON gnss_cors USING GIST (geom);

-- Non-spatial revenue and tax records
CREATE TABLE revenue_records (
    tax_id               TEXT PRIMARY KEY,
    plot_id              TEXT NOT NULL REFERENCES cadastral_plots(plot_id) ON DELETE CASCADE,
    registered_area_sqm  DOUBLE PRECISION NOT NULL,
    tax_status           TEXT NOT NULL,
    last_assessment_date DATE NOT NULL
);