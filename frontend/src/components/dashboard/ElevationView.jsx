import React, { useMemo } from 'react';
import { DeckGL } from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { MAP_CENTER } from '../../data/mockData';
import { useDashboard } from '../../context/DashboardContext';

/**
 * ElevationView — 3D extruded building footprints using deck.gl.
 *
 * - Cadastral plot boundaries in 3D
 * - Extruded polygons with elevation_m * 2
 * - Tilted camera (pitch ~55°, bearing ~-25°)
 * - Hover tooltip: Structure ID + Height
 */

const INITIAL_VIEW_STATE = {
  longitude: MAP_CENTER[1],
  latitude: MAP_CENTER[0],
  zoom: 16.2,
  pitch: 55,
  bearing: -25,
  minZoom: 13,
  maxZoom: 19,
};

const ElevationView = () => {
  const { geoData } = useDashboard();
  const hasElevation = (geoData.buildings?.features || []).some(
    (f) => f.properties.elevation_m != null
  );

  if (!hasElevation) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-none">
        <p className="text-sm text-slate-400">No 3D elevation data available to render.</p>
      </div>
    );
  }

  const layers = [

    // 2. Cadastral parcel plot boundaries projected on 3D ground plane
    new GeoJsonLayer({
      id: 'plots-3d-boundary',
      data: geoData.plots || { type: 'FeatureCollection', features: [] },
      filled: false,
      stroked: true,
      getLineColor: [59, 130, 246, 255], // bright blue
      getLineWidth: 2.5,
      lineWidthUnits: 'pixels',
      pickable: false,
    }),

    // 3. 3D Extruded Building Footprints with DSM height elevation
    new GeoJsonLayer({
      id: 'buildings-3d',
      data: geoData.buildings || { type: 'FeatureCollection', features: [] },
      extruded: true,
      wireframe: true,
      filled: true,
      getElevation: (f) => (f.properties.elevation_m || 5) * 2,
      getFillColor: [34, 197, 94, 210], // green with alpha
      getLineColor: [255, 255, 255, 230], // crisp white wireframe edges
      lineWidthMinPixels: 1,
      pickable: true,
      autoHighlight: true,
      highlightColor: [234, 179, 8, 220], // amber highlight
    }),
  ];

  return (
    <div className="w-full h-full min-h-[500px] absolute inset-0 rounded-none overflow-hidden bg-[#071324]">
      {/* Legend & Controls Caption */}
      <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-10 bg-[#0c1e36]/90 backdrop-blur-xs rounded-none px-3 py-2 border border-slate-700 max-w-[85vw] sm:max-w-md shadow-md text-white">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 bg-emerald-400 inline-block" />
          <span className="text-xs font-bold uppercase tracking-wider">3D Digital Elevation Model (DSM)</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-tight">
          Satellite ground plane + AI building extrusions. Drag mouse to rotate/pitch camera, scroll to zoom.
        </p>
      </div>

      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        getTooltip={({ object }) => {
          if (!object) return null;
          return {
            html: `
              <div style="padding: 6px 10px; font-size: 12px; font-family: 'IBM Plex Sans', sans-serif;">
                <strong>${object.properties.building_id}</strong><br/>
                Estimated Height: ${object.properties.elevation_m}m
              </div>
            `,
            style: {
              backgroundColor: '#0f2145',
              color: '#fff',
              borderRadius: '6px',
              border: '1px solid #142d5e',
            },
          };
        }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Dark base map for better 3D contrast */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #0a1628 0%, #142d5e 100%)',
            zIndex: -1,
          }}
        />
      </DeckGL>
    </div>
  );
};

export default ElevationView;
