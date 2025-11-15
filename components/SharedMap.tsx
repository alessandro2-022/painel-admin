import React, { useState, useEffect, useCallback, useRef } from 'react';
import Map, { Marker, Source, Layer, useMap } from 'react-map-gl';
import type { MapRef } from 'react-map-gl';
// FIX: Import GeoJSON types for Feature and LineString to resolve namespace errors.
import type { Feature, LineString } from 'geojson';
import * as turf from '@turf/turf';
import { SharedMapMarker, SharedMapRoute, DriverStatus } from '../types.ts';

// FIX: Get Mapbox access token from environment variable.
// If NX_MAPBOX_ACCESS_TOKEN is not set, a placeholder will be used.
// IT IS CRUCIAL TO REPLACE THIS PLACEHOLDER WITH A VALID MAPBOX ACCESS TOKEN
// SET AS AN ENVIRONMENT VARIABLE (e.g., in a .env file or deployment configuration)
// FOR PRODUCTION DEPLOYMENTS.
const mapboxAccessToken = process.env.NX_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoicGxvdHJvbmljIiwiYSI6ImNsdWk2eXh6YjF3aGMyam82dXoyYTM2MmEifQ.W741T1P9-K4z5L-5w534xQ';

// Interface for styling marker status borders
interface DriverMarkerStyleProps {
  status?: DriverStatus;
  isSelected?: boolean;
}

interface SharedMapProps {
  center: { lat: number; lng: number };
  markers?: SharedMapMarker[];
  selectedMarkerId?: number | string | null;
  onMarkerClick?: (markerId: number | string) => void;
  // FIX: Use imported GeoJSON types directly.
  routeGeoJson?: Feature<LineString> | null;
  children?: React.ReactNode; // To allow tooltips or other elements to be rendered on top
}

const getMarkerBorderColor = (status?: DriverStatus, isSelected?: boolean) => {
  if (isSelected) return '#0057b8'; // Highlight color when selected
  switch (status) {
    case 'on_trip':
      return '#3b82f6'; // blue-500
    case 'online':
      return '#22c55e'; // green-500
    case 'offline':
    default:
      return '#cbd5e1'; // slate-300
  }
};

export function SharedMap({
  center,
  markers = [],
  selectedMarkerId = null,
  onMarkerClick,
  routeGeoJson,
  children,
}: SharedMapProps) {
  // FIX: Imported useRef from 'react'.
  const mapRef = useRef<MapRef | null>(null);

  const [viewState, setViewState] = useState({
    longitude: center.lng,
    latitude: center.lat,
    zoom: 14,
    bearing: 0,
    pitch: 0,
    padding: {top: 0, bottom: 0, left: 0, right: 0} // Default padding
  });

  useEffect(() => {
    // Update viewState when center prop changes
    setViewState(prev => ({
      ...prev,
      longitude: center.lng,
      latitude: center.lat,
    }));
  }, [center]);

  // Fit map to markers if they exist
  useEffect(() => {
    if (markers.length > 0 && mapRef.current) {
      const allCoords = markers.map(marker => [marker.lng, marker.lat]);
      const bounds = turf.bbox(turf.featureCollection(allCoords.map(coord => turf.point(coord))));
      
      const [minLng, minLat, maxLng, maxLat] = bounds;

      mapRef.current.fitBounds(
        [[minLng, minLat], [maxLng, maxLat]],
        { padding: 80, duration: 1000 } // Add padding around markers
      );
    }
  }, [markers]);


  if (!mapboxAccessToken) {
    console.error("NX_MAPBOX_ACCESS_TOKEN environment variable is not set. Mapbox may not load correctly.");
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-red-500">
        <p>Erro: Chave de acesso do Mapbox não configurada.</p>
      </div>
    );
  }

  const handleMapLoad = useCallback(() => {
    if (mapRef.current && markers.length > 0) {
      // Re-fit bounds after the map has fully loaded, if markers exist
      const allCoords = markers.map(marker => [marker.lng, marker.lat]);
      const bounds = turf.bbox(turf.featureCollection(allCoords.map(coord => turf.point(coord))));
      const [minLng, minLat, maxLng, maxLat] = bounds;
      mapRef.current.fitBounds(
        [[minLng, minLat], [maxLng, maxLat]],
        { padding: 80, duration: 0 }
      );
    }
  }, [markers]);

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxAccessToken}
        initialViewState={viewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/contatogolybrasil/cluztcv6q00j401p5gbcgd1s6" // Using your custom style URL
        onMove={evt => setViewState(evt.viewState)}
        onLoad={handleMapLoad}
      >
        {markers.map(marker => {
          const isSelected = marker.id === selectedMarkerId;
          const borderColor = getMarkerBorderColor(marker.status, isSelected);

          return (
            <Marker
              key={marker.id}
              longitude={marker.lng}
              latitude={marker.lat}
              anchor="center"
              onClick={e => {
                e.originalEvent.stopPropagation(); // Prevent map click event
                if (onMarkerClick) onMarkerClick(marker.id);
              }}
            >
              <button
                className="p-0.5 rounded-full cursor-pointer transition-all duration-200"
                // FIX: Use marker.name property directly since it's now part of SharedMapMarker.
                title={`${marker.name || marker.id}`}
                aria-label={`Ver detalhes do motorista ${marker.name || marker.id}`}
              >
                <img
                  src={marker.avatarUrl || `https://robohash.org/${marker.id}.png?size=50x50&set=set1`}
                  alt={`Marker ${marker.id}`}
                  className={`w-8 h-8 rounded-full border-2 shadow-md transition-all duration-200`}
                  style={{ borderColor: borderColor, outline: isSelected ? '2px solid #0057b8' : 'none', outlineOffset: '2px' }}
                />
              </button>
            </Marker>
          );
        })}

        {routeGeoJson && (
          <Source id="route-data" type="geojson" data={routeGeoJson}>
            <Layer
              id="route-line"
              type="line"
              layout={{
                'line-join': 'round',
                'line-cap': 'round',
              }}
              paint={{
                'line-color': '#0057b8',
                'line-width': 6,
                'line-opacity': 0.75,
              }}
            />
          </Source>
        )}
        {children}
      </Map>
    </div>
  );
}