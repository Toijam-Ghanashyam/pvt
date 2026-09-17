/**
 * mockData.js
 * -----------
 * Centralized mock data module that mirrors the PostGIS tables used by the
 * backend (app.py). Every export can be swapped for a real fetch('/api/v1/...')
 * call later by editing ONLY this file — no component changes needed.
 *
 * All coordinates are roughly clustered around a generic urban area in India
 * (≈ 26.85°N, 80.91°E) to produce a convincing map rendering.
 */

// ─── Cadastral Plots (blue fill, blue outline) ─────────────────────
export const plotsGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { plot_id: 'PLT-001', area_sqm: 1200 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.905, 26.850], [80.907, 26.850], [80.907, 26.852], [80.905, 26.852], [80.905, 26.850]]]
      }
    },
    {
      type: 'Feature',
      properties: { plot_id: 'PLT-002', area_sqm: 980 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.907, 26.850], [80.909, 26.850], [80.909, 26.852], [80.907, 26.852], [80.907, 26.850]]]
      }
    },
    {
      type: 'Feature',
      properties: { plot_id: 'PLT-003', area_sqm: 1500 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.909, 26.850], [80.912, 26.850], [80.912, 26.852], [80.909, 26.852], [80.909, 26.850]]]
      }
    },
    {
      type: 'Feature',
      properties: { plot_id: 'PLT-004', area_sqm: 870 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.905, 26.852], [80.907, 26.852], [80.907, 26.854], [80.905, 26.854], [80.905, 26.852]]]
      }
    },
    {
      type: 'Feature',
      properties: { plot_id: 'PLT-005', area_sqm: 1100 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.907, 26.852], [80.909, 26.852], [80.909, 26.854], [80.907, 26.854], [80.907, 26.852]]]
      }
    },
    {
      type: 'Feature',
      properties: { plot_id: 'PLT-006', area_sqm: 1350 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.909, 26.852], [80.912, 26.852], [80.912, 26.854], [80.909, 26.854], [80.909, 26.852]]]
      }
    },
    {
      type: 'Feature',
      properties: { plot_id: 'PLT-007', area_sqm: 2000 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.905, 26.854], [80.908, 26.854], [80.908, 26.857], [80.905, 26.857], [80.905, 26.854]]]
      }
    },
    {
      type: 'Feature',
      properties: { plot_id: 'PLT-008', area_sqm: 1680 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.908, 26.854], [80.912, 26.854], [80.912, 26.857], [80.908, 26.857], [80.908, 26.854]]]
      }
    },
    {
      type: 'Feature',
      properties: { plot_id: 'PLT-009', area_sqm: 920 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.912, 26.850], [80.914, 26.850], [80.914, 26.853], [80.912, 26.853], [80.912, 26.850]]]
      }
    },
    {
      type: 'Feature',
      properties: { plot_id: 'PLT-010', area_sqm: 1050 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.912, 26.853], [80.914, 26.853], [80.914, 26.857], [80.912, 26.857], [80.912, 26.853]]]
      }
    },
  ]
};

