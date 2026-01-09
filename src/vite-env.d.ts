/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GOOGLE_ANALYTICS_ID: string
  readonly VITE_ADSENSE_CLIENT_ID: string
  readonly VITE_ADSENSE_ENABLED: string
  // más variables de entorno...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
