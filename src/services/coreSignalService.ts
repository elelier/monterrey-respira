import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  DistanceBucket,
  MTYRESPIRA_COVERAGE_AREA,
} from '../utils/coverageUtils';
import { MeasurementFreshness } from '../types';

const CORE_DB_SUPABASE_URL = import.meta.env.VITE_CORE_DB_SUPABASE_URL;
const CORE_DB_SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_CORE_DB_SUPABASE_PUBLISHABLE_KEY;
const CORE_SPACE_KEY = import.meta.env.VITE_CORE_SPACE_KEY;
const CORE_APP_KEY = import.meta.env.VITE_CORE_APP_KEY;

const OUT_OF_COVERAGE_SIGNAL_KIND = 'out_of_coverage_geolocation';
const CITY_SHARE_SIGNAL_KIND = 'city_share';

let coreDbClient: SupabaseClient | null = null;

function getCoreDbClient() {
  if (!CORE_DB_SUPABASE_URL || !CORE_DB_SUPABASE_PUBLISHABLE_KEY) {
    return null;
  }

  if (!coreDbClient) {
    coreDbClient = createClient(CORE_DB_SUPABASE_URL, CORE_DB_SUPABASE_PUBLISHABLE_KEY);
  }

  return coreDbClient;
}

function hasCoreSignalKeys() {
  return Boolean(CORE_SPACE_KEY && CORE_APP_KEY);
}

function getOptionalBrowserLanguage() {
  return typeof navigator !== 'undefined' ? navigator.language : undefined;
}

function getOptionalTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

function addBrowserContext(data: Record<string, string | number | null>) {
  const browserLanguage = getOptionalBrowserLanguage();
  const timezone = getOptionalTimezone();

  if (browserLanguage) {
    data.browser_language = browserLanguage;
  }

  if (timezone) {
    data.timezone = timezone;
  }

  return data;
}

export interface OutOfCoverageDemandSignalInput {
  nearestSupportedCity: string;
  roundedDistanceKm: number;
  distanceBucket: DistanceBucket;
}

export function buildOutOfCoverageDemandSignalPayload({
  nearestSupportedCity,
  roundedDistanceKm,
  distanceBucket,
}: OutOfCoverageDemandSignalInput) {
  const data = addBrowserContext({
    nearest_supported_city: nearestSupportedCity,
    distance_to_nearest_km: roundedDistanceKm,
    distance_bucket: distanceBucket,
    coverage_area: MTYRESPIRA_COVERAGE_AREA,
  });

  return {
    space_key: CORE_SPACE_KEY,
    app_key: CORE_APP_KEY,
    kind: OUT_OF_COVERAGE_SIGNAL_KIND,
    title: 'Out-of-coverage geolocation demand',
    summary: 'User geolocation was outside the MtyRespira supported area.',
    priority: 'low',
    data,
  };
}

export async function submitOutOfCoverageDemandSignal(input: OutOfCoverageDemandSignalInput) {
  const supabase = getCoreDbClient();

  if (!supabase || !hasCoreSignalKeys()) {
    return { ok: false, skipped: true, reason: 'core_db_config_missing' };
  }

  const payload = buildOutOfCoverageDemandSignalPayload(input);
  const { data, error } = await supabase.rpc('submit_signal', { payload });

  if (error) {
    return { ok: false, skipped: false, reason: 'submit_signal_error', error };
  }

  return { ok: true, skipped: false, data };
}

export type CityShareMethod = 'native_share' | 'clipboard_fallback';

export interface CityShareSignalInput {
  cityId: number;
  cityName: string;
  citySlug: string;
  route: string;
  shareMethod: CityShareMethod;
  aqiUs: number | null;
  measurementFreshness: MeasurementFreshness;
}

export function buildCityShareSignalPayload({
  cityId,
  cityName,
  citySlug,
  route,
  shareMethod,
  aqiUs,
  measurementFreshness,
}: CityShareSignalInput) {
  const data = addBrowserContext({
    city_id: cityId,
    city_name: cityName,
    city_slug: citySlug,
    route,
    share_method: shareMethod,
    aqi_us: aqiUs,
    measurement_freshness: measurementFreshness,
  });

  return {
    space_key: CORE_SPACE_KEY,
    app_key: CORE_APP_KEY,
    kind: CITY_SHARE_SIGNAL_KIND,
    title: 'City deep link shared',
    summary: 'User shared a MtyRespira city deep link.',
    priority: 'low',
    data,
  };
}

export async function submitCityShareSignal(input: CityShareSignalInput) {
  const supabase = getCoreDbClient();

  if (!supabase || !hasCoreSignalKeys()) {
    return { ok: false, skipped: true, reason: 'core_db_config_missing' };
  }

  const payload = buildCityShareSignalPayload(input);
  const { data, error } = await supabase.rpc('submit_signal', { payload });

  if (error) {
    return { ok: false, skipped: false, reason: 'submit_signal_error', error };
  }

  return { ok: true, skipped: false, data };
}