// ─── AI-Extracted Buildings (green fill, dark green outline) ─────────
export const buildingsGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { building_id: 'BLD-001', height_m: 12, elevation_m: 12, plot_id: 'PLT-001' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.9055, 26.8505], [80.9065, 26.8505], [80.9065, 26.8515], [80.9055, 26.8515], [80.9055, 26.8505]]]
      }
    },
    {
      type: 'Feature',
      properties: { building_id: 'BLD-002', height_m: 8, elevation_m: 8, plot_id: 'PLT-002' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.9075, 26.8505], [80.9085, 26.8505], [80.9085, 26.8515], [80.9075, 26.8515], [80.9075, 26.8505]]]
      }
    },
    {
      type: 'Feature',
      properties: { building_id: 'BLD-003', height_m: 22, elevation_m: 22, plot_id: 'PLT-003' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.9095, 26.8505], [80.9110, 26.8505], [80.9110, 26.8515], [80.9095, 26.8515], [80.9095, 26.8505]]]
      }
    },
    {
      type: 'Feature',
      properties: { building_id: 'BLD-004', height_m: 6, elevation_m: 6, plot_id: 'PLT-004' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.9055, 26.8525], [80.9063, 26.8525], [80.9063, 26.8535], [80.9055, 26.8535], [80.9055, 26.8525]]]
      }
    },
    {
      type: 'Feature',
      properties: { building_id: 'BLD-005', height_m: 15, elevation_m: 15, plot_id: 'PLT-005' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.9075, 26.8525], [80.9085, 26.8525], [80.9085, 26.8535], [80.9075, 26.8535], [80.9075, 26.8525]]]
      }
    },
    {
      type: 'Feature',
      properties: { building_id: 'BLD-006', height_m: 35, elevation_m: 35, plot_id: 'PLT-006' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.9095, 26.8525], [80.9108, 26.8525], [80.9108, 26.8535], [80.9095, 26.8535], [80.9095, 26.8525]]]
      }
    },
    {
      type: 'Feature',
      properties: { building_id: 'BLD-007', height_m: 18, elevation_m: 18, plot_id: 'PLT-007' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.9055, 26.8545], [80.9070, 26.8545], [80.9070, 26.8560], [80.9055, 26.8560], [80.9055, 26.8545]]]
      }
    },
    {
      type: 'Feature',
      properties: { building_id: 'BLD-008', height_m: 28, elevation_m: 28, plot_id: 'PLT-008' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.9085, 26.8545], [80.9110, 26.8545], [80.9110, 26.8565], [80.9085, 26.8565], [80.9085, 26.8545]]]
      }
    },
    {
      type: 'Feature',
      properties: { building_id: 'BLD-009', height_m: 10, elevation_m: 10, plot_id: 'PLT-009' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.9125, 26.8505], [80.9135, 26.8505], [80.9135, 26.8520], [80.9125, 26.8520], [80.9125, 26.8505]]]
      }
    },
    {
      type: 'Feature',
      properties: { building_id: 'BLD-010', height_m: 40, elevation_m: 40, plot_id: 'PLT-010' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.9125, 26.8535], [80.9135, 26.8535], [80.9135, 26.8560], [80.9125, 26.8560], [80.9125, 26.8535]]]
      }
    },
    {
      type: 'Feature',
      properties: { building_id: 'BLD-011', height_m: 5, elevation_m: 5, plot_id: 'PLT-001' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.9057, 26.8508], [80.9062, 26.8508], [80.9062, 26.8512], [80.9057, 26.8512], [80.9057, 26.8508]]]
      }
    },
    {
      type: 'Feature',
      properties: { building_id: 'BLD-012', height_m: 3, elevation_m: 3, plot_id: 'PLT-005' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.9080, 26.8530], [80.9088, 26.8530], [80.9088, 26.8538], [80.9080, 26.8538], [80.9080, 26.8530]]]
      }
    },
  ]
};

