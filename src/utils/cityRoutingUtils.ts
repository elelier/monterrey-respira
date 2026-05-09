import { CitySelectorOption } from '../types';

export const SELECTED_CITY_STORAGE_KEY = 'mtyRespiraSelectedCityId';
export const CITY_QUERY_PARAM = 'city';

export interface CanonicalCity {
  city_id: number;
  name: string;
}

export function slugifyCityName(cityName: string) {
  return cityName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function findCityBySlug<TCity extends CanonicalCity>(
  cities: readonly TCity[],
  slug: string | null | undefined,
): TCity | undefined {
  if (!slug) {
    return undefined;
  }

  return cities.find((city) => slugifyCityName(city.name) === slug);
}

export function findCityById<TCity extends CanonicalCity>(
  cities: readonly TCity[],
  cityId: number | null | undefined,
): TCity | undefined {
  if (cityId === null || cityId === undefined) {
    return undefined;
  }

  return cities.find((city) => city.city_id === cityId);
}

export function getCitySlug(city: CanonicalCity) {
  return slugifyCityName(city.name);
}

export function getCitySlugFromSearch(search: string) {
  return new URLSearchParams(search).get(CITY_QUERY_PARAM);
}

export function getCityFromSearch<TCity extends CanonicalCity>(cities: readonly TCity[], search: string) {
  return findCityBySlug(cities, getCitySlugFromSearch(search));
}

export function readStoredCityId() {
  const storedCityId = window.localStorage.getItem(SELECTED_CITY_STORAGE_KEY);

  if (!storedCityId) {
    return null;
  }

  const parsedCityId = Number(storedCityId);

  return Number.isInteger(parsedCityId) ? parsedCityId : null;
}

export function writeStoredCityId(city: CanonicalCity) {
  window.localStorage.setItem(SELECTED_CITY_STORAGE_KEY, String(city.city_id));
}

export function updateCityQueryParam(city: CanonicalCity) {
  const nextSlug = getCitySlug(city);
  const currentUrl = new URL(window.location.href);

  if (currentUrl.searchParams.get(CITY_QUERY_PARAM) === nextSlug) {
    return;
  }

  currentUrl.searchParams.set(CITY_QUERY_PARAM, nextSlug);
  window.history.replaceState(window.history.state, '', currentUrl.toString());
}

export function isCanonicalCity(city: CanonicalCity, cityOptions: CitySelectorOption[]) {
  return cityOptions.some((option) => option.city_id === city.city_id);
}
