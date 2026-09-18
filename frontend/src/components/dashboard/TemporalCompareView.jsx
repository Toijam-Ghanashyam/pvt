import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { MAP_CENTER, MAP_ZOOM } from '../../data/mockData';
import { useDashboard } from '../../context/DashboardContext';

/**
 * TemporalCompareView — Side-by-side swipe comparison between two base maps.
 * Left  = standard OSM basemap ("Historical Baseline")
 * Right = satellite-style tiles ("New Drone Survey")
 *
 * Uses CSS clip-path over two map instances for high performance.
 * Includes an "Overlay Vector Boundaries" toggle (enabled by default).
 */

const TILES_HISTORICAL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILES_SATELLITE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [map]);
  return null;
}

const plotOverlayStyle = () => ({
  color: '#3b82f6',
  weight: 2,
  fillOpacity: 0.1,
});

const buildingOverlayStyle = () => ({
  color: '#166534',
  weight: 1.5,
  fillColor: '#22c55e',
  fillOpacity: 0.4,
});

const TemporalCompareView = () => {
  const { geoData } = useDashboard();
  const [sliderPos, setSliderPos] = useState(50); // percentage 0-100
  const [showOverlay, setShowOverlay] = useState(true); // default true so user sees boundaries!
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handleMouseDown = useCallback(() => setIsDragging(true), []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => handleMove(e.clientX);
    const handleTouchMove = (e) => handleMove(e.touches[0].clientX);
    const handleUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, handleMove]);

  return (
    <div className="temporal-compare-view absolute inset-0 w-full h-full flex flex-col rounded-none overflow-hidden bg-slate-100 dark:bg-slate-950 transition-colors">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-3 py-2 bg-white dark:bg-[#0c1829] border-b border-slate-300 dark:border-slate-800 transition-colors shrink-0 select-none z-30">
        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
          Drag the center handle to compare <strong>Historical Baseline</strong> (Left) against <strong>New Drone Survey</strong> (Right).
        </p>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer flex-shrink-0 sm:ml-3">
          <input
            type="checkbox"
            checked={showOverlay}
            onChange={(e) => setShowOverlay(e.target.checked)}
            className="rounded-none border-slate-400 text-gov-navy focus:ring-0 w-3.5 h-3.5 cursor-pointer"
          />
          <span>Overlay Cadastral Boundaries</span>
        </label>
      </div>

      {/* Map comparison area */}
      <div ref={containerRef} className="flex-1 relative select-none" style={{ cursor: isDragging ? 'col-resize' : 'default' }}>
        {/* RIGHT map (satellite) — full width, underneath */}
        <div className="absolute inset-0 z-0">
          <MapContainer
            center={MAP_CENTER}
            zoom={MAP_ZOOM}
            className="w-full h-full"
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            zoomControl={false}
            dragging={!isDragging}
          >
            <MapResizer />
            <TileLayer
              url={TILES_SATELLITE}
              attribution='&copy; Esri'
              maxZoom={19}
            />
            {showOverlay && geoData.plots && geoData.buildings && (
              <>
                <GeoJSON data={geoData.plots} style={plotOverlayStyle} />
                <GeoJSON data={geoData.buildings} style={buildingOverlayStyle} />
              </>
            )}
          </MapContainer>
        </div>

        {/* LEFT map (historical) — clipped to slider position */}
        <div
          className="absolute inset-0 z-10"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <MapContainer
            center={MAP_CENTER}
            zoom={MAP_ZOOM}
            className="w-full h-full"
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
            zoomControl={false}
            dragging={false}
            attributionControl={false}
          >
            <MapResizer />
            <TileLayer
              url={TILES_HISTORICAL}
              attribution='&copy; OSM'
              maxZoom={19}
            />
            {showOverlay && geoData.plots && geoData.buildings && (
              <>
                <GeoJSON data={geoData.plots} style={plotOverlayStyle} />
                <GeoJSON data={geoData.buildings} style={buildingOverlayStyle} />
              </>
            )}
          </MapContainer>
        </div>

        {/* Slider handle */}
        <div
          className="absolute top-0 bottom-0 z-20 flex items-center"
          style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
        >
          {/* Vertical line */}
          <div className="w-0.5 h-full bg-white shadow-lg" />
          {/* Drag handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-xl border-2 border-teal-500 flex items-center justify-center cursor-col-resize hover:scale-110 transition-transform"
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            <div className="flex gap-0.5">
              <div className="w-0.5 h-3 bg-teal-500 rounded-full" />
              <div className="w-0.5 h-3 bg-teal-500 rounded-full" />
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 z-20 bg-navy-900/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded">
          Historical Baseline
        </div>
        <div className="absolute top-3 right-3 z-20 bg-navy-900/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded">
          New Drone Survey
        </div>
      </div>
    </div>
  );
};

export default TemporalCompareView;
