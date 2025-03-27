import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IoLocationSharp, IoLayersOutline, IoExpand, IoContract, IoOptions, IoFilterOutline } from 'react-icons/io5';
import { AirQualityData, Station } from '../types';
import { useAirQuality } from '../context/AirQualityContext';
import { getMonitoringStations } from '../services/apiService';
import { generateAdditionalMonitoringPoints } from '../utils/heatmapUtils';

// Fix the Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Interface and types
interface PollutantConcentrationMapProps {
  centralData: AirQualityData;
  className?: string;
}

type PollutantType = 'pm25' | 'pm10' | 'o3' | 'no2' | 'so2' | 'co';

export default function PollutantConcentrationMap({ centralData, className = '' }: PollutantConcentrationMapProps) {
  const { theme } = useAirQuality();
  const [fullscreen, setFullscreen] = useState(false);
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite'>('standard');
  const [pollutantType, setPollutantType] = useState<PollutantType>('pm25');
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState<Station[]>([]);

  // Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const circlesLayerRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const legendControlRef = useRef<L.Control | null>(null);

  // Get map color based on pollutant value
  const getPollutantColor = (value: number, type: PollutantType): string => {
    // Different color scales for different pollutants
    switch (type) {
      case 'pm25':
        if (value <= 12) return '#4ade80'; // Good
        if (value <= 35.4) return '#fbbf24'; // Moderate
        if (value <= 55.4) return '#fb923c'; // Unhealthy for sensitive groups
        if (value <= 150.4) return '#f87171'; // Unhealthy
        if (value <= 250.4) return '#c084fc'; // Very unhealthy
        return '#9f1239'; // Hazardous

      case 'pm10':
        if (value <= 54) return '#4ade80';
        if (value <= 154) return '#fbbf24';
        if (value <= 254) return '#fb923c';
        if (value <= 354) return '#f87171';
        if (value <= 424) return '#c084fc';
        return '#9f1239';

      case 'o3':
        if (value <= 54) return '#4ade80';
        if (value <= 124) return '#fbbf24';
        if (value <= 164) return '#fb923c';
        if (value <= 204) return '#f87171';
        if (value <= 404) return '#c084fc';
        return '#9f1239';

      case 'no2':
        if (value <= 53) return '#4ade80';
        if (value <= 100) return '#fbbf24';
        if (value <= 360) return '#fb923c';
        if (value <= 649) return '#f87171';
        if (value <= 1249) return '#c084fc';
        return '#9f1239';

      case 'so2':
        if (value <= 35) return '#4ade80';
        if (value <= 75) return '#fbbf24';
        if (value <= 185) return '#fb923c';
        if (value <= 304) return '#f87171';
        if (value <= 604) return '#c084fc';
        return '#9f1239';

      case 'co':
        if (value <= 4.4) return '#4ade80';
        if (value <= 9.4) return '#fbbf24';
        if (value <= 12.4) return '#fb923c';
        if (value <= 15.4) return '#f87171';
        if (value <= 30.4) return '#c084fc';
        return '#9f1239';

      default:
        return '#4ade80';
    }
  };

  // Get info for pollutant
  const getPollutantInfo = (type: PollutantType): { name: string; unit: string; description: string } => {
    switch (type) {
      case 'pm25':
        return {
          name: 'Partículas PM2.5',
          unit: 'µg/m³',
          description: 'Partículas finas con diámetro de 2.5 micrómetros o menos. Pueden penetrar profundamente en los pulmones y el torrente sanguíneo.'
        };
      case 'pm10':
        return {
          name: 'Partículas PM10',
          unit: 'µg/m³',
          description: 'Partículas inhalables con diámetro de 10 micrómetros o menos. Pueden causar problemas respiratorios.'
        };
      case 'o3':
        return {
          name: 'Ozono (O₃)',
          unit: 'ppb',
          description: 'Gas que se forma por reacciones químicas entre óxidos de nitrógeno y compuestos orgánicos volátiles en presencia de luz solar.'
        };
      case 'no2':
        return {
          name: 'Dióxido de Nitrógeno (NO₂)',
          unit: 'ppb',
          description: 'Gas tóxico formado principalmente por la quema de combustibles. Contribuye a la formación de smog y lluvia ácida.'
        };
      case 'so2':
        return {
          name: 'Dióxido de Azufre (SO₂)',
          unit: 'ppb',
          description: 'Gas producido por la quema de combustibles fósiles con azufre. Puede causar problemas respiratorios y lluvia ácida.'
        };
      case 'co':
        return {
          name: 'Monóxido de Carbono (CO)',
          unit: 'ppm',
          description: 'Gas inodoro producido por la combustión incompleta. Reduce la capacidad de la sangre para transportar oxígeno.'
        };
      default:
        return {
          name: 'Partículas PM2.5',
          unit: 'µg/m³',
          description: 'Partículas finas con diámetro de 2.5 micrómetros o menos.'
        };
    }
  };

  // Initialize map on mount
  useEffect(() => {
    if (mapRef.current && !leafletMapRef.current) {
      // Fix default icon issue
      L.Marker.prototype.options.icon = L.icon({
        iconUrl: icon,
        shadowUrl: iconShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      // Create map
      const map = L.map(mapRef.current, {
        center: [centralData.location.latitude, centralData.location.longitude],
        zoom: 11,
        zoomControl: false,
      });

      // Add base map layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add zoom control
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Create layers for circles and markers
      const circlesLayer = L.layerGroup().addTo(map);
      const markersLayer = L.layerGroup().addTo(map);

      circlesLayerRef.current = circlesLayer;
      markersLayerRef.current = markersLayer;

      // Create legend control
      const legend = new L.Control({ position: 'bottomleft' });
      legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'info legend bg-white/90 dark:bg-slate-800/90 p-2 rounded-md shadow-md');
        div.innerHTML = createLegendContent(pollutantType);
        return div;
      };
      legend.addTo(map);
      legendControlRef.current = legend;

      // Store map reference
      leafletMapRef.current = map;

      // Load data
      loadStationsData();
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [centralData.location.latitude, centralData.location.longitude]);

  // Update visualization when pollution type changes
  useEffect(() => {
    if (legendControlRef.current && leafletMapRef.current) {
      // Update legend content
      const legendDiv = legendControlRef.current.getContainer();
      if (legendDiv) {
        legendDiv.innerHTML = createLegendContent(pollutantType);
      }
    }

    // Update visualization
    if (stations.length > 0) {
      updateVisualization();
    }
  }, [pollutantType, stations, mapStyle]);

  // Update map style
  useEffect(() => {
    if (leafletMapRef.current) {
      // Remove existing tile layers
      leafletMapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          leafletMapRef.current?.removeLayer(layer);
        }
      });

      // Add new tile layer
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

  // Handle fullscreen changes
  useEffect(() => {
    if (leafletMapRef.current) {
      setTimeout(() => {
        leafletMapRef.current?.invalidateSize();
      }, 300);
    }
  }, [fullscreen]);

  // Create legend HTML content
  const createLegendContent = (type: PollutantType): string => {
    const info = getPollutantInfo(type);
    let html = `<div class="text-xs font-medium mb-1">${info.name} (${info.unit})</div>`;

    // Define thresholds and labels for each pollutant
    let thresholds: [number, string][] = [];

    switch (type) {
      case 'pm25':
        thresholds = [
          [0, '0-12 - Buena'],
          [12.1, '12.1-35.4 - Moderada'],
          [35.5, '35.5-55.4 - Insalubre SG'],
          [55.5, '55.5-150.4 - Insalubre'],
          [150.5, '150.5-250.4 - Muy insalubre'],
          [250.5, '250.5+ - Peligrosa']
        ];
        break;
      case 'pm10':
        thresholds = [
          [0, '0-54 - Buena'],
          [55, '55-154 - Moderada'],
          [155, '155-254 - Insalubre SG'],
          [255, '255-354 - Insalubre'],
          [355, '355-424 - Muy insalubre'],
          [425, '425+ - Peligrosa']
        ];
        break;
      // Similar thresholds for other pollutants would go here
      default:
        thresholds = [
          [0, 'Buena'],
          [50, 'Moderada'],
          [100, 'Insalubre SG'],
          [150, 'Insalubre'],
          [200, 'Muy insalubre'],
          [300, 'Peligrosa']
        ];
    }

    // Create legend entries - using for-of loop instead of for loop
    for (const [value, label] of thresholds) {
      const color = getPollutantColor(value, type);

      html += `
        <div class="flex items-center mb-1">
          <div class="w-3 h-3 rounded-full mr-1" style="background-color: ${color}"></div>
          <span class="text-xs">${label}</span>
        </div>
      `;
    }

    return html;
  };

  // Load station data
  const loadStationsData = async () => {
    setLoading(true);
    try {
      // Get base station data
      const baseStations = await getMonitoringStations();

      // Get additional simulated stations
      const additionalStations = generateAdditionalMonitoringPoints();

      // Combine all stations
      const allStations = [...baseStations, ...additionalStations];
      setStations(allStations);

      // Update visualization
      updateVisualization(allStations);

      setLoading(false);
    } catch (error) {
      console.error('Error loading station data:', error);
      setLoading(false);
    }
  };

  // Update visualization based on pollutant type
  const updateVisualization = (stationsData = stations) => {
    if (!leafletMapRef.current || !circlesLayerRef.current) return;

    // Clear existing layers
    circlesLayerRef.current.clearLayers();
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    // Create circles for each station
    stationsData.forEach(station => {
      // Get pollutant value (simulated based on AQI)
      let value: number;
      switch (pollutantType) {
        case 'pm25':
          value = station.aqi * 0.4;
          break;
        case 'pm10':
          value = station.aqi * 0.6;
          break;
        case 'o3':
          value = station.aqi * 0.3;
          break;
        case 'no2':
          value = station.aqi * 0.2;
          break;
        case 'so2':
          value = station.aqi * 0.1;
          break;
        case 'co':
          value = station.aqi * 0.05;
          break;
        default:
          value = station.aqi * 0.4;
      }

      // Get color based on pollutant value
      const color = getPollutantColor(value, pollutantType);

      // Calculate radius - higher values = larger circles
      const baseRadius = Math.max(500, Math.min(2000, value * 50));

      // Create circle
      const circle = L.circle([station.latitude, station.longitude], {
        radius: baseRadius,
        color: color,
        fillColor: color,
        fillOpacity: 0.5,
        weight: 1
      }).addTo(circlesLayerRef.current!);

      // Add popup with info
      const info = getPollutantInfo(pollutantType);
      circle.bindPopup(`
        <div class="text-center">
          <h3 class="font-bold text-sm">${station.name}</h3>
          <p class="text-sm">${info.name}: <span class="font-bold">${value.toFixed(1)} ${info.unit}</span></p>
          <p class="text-xs text-gray-600">AQI: ${station.aqi}</p>
        </div>
      `);

      // Create station marker
      if (markersLayerRef.current) {
        const markerIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${color}; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; justify-content: center; align-items: center; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${Math.round(value)}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([station.latitude, station.longitude], { icon: markerIcon })
          .bindPopup(`
            <div class="text-center">
              <h3 class="font-bold text-sm">${station.name}</h3>
              <p class="text-sm">${info.name}: <span class="font-bold">${value.toFixed(1)} ${info.unit}</span></p>
              <p class="text-xs text-gray-600">AQI: ${station.aqi}</p>
            </div>
          `);

        markersLayerRef.current.addLayer(marker);
      }
    });
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  // Toggle map style
  const toggleMapStyle = () => {
    setMapStyle(mapStyle === 'standard' ? 'satellite' : 'standard');
  };

  // Set pollutant type
  const setPollutantTypeHandler = (type: PollutantType) => {
    setPollutantType(type);
  };

  // Get styles for fullscreen/normal view
  const getFullscreenStyles = fullscreen
    ? 'fixed top-0 left-0 right-0 bottom-0 z-50 rounded-none h-full'
    : `h-[400px] sm:h-[500px] ${className}`;

  return (
    <div className={`relative bg-white rounded-xl shadow-lg overflow-hidden dark:bg-slate-800 ${getFullscreenStyles}`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 px-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm z-[401] flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
          <IoLocationSharp className="mr-1 text-red-500" />
          <span className="hidden sm:inline">Concentración de Contaminantes</span>
          <span className="sm:hidden">Concentración</span>
        </h3>
        <div className="flex items-center space-x-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            onClick={() => setShowOptions(!showOptions)}
            aria-label="Opciones"
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

      {/* Options panel */}
      {showOptions && (
        <div className="absolute top-14 right-0 w-[250px] p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm z-[401] border border-gray-200 dark:border-gray-700 rounded-bl-md shadow-lg">
          <h4 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">Tipo de contaminante</h4>
          <div className="flex flex-col space-y-1 text-sm">
            <button
              onClick={() => setPollutantTypeHandler('pm25')}
              className={`px-3 py-1 rounded-full text-xs text-left flex items-center ${pollutantType === 'pm25' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              <IoFilterOutline className="mr-1.5 flex-shrink-0" />
              <span>Partículas PM2.5</span>
            </button>
            <button
              onClick={() => setPollutantTypeHandler('pm10')}
              className={`px-3 py-1 rounded-full text-xs text-left flex items-center ${pollutantType === 'pm10' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              <IoFilterOutline className="mr-1.5 flex-shrink-0" />
              <span>Partículas PM10</span>
            </button>
            <button
              onClick={() => setPollutantTypeHandler('o3')}
              className={`px-3 py-1 rounded-full text-xs text-left flex items-center ${pollutantType === 'o3' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              <IoFilterOutline className="mr-1.5 flex-shrink-0" />
              <span>Ozono (O₃)</span>
            </button>
            <button
              onClick={() => setPollutantTypeHandler('no2')}
              className={`px-3 py-1 rounded-full text-xs text-left flex items-center ${pollutantType === 'no2' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              <IoFilterOutline className="mr-1.5 flex-shrink-0" />
              <span>Dióxido de Nitrógeno (NO₂)</span>
            </button>
            <button
              onClick={() => setPollutantTypeHandler('so2')}
              className={`px-3 py-1 rounded-full text-xs text-left flex items-center ${pollutantType === 'so2' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              <IoFilterOutline className="mr-1.5 flex-shrink-0" />
              <span>Dióxido de Azufre (SO₂)</span>
            </button>
            <button
              onClick={() => setPollutantTypeHandler('co')}
              className={`px-3 py-1 rounded-full text-xs text-left flex items-center ${pollutantType === 'co' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              <IoFilterOutline className="mr-1.5 flex-shrink-0" />
              <span>Monóxido de Carbono (CO)</span>
            </button>
          </div>

          <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-700/50 rounded text-xs text-gray-600 dark:text-gray-300">
            <p><strong>Acerca de este mapa:</strong></p>
            <p className="mt-1">{getPollutantInfo(pollutantType).description}</p>
          </div>
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapRef}
        className="h-full w-full"
        aria-label="Mapa de concentración de contaminantes"
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
