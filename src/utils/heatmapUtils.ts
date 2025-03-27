import { Station } from '../types';
import { MONTERREY_LOCATIONS } from '../services/apiService';

// Coordinates for the metropolitan area of Monterrey for bounding
const MONTERREY_BOUNDS = {
  north: 25.85, // Northmost latitude
  south: 25.55, // Southmost latitude
  east: -100.10, // Eastmost longitude
  west: -100.50, // Westmost longitude
};

// Additional areas with simulated characteristics
const SIMULATED_AREAS = [
  // Industrial zones (higher pollution)
  {
    name: 'Zona Industrial Norte',
    latitude: 25.765,
    longitude: -100.265,
    radius: 0.03,
    pollutionFactor: 1.5,
    description: 'Área industrial con concentración de fábricas y alto tráfico de vehículos pesados'
  },
  {
    name: 'Corredor Industrial Apodaca',
    latitude: 25.785,
    longitude: -100.180,
    radius: 0.04,
    pollutionFactor: 1.6,
    description: 'Zona con gran densidad de naves industriales y tráfico constante'
  },
  {
    name: 'Zona Industrial Santa Catarina',
    latitude: 25.675,
    longitude: -100.470,
    radius: 0.025,
    pollutionFactor: 1.4,
    description: 'Área industrial con plantas manufactureras'
  },

  // High traffic areas (higher pollution)
  {
    name: 'Centro de Monterrey',
    latitude: 25.675,
    longitude: -100.310,
    radius: 0.02,
    pollutionFactor: 1.3,
    description: 'Centro urbano con alta concentración de tráfico y actividad comercial'
  },
  {
    name: 'Avenida Constitución',
    latitude: 25.675,
    longitude: -100.330,
    radius: 0.015,
    pollutionFactor: 1.35,
    description: 'Arteria principal con congestión vehicular frecuente'
  },
  {
    name: 'Gonzalitos',
    latitude: 25.695,
    longitude: -100.350,
    radius: 0.015,
    pollutionFactor: 1.32,
    description: 'Avenida con tráfico intenso en horas pico'
  },

  // Green/Cleaner areas (lower pollution)
  {
    name: 'Chipinque',
    latitude: 25.625,
    longitude: -100.360,
    radius: 0.04,
    pollutionFactor: 0.7,
    description: 'Área natural protegida con mejor calidad del aire'
  },
  {
    name: 'Parque La Huasteca',
    latitude: 25.650,
    longitude: -100.470,
    radius: 0.05,
    pollutionFactor: 0.6,
    description: 'Zona montañosa con vegetación y baja actividad urbana'
  },
  {
    name: 'Parque Fundidora',
    latitude: 25.685,
    longitude: -100.280,
    radius: 0.015,
    pollutionFactor: 0.9,
    description: 'Parque urbano que actúa como pulmón verde de la ciudad'
  },
];

// Arterial roads - create lines of higher pollution along major roads
const ARTERIAL_ROADS = [
  // Constitución (east-west)
  { start: [25.675, -100.370], end: [25.675, -100.250], width: 0.006, pollutionFactor: 1.25 },
  // Gonzalitos/Garza Sada (north-south)
  { start: [25.720, -100.350], end: [25.620, -100.310], width: 0.006, pollutionFactor: 1.3 },
  // Morones Prieto (east-west)
  { start: [25.662, -100.400], end: [25.662, -100.280], width: 0.005, pollutionFactor: 1.2 },
  // Revolución (north-south)
  { start: [25.710, -100.280], end: [25.645, -100.280], width: 0.005, pollutionFactor: 1.15 },
  // Leones (east-west)
  { start: [25.705, -100.400], end: [25.705, -100.340], width: 0.005, pollutionFactor: 1.2 },
  // Miguel Alemán (east-west, airport access)
  { start: [25.780, -100.280], end: [25.780, -100.180], width: 0.006, pollutionFactor: 1.3 },
  // Lázaro Cárdenas (east-west)
  { start: [25.640, -100.400], end: [25.640, -100.280], width: 0.006, pollutionFactor: 1.22 },
  // Lincoln (east-west)
  { start: [25.750, -100.400], end: [25.750, -100.300], width: 0.005, pollutionFactor: 1.25 },
];