// ─── Spatial Conflicts (red fill, red outline — drawn on top) ───────
// Each conflict has iou, confidence_score, conflict_type as per app.py
export const conflictsGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        conflict_id: 'CNF-001',
        plot_id: 'PLT-001',
        building_id: 'BLD-001',
        conflict_type: 'Building Encroachment',
        iou: 72.5,
        confidence_score: 91.3,
        status: 'Confirmed'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.9060, 26.8500], [80.9068, 26.8500], [80.9068, 26.8508], [80.9060, 26.8508], [80.9060, 26.8500]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        conflict_id: 'CNF-002',
        plot_id: 'PLT-003',
        building_id: 'BLD-003',
        conflict_type: 'Boundary Overlap',
        iou: 45.2,
        confidence_score: 78.4,
        status: 'Confirmed'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.9100, 26.8500], [80.9115, 26.8500], [80.9115, 26.8510], [80.9100, 26.8510], [80.9100, 26.8500]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        conflict_id: 'CNF-003',
        plot_id: 'PLT-005',
        building_id: 'BLD-005',
        conflict_type: 'Building Encroachment',
        iou: 88.7,
        confidence_score: 95.1,
        status: 'Confirmed'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.9074, 26.8522], [80.9086, 26.8522], [80.9086, 26.8532], [80.9074, 26.8532], [80.9074, 26.8522]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        conflict_id: 'CNF-004',
        plot_id: 'PLT-007',
        building_id: 'BLD-007',
        conflict_type: 'Zoning Violation',
        iou: 33.1,
        confidence_score: 62.8,
        status: 'Recommended Human Review'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.9052, 26.8548], [80.9065, 26.8548], [80.9065, 26.8558], [80.9052, 26.8558], [80.9052, 26.8548]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        conflict_id: 'CNF-005',
        plot_id: 'PLT-008',
        building_id: 'BLD-008',
        conflict_type: 'Building Encroachment',
        iou: 56.3,
        confidence_score: 84.7,
        status: 'Confirmed'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.9088, 26.8542], [80.9105, 26.8542], [80.9105, 26.8555], [80.9088, 26.8555], [80.9088, 26.8542]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        conflict_id: 'CNF-006',
        plot_id: 'PLT-010',
        building_id: 'BLD-010',
        conflict_type: 'Boundary Overlap',
        iou: 21.4,
        confidence_score: 48.2,
        status: 'Recommended Human Review'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.9122, 26.8540], [80.9138, 26.8540], [80.9138, 26.8555], [80.9122, 26.8555], [80.9122, 26.8540]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        conflict_id: 'CNF-007',
        plot_id: 'PLT-002',
        building_id: 'BLD-002',
        conflict_type: 'Building Encroachment',
        iou: 67.9,
        confidence_score: 89.5,
        status: 'Confirmed'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.9072, 26.8502], [80.9088, 26.8502], [80.9088, 26.8512], [80.9072, 26.8512], [80.9072, 26.8502]]]
      }
    },
  ]
};

// ─── Municipal Zoning (purple dashed outline, no fill) ──────────────
export const municipalGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { zone_id: 'MZ-001', zone_type: 'Residential', zone_name: 'Ward 12 Residential' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.904, 26.849], [80.910, 26.849], [80.910, 26.855], [80.904, 26.855], [80.904, 26.849]]]
      }
    },
    {
      type: 'Feature',
      properties: { zone_id: 'MZ-002', zone_type: 'Commercial', zone_name: 'Central Commercial Zone' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.910, 26.849], [80.915, 26.849], [80.915, 26.855], [80.910, 26.855], [80.910, 26.849]]]
      }
    },
    {
      type: 'Feature',
      properties: { zone_id: 'MZ-003', zone_type: 'Mixed Use', zone_name: 'Ward 14 Mixed-Use' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[80.904, 26.855], [80.915, 26.855], [80.915, 26.858], [80.904, 26.858], [80.904, 26.855]]]
      }
    },
  ]
};

// ─── Utility Networks (cyan lines) ──────────────────────────────────
export const utilitiesGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { utility_id: 'UTL-001', type: 'Water Main', diameter_mm: 300 },
      geometry: {
        type: 'LineString',
        coordinates: [[80.904, 26.851], [80.907, 26.851], [80.910, 26.851], [80.913, 26.851], [80.915, 26.851]]
      }
    },
    {
      type: 'Feature',
      properties: { utility_id: 'UTL-002', type: 'Sewer Line', diameter_mm: 450 },
      geometry: {
        type: 'LineString',
        coordinates: [[80.904, 26.853], [80.907, 26.853], [80.910, 26.853], [80.913, 26.853]]
      }
    },
    {
      type: 'Feature',
      properties: { utility_id: 'UTL-003', type: 'Power Line', diameter_mm: 0 },
      geometry: {
        type: 'LineString',
        coordinates: [[80.906, 26.849], [80.906, 26.852], [80.906, 26.855], [80.906, 26.858]]
      }
    },
    {
      type: 'Feature',
      properties: { utility_id: 'UTL-004', type: 'Gas Pipeline', diameter_mm: 200 },
      geometry: {
        type: 'LineString',
        coordinates: [[80.910, 26.849], [80.910, 26.852], [80.910, 26.855], [80.910, 26.857]]
      }
    },
    {
      type: 'Feature',
      properties: { utility_id: 'UTL-005', type: 'Telecom Duct', diameter_mm: 100 },
      geometry: {
        type: 'LineString',
        coordinates: [[80.904, 26.856], [80.908, 26.856], [80.912, 26.856], [80.915, 26.856]]
      }
    },
  ]
};

