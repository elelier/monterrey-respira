import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IoLocationSharp, IoLocateSharp, IoLayersOutline, IoExpand, IoContract } from 'react-icons/io5';
import { AirQualityData } from '../types';
import { useAirQuality } from '../context/AirQualityContext';

// Fix the Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// We'll use a simplified approach that doesn't rely on react-leaflet
// to avoid the context consumer errors

interface StationMapProps {
  data: AirQualityData;
  className?: string;
}

export default function StationMap({ data, className = '' }: StationMapProps) {
  const { theme } = useAirQuality();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite'>('standard');
  const [isLocating, setIsLocating] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const stationMarkerRef = useRef<L.Marker | null>(null);

  // Get map color based on AQI
  const getAQIColor = () => {
    if (!theme) return '#3b82f6';

    switch (theme.primary) {
      case '#4ade80': return '#4ade80';
      case '#fbbf24': return '#fbbf24';
      case '#fb923c': return '#fb923c';
      case '#f87171': return '#f87171';
      case '#c084fc': return '#c084fc';
      case '#9f1239': return '#9f1239';
      default: return '#3b82f6';
    }
  };

  // Initialize the map after the component is mounted
  useEffect(() => {
    if (mapRef.current && !leafletMapRef.current) {
      // Fix Leaflet default icon
      L.Marker.prototype.options.icon = L.icon({
        iconUrl: icon,
        shadowUrl: iconShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      // Create map instance
      const map = L.map(mapRef.current).setView(
        [data.location.latitude, data.location.longitude],
        12
      );

      // Add tile layer
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Create AQI marker icon
      const markerIcon = L.divIcon({
        className: 'custom-aqi-marker',
        html: `<div style="background-color: ${getAQIColor()}; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${data.aqi}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      // Add station marker
      const stationMarker = L.marker(
        [data.location.latitude, data.location.longitude],
        { icon: markerIcon }
      ).addTo(map);

      // Add popup to station marker
      stationMarker.bindPopup(`
        <div class="text-center">
          <h3 class="font-bold text-sm">${data.location.name}</h3>
          <p class="text-sm">AQI: <span class="font-bold">${data.aqi}</span></p>
          <p class="text-xs text-gray-600">Lat: ${data.location.latitude.toFixed(4)}, Long: ${data.location.longitude.toFixed(4)}</p>
        </div>
      `);

      // Add zoom control
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Store references
      leafletMapRef.current = map;
      stationMarkerRef.current = stationMarker;
      setMapInitialized(true);

      // Clean up function
      return () => {
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }
      };
    }
  }, []);

  // Update marker when AQI changes
  useEffect(() => {
    if (leafletMapRef.current && stationMarkerRef.current && mapInitialized) {
      // Update marker icon with new AQI value
      const newIcon = L.divIcon({
        className: 'custom-aqi-marker',
        html: `<div style="background-color: ${getAQIColor()}; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${data.aqi}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      stationMarkerRef.current.setIcon(newIcon);

      // Update popup content
      stationMarkerRef.current.setPopupContent(`
        <div class="text-center">
          <h3 class="font-bold text-sm">${data.location.name}</h3>
          <p class="text-sm">AQI: <span class="font-bold">${data.aqi}</span></p>
          <p class="text-xs text-gray-600">Lat: ${data.location.latitude.toFixed(4)}, Long: ${data.location.longitude.toFixed(4)}</p>
        </div>
      `);
    }
  }, [data.aqi, theme]);

  // Update map style
  useEffect(() => {
    if (leafletMapRef.current && mapInitialized) {
      // Remove existing tile layer
      leafletMapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          leafletMapRef.current?.removeLayer(layer);
        }
      });

      // Add new tile layer based on selected style
      if (mapStyle === 'standard') {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(leafletMapRef.current);
      } else {
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }).addTo(leafletMapRef.current);
      }
    }
  }, [mapStyle, mapInitialized]);

  // Update map size when going fullscreen
  useEffect(() => {
    if (leafletMapRef.current && mapInitialized) {
      setTimeout(() => {
        leafletMapRef.current?.invalidateSize();
      }, 300);
    }
  }, [fullscreen, mapInitialized]);

  // Get user location
  const getUserLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);

        if (leafletMapRef.current) {
          // Pan map to user location
          leafletMapRef.current.setView([latitude, longitude], 13);

          // Add or update user marker
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            const userIcon = L.divIcon({
              className: 'custom-user-marker',
              html: `<div style="background-color: #3b82f6; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; justify-content: center; align-items: center; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path></svg></div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });

            const userMarker = L.marker([latitude, longitude], { icon: userIcon })
              .addTo(leafletMapRef.current)
              .bindPopup(`
                <div class="text-center">
                  <h3 class="font-bold text-sm">Tu ubicación</h3>
                  <p class="text-xs text-gray-600">Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}</p>
                </div>
              `);

            userMarkerRef.current = userMarker;
          }
        }

        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting user location:', error);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  // Handle map style toggle
  const toggleMapStyle = () => {
    setMapStyle(mapStyle === 'standard' ? 'satellite' : 'standard');
  };

  const getFullscreenStyles = fullscreen
    ? 'fixed top-0 left-0 right-0 bottom-0 z-50 rounded-none h-full'
    : `h-[300px] sm:h-[400px] ${className}`;

  return (
    <div className={`relative bg-white rounded-xl shadow-lg overflow-hidden dark:bg-slate-800 ${getFullscreenStyles}`}>
      {/* Map Header */}
      <div className="absolute top-0 left-0 right-0 px-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm z-[401] flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
          <IoLocationSharp className="mr-1 text-red-500" />
          {data.location.name}
        </h3>
        <div className="flex items-center space-x-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            onClick={toggleMapStyle}
            aria-label={mapStyle === 'standard' ? 'Cambiar a vista satelital' : 'Cambiar a vista estándar'}
          >
            <IoLayersOutline className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
          >
            {fullscreen
              ? <IoContract className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              : <IoExpand className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            }
          </motion.button>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="h-full w-full"
        aria-label="Mapa de estaciones de monitoreo"
      />

      {/* Attribution */}
      <div className="absolute bottom-1 left-1 z-[401] text-[9px] text-gray-600 dark:text-gray-400 px-1 rounded bg-white/70 dark:bg-black/30">
        © OpenStreetMap | MonterreyRespira
      </div>

      {/* Locate me button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        className={`absolute bottom-12 right-3 z-[401] p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600 ${isLocating ? 'animate-pulse' : ''}`}
        onClick={getUserLocation}
        disabled={isLocating}
        aria-label="Encontrar mi ubicación"
      >
        <IoLocateSharp className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      </motion.button>
    </div>
  );
}