/**
 * Generate a grid of points covering the Monterrey metropolitan area
 * to create a more detailed heatmap
 */
export const generateHeatmapGrid = (baseStations: Station[], pollutantType: 'aqi' | 'pm25' | 'pm10'): [number, number, number][] => {
  const points: [number, number, number][] = [];

  // Create a denser grid of points for better visualization
  const latStep = 0.005; // Higher density (approximately 500m)
  const lonStep = 0.005; // Higher density

  // Add more variance to the background
  for (let lat = MONTERREY_BOUNDS.south; lat <= MONTERREY_BOUNDS.north; lat += latStep) {
    for (let lon = MONTERREY_BOUNDS.west; lon <= MONTERREY_BOUNDS.east; lon += lonStep) {
      // Calculate base pollution level by distance-weighted average from stations
      let totalWeight = 0;
      let weightedValue = 0;

      // Influence from monitoring stations
      baseStations.forEach(station => {
        // Distance calculation (simplified)
        const distance = Math.sqrt(
          Math.pow(lat - station.latitude, 2) +
          Math.pow(lon - station.longitude, 2)
        );

        // Use inverse square distance weighting with stronger falloff
        // This ensures more pronounced "hotspots" around stations
        const weight = 1 / Math.max(0.0005, Math.pow(distance * 150, 2));
        totalWeight += weight;

        // Get appropriate value based on pollutant type
        let value: number;
        switch (pollutantType) {
          case 'pm25':
            value = station.aqi * 0.4; // Simulate PM2.5 value
            break;
          case 'pm10':
            value = station.aqi * 0.6; // Simulate PM10 value
            break;
          default:
            value = station.aqi;
        }

        weightedValue += value * weight;
      });

      // Initial base value from station measurements
      let baseValue = totalWeight > 0 ? weightedValue / totalWeight : 40;

      // Apply background variation - create some natural patterns
      // This helps avoid a solid background
      const distanceFromCenter = Math.sqrt(
        Math.pow(lat - 25.67, 2) +
        Math.pow(lon - (-100.30), 2)
      );

      // Slight elevation in pollution toward urban center
      const urbanFactor = Math.max(0, 1 - distanceFromCenter * 8);
      baseValue = baseValue * (1 + urbanFactor * 0.2);

      // Add small random variations to break up uniformity
      const microNoise = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
      baseValue *= microNoise;

      // Apply influence from simulated areas
      let areaInfluence = 0;
      let totalAreaInfluence = 0;

      SIMULATED_AREAS.forEach(area => {
        const distance = Math.sqrt(
          Math.pow(lat - area.latitude, 2) +
          Math.pow(lon - area.longitude, 2)
        );

        // If point is within influence radius of the area
        if (distance < area.radius) {
          // Calculate influence factor - stronger near the center, fading toward edges
          const influenceFactor = Math.pow(1 - distance / area.radius, 1.5);
          totalAreaInfluence += influenceFactor;

          // Apply the pollution factor of the area
          areaInfluence += influenceFactor * area.pollutionFactor;
        }
      });

      // Apply arterial road effects
      let roadInfluence = 0;
      let totalRoadInfluence = 0;

      ARTERIAL_ROADS.forEach(road => {
        // Calculate distance from point to road segment
        const distToRoad = distanceToLineSegment(
          lat, lon,
          road.start[0], road.start[1],
          road.end[0], road.end[1]
        );

        // If point is close enough to road to be affected
        if (distToRoad < road.width) {
          // Calculate influence factor - stronger near the road, fading outward
          const influenceFactor = Math.pow(1 - distToRoad / road.width, 1.2);
          totalRoadInfluence += influenceFactor;

          // Apply the pollution factor of the road
          roadInfluence += influenceFactor * road.pollutionFactor;
        }
      });

      // Apply combined area and road influences
      if (totalAreaInfluence > 0) {
        const areaFactorNormalized = areaInfluence / totalAreaInfluence;
        baseValue = baseValue * (1 - totalAreaInfluence * 0.8) + (baseValue * areaFactorNormalized * totalAreaInfluence * 0.8);
      }

      if (totalRoadInfluence > 0) {
        const roadFactorNormalized = roadInfluence / totalRoadInfluence;
        baseValue = baseValue * (1 - totalRoadInfluence * 0.7) + (baseValue * roadFactorNormalized * totalRoadInfluence * 0.7);
      }

      // Add some random variation to make it look more natural
      const randomVariation = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
      const finalValue = baseValue * randomVariation;

      // Add point with weight scaled by value
      // Only add points with meaningful values for performance
      if (finalValue > 1) {
        // Set a minimum intensity for visibility, and scale higher values for contrast
        const intensity = Math.max(5, finalValue * 0.2);

        points.push([lat, lon, intensity]);
      }
    }
  }

  // Add concentrated high-value points at station locations for better visual definition
  baseStations.forEach(station => {
    let value: number;
    switch (pollutantType) {
      case 'pm25':
        value = station.aqi * 0.4;
        break;
      case 'pm10':
        value = station.aqi * 0.6;
        break;
      default:
        value = station.aqi;
    }

    // Add the station's central point with higher intensity
    points.push([station.latitude, station.longitude, value * 0.8]);

    // Add a few points around the station with slightly reduced intensity
    // This creates a stronger hotspot effect
    const jitterRadius = 0.003; // About 300m
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * jitterRadius;
      const jitterLat = station.latitude + Math.sin(angle) * distance;
      const jitterLon = station.longitude + Math.cos(angle) * distance;
      const intensity = value * 0.6 * (1 - distance / jitterRadius);
      points.push([jitterLat, jitterLon, intensity]);
    }
  });

  // Add high-value points at simulated areas centers for better definition
  SIMULATED_AREAS.forEach(area => {
    let baseValue = 50; // Default base value

    // Determine a reasonable base value for this area
    if (area.pollutionFactor > 1) {
      // Higher pollution areas get higher values
      baseValue = 70 + (area.pollutionFactor - 1) * 100;
    } else {
      // Lower pollution areas get lower values
      baseValue = 70 - (1 - area.pollutionFactor) * 50;
    }

    let value: number;
    switch (pollutantType) {
      case 'pm25':
        value = baseValue * 0.4;
        break;
      case 'pm10':
        value = baseValue * 0.6;
        break;
      default:
        value = baseValue;
    }

    // Add the area's central point with appropriate intensity
    points.push([area.latitude, area.longitude, value * 0.6 * area.pollutionFactor]);

    // Add several points within the area to reinforce the pattern
    const pointCount = Math.ceil(area.radius * 100); // More points for larger areas
    for (let i = 0; i < pointCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * area.radius * 0.8; // Keep within 80% of radius
      const jitterLat = area.latitude + Math.sin(angle) * distance;
      const jitterLon = area.longitude + Math.cos(angle) * distance;

      // Intensity decreases with distance from center
      const intensityFactor = 1 - Math.pow(distance / area.radius, 1.2);
      const intensity = value * 0.5 * area.pollutionFactor * intensityFactor;

      points.push([jitterLat, jitterLon, intensity]);
    }
  });

  // Add points along arterial roads
  ARTERIAL_ROADS.forEach(road => {
    // Number of points to add along the road
    const steps = 20;

    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;

      // Interpolate position along the road
      const lat = road.start[0] + (road.end[0] - road.start[0]) * ratio;
      const lon = road.start[1] + (road.end[1] - road.start[1]) * ratio;

      // Base value for the road
      const baseValue = 60 + (road.pollutionFactor - 1) * 100;

      let value: number;
      switch (pollutantType) {
        case 'pm25':
          value = baseValue * 0.4;
          break;
        case 'pm10':
          value = baseValue * 0.6;
          break;
        default:
          value = baseValue;
      }

      // Add central point on the road
      points.push([lat, lon, value * 0.4 * road.pollutionFactor]);

      // Add a few points perpendicular to the road for width
      // Calculate perpendicular vector
      const roadVectorLat = road.end[0] - road.start[0];
      const roadVectorLon = road.end[1] - road.start[1];
      const length = Math.sqrt(roadVectorLat * roadVectorLat + roadVectorLon * roadVectorLon);

      // Normalized perpendicular vector
      const perpVectorLat = -roadVectorLon / length;
      const perpVectorLon = roadVectorLat / length;

      // Add points to either side of the road
      for (let j = 1; j <= 2; j++) {
        const distance = (road.width * 0.6) * (j / 2);

        // Point on one side
        const latPos = lat + perpVectorLat * distance;
        const lonPos = lon + perpVectorLon * distance;
        const intensityPos = value * 0.3 * road.pollutionFactor * (1 - j / 3);
        points.push([latPos, lonPos, intensityPos]);

        // Point on other side
        const latNeg = lat - perpVectorLat * distance;
        const lonNeg = lon - perpVectorLon * distance;
        const intensityNeg = value * 0.3 * road.pollutionFactor * (1 - j / 3);
        points.push([latNeg, lonNeg, intensityNeg]);
      }
    }
  });

  return points;
};