// ─── Ground Truthing Points (orange circle markers) ─────────────────
export const gtGeoJSON = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { gt_id: 'GT-001', surveyor: 'Field Team A', date: '2025-11-15', accuracy_m: 0.3 }, geometry: { type: 'Point', coordinates: [80.9060, 26.8510] } },
    { type: 'Feature', properties: { gt_id: 'GT-002', surveyor: 'Field Team A', date: '2025-11-15', accuracy_m: 0.5 }, geometry: { type: 'Point', coordinates: [80.9082, 26.8510] } },
    { type: 'Feature', properties: { gt_id: 'GT-003', surveyor: 'Field Team B', date: '2025-12-02', accuracy_m: 0.2 }, geometry: { type: 'Point', coordinates: [80.9105, 26.8510] } },
    { type: 'Feature', properties: { gt_id: 'GT-004', surveyor: 'Field Team B', date: '2025-12-02', accuracy_m: 0.4 }, geometry: { type: 'Point', coordinates: [80.9060, 26.8535] } },
    { type: 'Feature', properties: { gt_id: 'GT-005', surveyor: 'Field Team C', date: '2026-01-10', accuracy_m: 0.1 }, geometry: { type: 'Point', coordinates: [80.9082, 26.8535] } },
    { type: 'Feature', properties: { gt_id: 'GT-006', surveyor: 'Field Team C', date: '2026-01-10', accuracy_m: 0.6 }, geometry: { type: 'Point', coordinates: [80.9105, 26.8535] } },
    { type: 'Feature', properties: { gt_id: 'GT-007', surveyor: 'Field Team A', date: '2026-02-18', accuracy_m: 0.3 }, geometry: { type: 'Point', coordinates: [80.9060, 26.8555] } },
    { type: 'Feature', properties: { gt_id: 'GT-008', surveyor: 'Field Team B', date: '2026-02-18', accuracy_m: 0.2 }, geometry: { type: 'Point', coordinates: [80.9100, 26.8555] } },
    { type: 'Feature', properties: { gt_id: 'GT-009', surveyor: 'Field Team C', date: '2026-03-05', accuracy_m: 0.4 }, geometry: { type: 'Point', coordinates: [80.9130, 26.8515] } },
    { type: 'Feature', properties: { gt_id: 'GT-010', surveyor: 'Field Team A', date: '2026-03-05', accuracy_m: 0.5 }, geometry: { type: 'Point', coordinates: [80.9130, 26.8550] } },
  ]
};

// ─── GNSS / CORS Stations (blue circle markers, slightly larger) ────
export const gnssGeoJSON = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { station_id: 'GNSS-001', name: 'CORS Base Alpha', status: 'Active', accuracy_cm: 2 }, geometry: { type: 'Point', coordinates: [80.9040, 26.8490] } },
    { type: 'Feature', properties: { station_id: 'GNSS-002', name: 'CORS Base Beta', status: 'Active', accuracy_cm: 3 }, geometry: { type: 'Point', coordinates: [80.9150, 26.8490] } },
    { type: 'Feature', properties: { station_id: 'GNSS-003', name: 'CORS Relay Gamma', status: 'Active', accuracy_cm: 2 }, geometry: { type: 'Point', coordinates: [80.9040, 26.8580] } },
    { type: 'Feature', properties: { station_id: 'GNSS-004', name: 'CORS Relay Delta', status: 'Maintenance', accuracy_cm: 5 }, geometry: { type: 'Point', coordinates: [80.9150, 26.8580] } },
    { type: 'Feature', properties: { station_id: 'GNSS-005', name: 'CORS Mobile Unit', status: 'Active', accuracy_cm: 4 }, geometry: { type: 'Point', coordinates: [80.9095, 26.8535] } },
  ]
};

