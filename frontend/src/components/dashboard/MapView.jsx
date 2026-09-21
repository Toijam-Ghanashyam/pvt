import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, CircleMarker, Popup } from 'react-leaflet';
import { useTheme } from '../../context/ThemeContext';
import { useDashboard } from '../../context/DashboardContext';
import { MAP_CENTER, MAP_ZOOM } from '../../data/mockData';
import { API_BASE_URL } from '../../config/api';

/**
 * MapView — Interactive Leaflet map with 7 toggleable GeoJSON layers.
 * Mirrors the Folium map in app.py with identical color conventions.
 *
 * Props:
 *  - layers: object with boolean toggles for each layer
 *  - selectedPlotId: currently selected plot ID (highlight)
 *  - onPlotClick(plotId): callback when a cadastral plot is clicked
 */

/* ── Layer style helpers ────────────────────────────────────────────── */

const plotStyle = (feature, selectedPlotId) => ({
  color: '#3b82f6',
  weight: feature.properties.plot_id === selectedPlotId ? 3 : 1.5,
  fillColor: feature.properties.plot_id === selectedPlotId ? '#60a5fa' : '#3b82f680',
  fillOpacity: feature.properties.plot_id === selectedPlotId ? 0.5 : 0.25,
});

const buildingStyle = () => ({
  color: '#166534',
  weight: 1.5,
  fillColor: '#22c55e',
  fillOpacity: 0.4,
});

const conflictStyle = () => ({
  color: '#ef4444',
  weight: 2,
  fillColor: '#ef4444',
  fillOpacity: 0.35,
});

const municipalStyle = () => ({
  color: '#a855f7',
  weight: 2,
  dashArray: '6 4',
  fillOpacity: 0,
});

const utilityStyle = () => ({
  color: '#06b6d4',
  weight: 2.5,
  fillOpacity: 0,
});

/* ── Legend sub-component ──────────────────────────────────────────── */

const LEGEND_ITEMS = [
  { label: 'Cadastral Plots', color: '#3b82f6', type: 'fill' },
  { label: 'AI Buildings', color: '#22c55e', type: 'fill' },
  { label: 'Spatial Conflicts', color: '#ef4444', type: 'fill' },
  { label: 'Municipal Zoning', color: '#a855f7', type: 'dash' },
  { label: 'Utility Networks', color: '#06b6d4', type: 'line' },
  { label: 'Ground Truth', color: '#f97316', type: 'circle' },
  { label: 'GNSS/CORS', color: '#3b82f6', type: 'circle' },
];

const Legend = () => {
  const [mobileExpanded, setMobileExpanded] = React.useState(false);

  return (
    <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-[1000] flex flex-col items-end">
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileExpanded((prev) => !prev)}
        className="sm:hidden flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-2.5 py-1.5 rounded-md shadow-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
      >
        <span>Legend</span>
        <span className="text-[10px] text-slate-400">{mobileExpanded ? '▲' : '▼'}</span>
      </button>

      {/* Legend content (always visible on sm+, toggleable on mobile) */}
      <div
        className={`${mobileExpanded ? 'block mt-1.5' : 'hidden'
          } sm:block bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-2.5 sm:p-3 text-left transition-colors`}
      >
        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Layer Legend</p>
        <div className="space-y-1.5">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
              {item.type === 'fill' && (
                <span className="w-3.5 sm:w-4 h-2.5 sm:h-3 rounded-sm border shrink-0" style={{ backgroundColor: item.color + '60', borderColor: item.color }} />
              )}
              {item.type === 'dash' && (
                <span className="w-3.5 sm:w-4 h-0 border-t-2 border-dashed shrink-0" style={{ borderColor: item.color }} />
              )}
              {item.type === 'line' && (
                <span className="w-3.5 sm:w-4 h-0 border-t-2 shrink-0" style={{ borderColor: item.color }} />
              )}
              {item.type === 'circle' && (
                <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full border-2 shrink-0" style={{ borderColor: item.color, backgroundColor: item.color + '40' }} />
              )}
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Map Resizer to force Leaflet to recalculate dimensions on tab/page change ── */
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [map]);
  return null;
}

const BASEMAPS = {
  osm: {
    label: 'Street',
    icon: '🗺️',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    label: 'Satellite',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com">Esri</a> World Imagery',
  },
  dark: {
    label: 'Dark',
    icon: '🌙',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
  },
};

/* ── Main MapView component ────────────────────────────────────────── */