/**
 * Calculate the shortest distance from point (x,y) to line segment from (x1,y1) to (x2,y2)
 */
function distanceToLineSegment(x: number, y: number, x1: number, y1: number, x2: number, y2: number): number {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) // To avoid division by zero
    param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;

  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Generate additional data points to enhance the heatmap with better coverage
 */
export const generateAdditionalMonitoringPoints = (): Station[] => {
  const additionalPoints: Station[] = [];

  // Create additional monitoring points in areas of interest
  SIMULATED_AREAS.forEach((area, index) => {
    // Base AQI - higher for industrial/traffic areas, lower for green areas
    const baseAqi = area.pollutionFactor > 1
      ? 80 + Math.round(Math.random() * 80) // 80-160 for polluted areas
      : 30 + Math.round(Math.random() * 40); // 30-70 for cleaner areas

    // Create station object
    const station: Station = {
      id: `simulated-station-${index}`,
      name: area.name,
      latitude: area.latitude,
      longitude: area.longitude,
      aqi: baseAqi,
      status: getStatusFromAQI(baseAqi)
    };

    additionalPoints.push(station);
  });

  // Add some monitoring points along arterial roads
  ARTERIAL_ROADS.forEach((road, index) => {
    // Place a station somewhere along the road
    const ratio = 0.3 + Math.random() * 0.4; // 30-70% along the road
    const lat = road.start[0] + (road.end[0] - road.start[0]) * ratio;
    const lon = road.start[1] + (road.end[1] - road.start[1]) * ratio;

    // Create a name based on the nearest street
    const roadNames = [
      'Estación Ave. Constitución',
      'Monitoreo Gonzalitos',
      'Estación Morones Prieto',
      'Monitoreo Ave. Revolución',
      'Estación Ave. Leones',
      'Monitoreo Miguel Alemán',
      'Estación Lázaro Cárdenas',
      'Monitoreo Ave. Lincoln'
    ];

    // Base AQI for road stations - slightly elevated
    const baseAqi = 70 + Math.round((road.pollutionFactor - 1) * 100);

    // Create station object
    const station: Station = {
      id: `road-station-${index}`,
      name: roadNames[index % roadNames.length],
      latitude: lat,
      longitude: lon,
      aqi: baseAqi,
      status: getStatusFromAQI(baseAqi)
    };

    additionalPoints.push(station);
  });

  return additionalPoints;
};

/**
 * Helper function to get status from AQI value
 */
function getStatusFromAQI(aqi: number) {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy-sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very-unhealthy';
  return 'hazardous';
}
