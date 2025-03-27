import React from 'react';
import CityMapPlaceholder from './CityMapPlaceholder';

// Este componente es simplemente un wrapper alrededor de CityMapPlaceholder
// para mantener compatibilidad con el código existente pero evitar errores de compilación
interface AirQualityMapProps {
  className?: string;
  center?: [number, number];
}

export default function AirQualityMap({ className = '', center = [25.6866, -100.3161] }: AirQualityMapProps) {
  // Extraer el nombre de la ciudad basado en las coordenadas centrales (aproximado)
  const getCityNameFromCoordinates = (coords: [number, number]): string => {
    // Simplemente devolvemos "Monterrey Centro" como ciudad predeterminada
    // En una implementación real, buscaríamos la ciudad más cercana a las coordenadas
    return "Monterrey Centro";
  };

  const cityName = getCityNameFromCoordinates(center);

  return <CityMapPlaceholder className={className} selectedCityName={cityName} />;
}
