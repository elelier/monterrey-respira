import { MONTERREY_LOCATIONS_WITH_COORDS } from '../services/apiService';

export const OUT_OF_COVERAGE_KM = 100;
export const MTYRESPIRA_COVERAGE_AREA = 'mty_metro';

type CityOption = (typeof MONTERREY_LOCATIONS_WITH_COORDS)[number];

export type DistanceBucket = '100_250' | '250_500' | '500_1000' | '1000_plus';

export interface NearestSupportedCityResult {
  city: CityOption;
  distanceKm: number;
  roundedDistanceKm: number;
  distanceBucket: DistanceBucket;
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function calculateDistanceKm(
  fromLatitude: number,
  fromLongitude: number,
  toLatitude: number,
  toLongitude: number,
) {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(toLatitude - fromLatitude);
  const longitudeDelta = toRadians(toLongitude - fromLongitude);
  const fromLatitudeRad = toRadians(fromLatitude);
  const toLatitudeRad = toRadians(toLatitude);

  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(fromLatitudeRad)
      * Math.cos(toLatitudeRad)
      * Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function getDistanceBucket(distanceKm: number): DistanceBucket {
  if (distanceKm < 250) {
    return '100_250';
  }

  if (distanceKm < 500) {
    return '250_500';
  }

  if (distanceKm < 1000) {
    return '500_1000';
  }

  return '1000_plus';
}

export function findNearestSupportedCity(
  latitude: number,
  longitude: number,
  cities: CityOption[] = MONTERREY_LOCATIONS_WITH_COORDS,
): NearestSupportedCityResult | null {
  if (cities.length === 0) {
    return null;
  }

  const nearest = cities.reduce<NearestSupportedCityResult | null>((currentNearest, city) => {
    const distanceKm = calculateDistanceKm(latitude, longitude, city.latitude, city.longitude);

    if (!currentNearest || distanceKm < currentNearest.distanceKm) {
      return {
        city,
        distanceKm,
        roundedDistanceKm: Math.round(distanceKm),
        distanceBucket: getDistanceBucket(distanceKm),
      };
    }

    return currentNearest;
  }, null);

  return nearest;
}

export function isOutOfCoverage(distanceKm: number) {
  return distanceKm > OUT_OF_COVERAGE_KM;
}
