import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { IoLocationSharp, IoLayersOutline, IoExpand, IoContract, IoOptions, IoInformationCircleOutline } from 'react-icons/io5';
import { AirQualityData, Station } from '../types';
import { useAirQuality } from '../context/AirQualityContext';
import { /* getMonitoringStations, */ } from '../services/apiService'; // {{ highlight-line }}
import { generateHeatmapGrid, generateAdditionalMonitoringPoints } from '../utils/heatmapUtils';

// Fix the Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

interface AirQualityHeatmapProps {
  centralData: AirQualityData;
  className?: string;
}

export default function AirQualityHeatmap({ centralData, className = '' }: AirQualityHeatmapProps) {
  const { theme } = useAirQuality();
  const [fullscreen, setFullscreen] = useState(false);
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite'>('standard');
  const [heatmapType, setHeatmapType] = useState<'aqi' | 'pm25' | 'pm10'>('aqi');
  const [showStations, setShowStations] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [heatmapIntensity, setHeatmapIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [stations, setStations] = useState<Station[]>([]);

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<L.HeatLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const legendControlRef = useRef<L.Control | null>(null);

  // Get map color based on AQI
  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#4ade80'; // Good - green
    if (aqi <= 100) return '#fbbf24'; // Moderate - yellow
    if (aqi <= 150) return '#fb923c'; // Unhealthy for sensitive groups - orange
    if (aqi <= 200) return '#f87171'; // Unhealthy - red
    if (aqi <= 300) return '#c084fc'; // Very unhealthy - purple
    return '#9f1239'; // Hazardous - maroon
  };

  // Get radius based on AQI value (higher AQI = larger radius)
  const getRadiusForAQI = (aqi: number) => {
    return Math.max(20, Math.min(50, aqi / 4));
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
      const map = L.map(mapRef.current, {
        center: [centralData.location.latitude, centralData.location.longitude],
        zoom: 11,
        zoomControl: false,
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add zoom control
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Create markers layer group
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      // Store map reference
      leafletMapRef.current = map;

      // Create legend control
      const legend = new L.Control({ position: 'bottomleft' });
      legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'info legend bg-white/90 dark:bg-slate-800/90 p-2 rounded-md shadow-md');
        const grades = [0, 50, 100, 150, 200, 300];
        const labels = ['Buena', 'Moderada', 'Insalubre para grupos sensibles', 'Insalubre', 'Muy insalubre', 'Peligrosa'];
        let html = '<div class="text-xs font-medium mb-1">Calidad del aire</div>';

        for (let i = 0; i < grades.length; i++) {
          html += `
            <div class="flex items-center mb-1">
              <div class="w-3 h-3 rounded-full mr-1" style="background-color: ${getAQIColor(grades[i] + 1)}"></div>
              <span class="text-xs">${grades[i]}${grades[i + 1] ? '–' + (grades[i + 1] - 1) : '+'} - ${labels[i]}</span>
            </div>
          `;
        }

        div.innerHTML = html;
        return div;
      };
      legend.addTo(map);
      legendControlRef.current = legend;

      // Load stations and create heatmap
      loadStationsAndCreateHeatmap();

      // Clean up function
      return () => {
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }
      };
    }
  }, [centralData.location.latitude, centralData.location.longitude]);

  // Update map style
  useEffect(() => {
    if (leafletMapRef.current) {
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
  }, [mapStyle]);

  // Update map size when going fullscreen
  useEffect(() => {
    if (leafletMapRef.current) {
      setTimeout(() => {
        leafletMapRef.current?.invalidateSize();
      }, 300);
    }
  }, [fullscreen]);

  // Update heatmap when type changes
  useEffect(() => {
    if (leafletMapRef.current && stations.length > 0) {
      createHeatmap(stations);
    }
  }, [heatmapType, heatmapIntensity, stations]);

  // Update station markers visibility
  useEffect(() => {
    if (markersLayerRef.current) {
      if (showStations) {
        markersLayerRef.current.addTo(leafletMapRef.current!);
      } else {
        markersLayerRef.current.remove();
      }
    }
  }, [showStations]);

  // Load stations data and create heatmap
  const loadStationsAndCreateHeatmap = async () => {
    setLoading(true);
    try {
      // Get base monitoring stations from API/mock data
      // const baseStations = await /* getMonitoringStations, */(); // {{ highlight-line }}

      // Get additional simulated monitoring points
      const additionalStations = generateAdditionalMonitoringPoints();

      // Combine all stations for a richer dataset
      const allStations = [...additionalStations]; // {{ highlight-line }}
      setStations(allStations);

      // Create the visual representation
      createHeatmap(allStations);

      setLoading(false);
    } catch (error) {
      console.error('Error loading stations:', error);
      setLoading(false);
    }
  };

  // Create heatmap visualization with the provided stations
  const createHeatmap = (stations: Station[]) => {
    if (!leafletMapRef.current) return;

    // Clear existing markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    // Create station markers
    if (showStations && markersLayerRef.current) {
      stations.forEach(station => {
        const markerIcon = L.divIcon({
          className: 'custom-aqi-marker',
          html: `<div style="background-color: ${getAQIColor(station.aqi)}; color: white; border-radius: 50%; width: 36px; height: 36px; display: flex; justify-content: center; align-items: center; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${Math.round(station.aqi)}</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([station.latitude, station.longitude], { icon: markerIcon })
          .bindPopup(`
            <div class="text-center">
              <h3 class="font-bold text-sm">${station.name}</h3>
              <p class="text-sm">AQI: <span class="font-bold">${station.aqi}</span></p>
              <p class="text-xs text-gray-600">
                PM2.5: ${Math.round(station.aqi * 0.4)} µg/m³<br>
                PM10: ${Math.round(station.aqi * 0.6)} µg/m³
              </p>
            </div>
          `);

        // Fix for TypeScript error - add additional check for non-null value
        markersLayerRef.current?.addLayer(marker);
      });
    }

    // Generate a detailed grid of points for the heatmap
    const gridPoints = generateHeatmapGrid(stations, heatmapType);

    // Remove existing heat layer if it exists
    if (heatLayerRef.current) {
      leafletMapRef.current.removeLayer(heatLayerRef.current);
    }

    // Configure heatmap parameters based on user selection
    let radius: number;
    let blur: number;
    let maxZoom: number;
    let minOpacity: number;

    switch (heatmapIntensity) {
      case 'low':
        radius = 15;
        blur = 10;
        maxZoom = 13;
        minOpacity = 0.35;
        break;
      case 'high':
        radius = 25;
        blur = 15;
        maxZoom = 18;
        minOpacity = 0.2;
        break;
      default: // medium
        radius = 20;
        blur = 12;
        maxZoom = 15;
        minOpacity = 0.25;
    }

    // Create custom gradient based on the air quality statuses
    const gradient = {
      0.0: '#4ade80', // Good - green
      0.3: '#fbbf24', // Moderate - yellow
      0.5: '#fb923c', // Unhealthy for sensitive groups - orange
      0.7: '#f87171', // Unhealthy - red
      0.9: '#c084fc', // Very unhealthy - purple
      1.0: '#9f1239'  // Hazardous - maroon
    };

    // Create new heat layer with generated points and improved settings
    const heat = (L as any).heatLayer(gridPoints, {
      radius,
      blur,
      maxZoom,
      minOpacity,
      gradient,
      // Increase max value for better color distribution
      max: 100
    }).addTo(leafletMapRef.current);

    heatLayerRef.current = heat;
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  // Handle map style toggle
  const toggleMapStyle = () => {
    setMapStyle(mapStyle === 'standard' ? 'satellite' : 'standard');
  };

  // Heatmap type selector
  const setHeatmapTypeHandler = (type: 'aqi' | 'pm25' | 'pm10') => {
    setHeatmapType(type);
  };

  // Set heatmap intensity
  const setHeatmapIntensityHandler = (intensity: 'low' | 'medium' | 'high') => {
    setHeatmapIntensity(intensity);
  };

  const getFullscreenStyles = fullscreen
    ? 'fixed top-0 left-0 right-0 bottom-0 z-50 rounded-none h-full'
    : `h-[400px] sm:h-[500px] ${className}`;

  return (
    <div className={`relative bg-white rounded-xl shadow-lg overflow-hidden dark:bg-slate-800 ${getFullscreenStyles}`}>
      {/* Map Header */}
      <div className="absolute top-0 left-0 right-0 px-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm z-[401] flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
          <IoLocationSharp className="mr-1 text-red-500" />
          <span className="hidden sm:inline">Mapa de calidad del aire</span>
          <span className="sm:hidden">Calidad del aire</span>
        </h3>
        <div className="flex items-center space-x-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            onClick={() => setShowInfo(!showInfo)}
            aria-label="Mostrar información del mapa"
          >
            <IoInformationCircleOutline className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            aria-label="Opciones de mapa"
          >
            <IoOptions className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </motion.button>
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

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute top-14 left-0 right-0 p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm z-[401] border-b border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Este mapa de calor muestra la distribución de la contaminación del aire en la zona metropolitana de Monterrey.
            Las zonas más rojas y moradas indican mayor contaminación, mientras que las zonas verdes representan mejor calidad del aire.
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            <strong>Nota:</strong> Los datos mostrados son simulados con fines demostrativos. En una implementación real,
            se obtendrían datos en tiempo real de estaciones de monitoreo.
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            <strong>Interpretación:</strong> El mapa muestra datos de monitoreo combinados con interpolación espacial para estimar la
            calidad del aire en áreas sin estaciones. Las zonas industriales y de alto tráfico suelen presentar mayor contaminación.
          </p>
        </div>
      )}

      {/* Options Panel */}
      {isOptionsOpen && (
        <div className="absolute top-14 right-0 w-[250px] p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm z-[401] border border-gray-200 dark:border-gray-700 rounded-bl-md shadow-lg">
          <div className="mb-3">
            <h4 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">Tipo de visualización</h4>
            <div className="flex flex-col space-y-1 text-sm">
              <button
                onClick={() => setHeatmapTypeHandler('aqi')}
                className={`px-3 py-1 rounded-full text-xs text-left ${heatmapType === 'aqi' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                Índice de Calidad del Aire (AQI)
              </button>
              <button
                onClick={() => setHeatmapTypeHandler('pm25')}
                className={`px-3 py-1 rounded-full text-xs text-left ${heatmapType === 'pm25' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                Partículas PM2.5
              </button>
              <button
                onClick={() => setHeatmapTypeHandler('pm10')}
                className={`px-3 py-1 rounded-full text-xs text-left ${heatmapType === 'pm10' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                Partículas PM10
              </button>
            </div>
          </div>

          <div className="mb-3">
            <h4 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">Intensidad del mapa</h4>
            <div className="flex flex-col space-y-1 text-sm">
              <button
                onClick={() => setHeatmapIntensityHandler('low')}
                className={`px-3 py-1 rounded-full text-xs text-left ${heatmapIntensity === 'low' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                Baja intensidad
              </button>
              <button
                onClick={() => setHeatmapIntensityHandler('medium')}
                className={`px-3 py-1 rounded-full text-xs text-left ${heatmapIntensity === 'medium' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                Intensidad media
              </button>
              <button
                onClick={() => setHeatmapIntensityHandler('high')}
                className={`px-3 py-1 rounded-full text-xs text-left ${heatmapIntensity === 'high' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                Alta intensidad
              </button>
            </div>
          </div>

          <div className="mb-3">
            <h4 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">Opciones de mapa</h4>
            <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300">
              <span>Mostrar estaciones</span>
              <div
                className={`relative inline-flex h-5 w-10 items-center rounded-full cursor-pointer transition-colors ${showStations ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                onClick={() => setShowStations(!showStations)}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showStations ? 'translate-x-5' : 'translate-x-1'}`}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Leyenda</h4>
            <div className="grid grid-cols-2 gap-1">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1 bg-green-500"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">Buena</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1 bg-yellow-500"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">Moderada</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1 bg-orange-500"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">Insalubre S.G.</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1 bg-red-500"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">Insalubre</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1 bg-purple-500"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">Muy insalubre</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1 bg-rose-700"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">Peligrosa</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapRef}
        className="h-full w-full"
        aria-label="Mapa de calor de calidad del aire"
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-black/50 flex items-center justify-center z-[402]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">Cargando datos...</p>
          </div>
        </div>
      )}

      {/* Attribution */}
      <div className="absolute bottom-1 left-1 z-[401] text-[9px] text-gray-600 dark:text-gray-400 px-1 rounded bg-white/70 dark:bg-black/30">
        © OpenStreetMap | MonterreyRespira
      </div>
    </div>
  );
}