const MapSearchControl = () => {
  const map = useMap();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Search failed", err);
    }
    setIsSearching(false);
  };

  const flyToResult = (lat, lon) => {
    map.flyTo([lat, lon], 16);
    setResults([]);
    setQuery('');
  };

  return (
    <div className="absolute top-3 left-12 sm:left-14 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-300 dark:border-slate-700 shadow-lg rounded-md p-1.5 sm:p-2 flex flex-col w-48 sm:w-64 max-h-[300px]">
      <form onSubmit={handleSearch} className="flex items-center gap-1.5 sm:gap-2">
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Search location..." 
          className="w-full text-[11px] sm:text-xs bg-transparent outline-none text-slate-800 dark:text-slate-200"
        />
        <button type="submit" disabled={isSearching} className="text-[11px] sm:text-xs text-gov-navy dark:text-amber-400 font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-slate-100 dark:bg-slate-800 cursor-pointer">
          {isSearching ? '...' : '🔍'}
        </button>
      </form>
      {results.length > 0 && (
        <ul className="mt-1.5 sm:mt-2 overflow-y-auto">
          {results.slice(0, 5).map((r, i) => (
            <li key={i} className="text-[10px] sm:text-xs py-1.5 border-b border-slate-200 dark:border-slate-700 last:border-0 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 truncate px-1" onClick={() => flyToResult(r.lat, r.lon)} title={r.display_name}>
              {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const MapView = ({ layers, selectedPlotId, onPlotClick }) => {
  const { isDark } = useTheme();
  const { geoData } = useDashboard();
  const [activeBasemap, setActiveBasemap] = React.useState(isDark ? 'dark' : 'osm');

  // Sync default basemap with theme toggle if user hasn't explicitly chosen
  useEffect(() => {
    setActiveBasemap(isDark ? 'dark' : 'osm');
  }, [isDark]);

  /* React-leaflet requires unique keys when GeoJSON data/style changes,
     so we use the selectedPlotId as part of the key for the plots layer
     to force a re-render when selection changes. */

  const onEachPlot = (feature, layer) => {
    layer.on({
      click: () => onPlotClick(feature.properties.plot_id),
    });
    layer.bindTooltip(feature.properties.plot_id, {
      direction: 'top',
      className: 'leaflet-tooltip-custom',
    });
  };

  const onEachConflict = (feature, layer) => {
    layer.bindTooltip(
      `${feature.properties.conflict_type} (IoU: ${feature.properties.iou}%)`,
      { direction: 'top' }
    );
  };

  const onEachMunicipal = (feature, layer) => {
    layer.bindTooltip(feature.properties.zone_name, { direction: 'center' });
  };

  const onEachUtility = (feature, layer) => {
    layer.bindTooltip(feature.properties.type, { direction: 'top' });
  };

  const currentTile = BASEMAPS[activeBasemap] || BASEMAPS.osm;

  return (
    <div className="map-2d-view absolute inset-0 w-full h-full overflow-hidden border border-slate-300 dark:border-slate-800 shadow-sm transition-colors">
      {/* Basemap Switcher Control (Top Right below MapTabs) */}
      <div className="absolute top-14 right-3 z-[1000] bg-white/95 dark:bg-[#0c1829]/95 backdrop-blur-xs border border-slate-300 dark:border-slate-700 shadow-md p-1 flex items-center gap-1 select-none">
        {Object.entries(BASEMAPS).map(([key, bm]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveBasemap(key)}
            className={`px-2 py-1 text-[11px] font-semibold flex items-center gap-1 transition-colors ${activeBasemap === key
              ? 'bg-gov-navy text-white font-bold'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <span>{bm.icon}</span>
            <span>{bm.label}</span>
          </button>
        ))}
      </div>

      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        className="w-full h-full z-0"
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapResizer />
        <MapSearchControl />

        {/* Selected Base tile layer */}
        <TileLayer
          key={activeBasemap}
          attribution={currentTile.attribution}
          url={currentTile.url}
          maxZoom={19}
        />

        {/* Cadastral Plots — blue */}
        {layers.plots && (
          <GeoJSON
            key={`plots-${selectedPlotId}`}
            data={geoData?.plots || { type: 'FeatureCollection', features: [] }}
            style={(feature) => plotStyle(feature, selectedPlotId)}
            onEachFeature={onEachPlot}
          />
        )}

        {/* AI Buildings — green */}
        {layers.buildings && (
          <GeoJSON
            key={`buildings-${geoData?.buildings?.features?.length ?? 0}`}
            data={geoData?.buildings || { type: 'FeatureCollection', features: [] }}
            style={buildingStyle}
          />
        )}

        {/* Municipal Zoning — purple dashed */}
        {layers.municipal && (
          <GeoJSON
            key={`municipal-${geoData?.municipal?.features?.length ?? 0}`}
            data={geoData?.municipal || { type: 'FeatureCollection', features: [] }}
            style={municipalStyle}
            onEachFeature={onEachMunicipal}
          />
        )}

        {/* Utility Networks — cyan lines */}
        {layers.utilities && (
          <GeoJSON
            key={`utilities-${geoData?.utilities?.features?.length ?? 0}`}
            data={geoData?.utilities || { type: 'FeatureCollection', features: [] }}
            style={utilityStyle}
            onEachFeature={onEachUtility}
          />
        )}

        {layers.gt && geoData?.gt?.features &&
          geoData.gt.features.map((f) => (
            <CircleMarker
              key={f.properties.gt_id}
              center={[f.geometry.coordinates[1], f.geometry.coordinates[0]]}
              radius={6}
              pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.6, weight: 2 }}
            >
              <Popup>
                <div className="text-xs">
                  <p className="font-semibold">{f.properties.gt_id}</p>
                  <p>Surveyor: {f.properties.surveyor}</p>
                  <p>Accuracy: ±{f.properties.accuracy_m}m</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}

        {layers.gnss && geoData?.gnss?.features &&
          geoData.gnss.features.map((f) => (
            <CircleMarker
              key={f.properties.station_id}
              center={[f.geometry.coordinates[1], f.geometry.coordinates[0]]}
              radius={9}
              pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.5, weight: 2.5 }}
            >
              <Popup>
                <div className="text-xs">
                  <p className="font-semibold">{f.properties.name}</p>
                  <p>Status: {f.properties.status}</p>
                  <p>Accuracy: ±{f.properties.accuracy_cm}cm</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}

        {/* Spatial Conflicts — red (drawn on top of everything) */}
        {layers.conflicts && (
          <GeoJSON
            key={`conflicts-${geoData?.conflicts?.features?.length ?? 0}`}
            data={geoData?.conflicts || { type: 'FeatureCollection', features: [] }}
            style={conflictStyle}
            onEachFeature={onEachConflict}
          />
        )}
      </MapContainer>

      {/* Legend overlay */}
      <Legend />
    </div>
  );
};

export default MapView;