// ─── Revenue Records (flat array keyed by plot_id) ──────────────────
// Matches the structure from: pd.read_sql("SELECT * FROM revenue_records", engine)
export const revenueRecords = [
  { plot_id: 'PLT-001', owner_name: 'Rajesh Kumar Singh', tax_status: 'Paid', tax_id: 'TX-2026-00142', registered_area_sqm: 1200, gis_area_sqm: 1185 },
  { plot_id: 'PLT-002', owner_name: 'Sunita Devi Sharma', tax_status: 'Pending', tax_id: 'TX-2026-00143', registered_area_sqm: 980, gis_area_sqm: 995 },
  { plot_id: 'PLT-003', owner_name: 'Mohammad Arif Khan', tax_status: 'Paid', tax_id: 'TX-2026-00144', registered_area_sqm: 1500, gis_area_sqm: 1478 },
  { plot_id: 'PLT-004', owner_name: 'Priya Mehta Gupta', tax_status: 'Paid', tax_id: 'TX-2026-00145', registered_area_sqm: 870, gis_area_sqm: 868 },
  { plot_id: 'PLT-005', owner_name: 'Vikram Pal Yadav', tax_status: 'Overdue', tax_id: 'TX-2026-00146', registered_area_sqm: 1100, gis_area_sqm: 1062 },
  { plot_id: 'PLT-006', owner_name: 'Ananya Roy Choudhury', tax_status: 'Paid', tax_id: 'TX-2026-00147', registered_area_sqm: 1350, gis_area_sqm: 1345 },
  { plot_id: 'PLT-007', owner_name: 'Deepak Sahu Verma', tax_status: 'Pending', tax_id: 'TX-2026-00148', registered_area_sqm: 2000, gis_area_sqm: 1972 },
  { plot_id: 'PLT-008', owner_name: 'Kavita Mishra Tiwari', tax_status: 'Paid', tax_id: 'TX-2026-00149', registered_area_sqm: 1680, gis_area_sqm: 1695 },
  { plot_id: 'PLT-009', owner_name: 'Suresh Nair Pillai', tax_status: 'Paid', tax_id: 'TX-2026-00150', registered_area_sqm: 920, gis_area_sqm: 910 },
  { plot_id: 'PLT-010', owner_name: 'Fatima Begum Ansari', tax_status: 'Overdue', tax_id: 'TX-2026-00151', registered_area_sqm: 1050, gis_area_sqm: 1020 },
];

// ─── Topology Metrics ───────────────────────────────────────────────
// Matches: pd.read_sql("SELECT * FROM topology_metrics", engine)
export const topologyMetrics = [
  { metric_name: 'Self-Intersecting Polygons Repaired', metric_value: 14 },
  { metric_name: 'Building Edges Snapped to Boundaries', metric_value: 37 },
];

// ─── Computed KPI values (mirrors the logic in app.py lines 96-109) ─
export function computeKPIs() {
  const totalBuildings = buildingsGeoJSON.features.length;
  const encroachments = conflictsGeoJSON.features.length;
  const totalAreaSqm = plotsGeoJSON.features.reduce((sum, f) => sum + (f.properties.area_sqm || 0), 0);
  const totalAreaHectares = totalAreaSqm / 10000;
  const accuracyRate = totalBuildings > 0
    ? ((totalBuildings - encroachments) / totalBuildings) * 100
    : 100;

  return {
    totalAreaHectares: totalAreaHectares.toFixed(2),
    totalBuildings,
    encroachments,
    accuracyRate: accuracyRate.toFixed(1),
  };
}

// ─── Map center (bounding box center of all data) ───────────────────
export const MAP_CENTER = [26.853, 80.909];
export const MAP_ZOOM = 16;

// ─── Jurisdictional Land Revenue & Verification Offices ──────────────
export const jurisdictionalRevenueOffice = {
  office_name: 'Tehsil Sadar Land Revenue & Verification Office',
  division: 'Circle 4 — Chowk & Mohan Road Urban Belt, Lucknow Division',
  nodal_officer: 'Shri Ramesh K. Verma',
  designation: 'Nayab Tehsildar & Nodal Land Revenue Officer (LRO)',
  phone: '+91 522 262-4418',
  mobile: '+91 94150-89214',
  email: 'lri.zone4.revenue@up.gov.in',
  address: 'Room 14, Tehsil Sadar Compound, Kaisarbagh, Lucknow, UP 226001',
  office_hours: '09:30 AM – 05:30 PM (Mon–Sat)',
  cadastral_code: 'UP-LKO-2026-LRO-04',
};

