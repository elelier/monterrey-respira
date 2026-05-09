import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  DistanceBucket,
  MTYRESPIRA_COVERAGE_AREA,
} from '../utils/coverageUtils';

const CORE_DB_SUPABASE_URL = import.meta.env.VITE_CORE_DB_SUPABASE_URL;
const CORE_DB_SUPABASE_ANON_KEY = import.meta.env.VITE_CORE_DB_SUPABASE_ANON_KEY;

const MTYRESPIRA_SPACE_KEY = 'mtyrespira';
const MTYRESPIRA_APP_KEY = 'mtyrespira-web';
const OUT_OF_COVERAGE_SIGNAL_KIND = 'out_of_coverage_geolocation';

let coreDbClient: SupabaseClient | null = null;

function getCoreDbClient() {
  if (!CORE_DB_SUPABASE_URL || !CORE_DB_SUPABASE_ANON_KEY) {
    return null;
  }

  if (!coreDbClient) {
    coreDbClient = createClient(CORE_DB_SUPABASE_URL, CORE_DB_SUPABASE_ANON_KEY);
  }

  return coreDbClient;
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
  const data: Record<string, string | number> = {
    nearest_supported_city: nearestSupportedCity,
    distance_to_nearest_km: roundedDistanceKm,
    distance_bucket: distanceBucket,
    coverage_area: MTYRESPIRA_COVERAGE_AREA,
  };

  const browserLanguage = getOptionalBrowserLanguage();
  const timezone = getOptionalTimezone();

  if (browserLanguage) {
    data.browser_language = browserLanguage;
  }

  if (timezone) {
    data.timezone = timezone;
  }

  return {
    space_key: MTYRESPIRA_SPACE_KEY,
    app_key: MTYRESPIRA_APP_KEY,
    kind: OUT_OF_COVERAGE_SIGNAL_KIND,
    title: 'Out-of-coverage geolocation demand',
    summary: 'User geolocation was outside the MtyRespira supported area.',
    priority: 'low',
    data,
  };
}

export async function submitOutOfCoverageDemandSignal(input: OutOfCoverageDemandSignalInput) {
  const supabase = getCoreDbClient();

  if (!supabase) {
    return { ok: false, skipped: true, reason: 'core_db_config_missing' };
  }

  const payload = buildOutOfCoverageDemandSignalPayload(input);
  const { data, error } = await supabase.rpc('submit_signal', { payload });

  if (error) {
    return { ok: false, skipped: false, reason: 'submit_signal_error', error };
  }

  return { ok: true, skipped: false, data };
}
