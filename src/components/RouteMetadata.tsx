import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://mtyrespira.elelier.com';
const SITE_NAME = 'MonterreyRespira';
const SHARE_IMAGE = `${SITE_URL}/images/seo/share-image.png`;

type RouteMetadata = {
  title: string;
  description: string;
  path: string;
};

const routeMetadata: Record<string, RouteMetadata> = {
  '/': {
    title: 'MonterreyRespira | Lecturas disponibles de calidad del aire en Monterrey',
    description:
      'Consulta lecturas disponibles de AQI, contaminante principal, contexto ambiental y frescura de medición para Monterrey y su zona metropolitana.',
    path: '/',
  },
  '/acerca-de': {
    title: 'Acerca de MonterreyRespira | Calidad del aire con frescura honesta',
    description:
      'Conoce el propósito de MonterreyRespira: hacer legibles las mediciones reportadas de calidad del aire y sus estados de frescura en la ZMM.',
    path: '/acerca-de',
  },
  '/datos-y-apis': {
    title: 'Datos y metodología | Fuentes AQI y contexto ambiental de MtyRespira',
    description:
      'Revisa cómo MtyRespira presenta AQI reportado por WAQI/AQICN, clima contextual de Open-Meteo y límites de frescura de las lecturas.',
    path: '/datos-y-apis',
  },
  '/asociaciones': {
    title: 'Asociaciones y acción ciudadana | MonterreyRespira',
    description:
      'Explora organizaciones, recursos ciudadanos y referencias externas para informarte o participar por un aire más limpio en Nuevo León.',
    path: '/asociaciones',
  },
  '/politica-de-privacidad': {
    title: 'Política de privacidad | MonterreyRespira',
    description:
      'Consulta cómo MonterreyRespira describe el uso de datos de navegación, ubicación del navegador y servicios externos de la web pública.',
    path: '/politica-de-privacidad',
  },
};

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

export default function RouteMetadata() {
  const { pathname } = useLocation();
  const metadata = routeMetadata[normalizePathname(pathname)] ?? routeMetadata['/'];
  const canonicalUrl = `${SITE_URL}${metadata.path === '/' ? '/' : metadata.path}`;

  return (
    <Helmet>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={SHARE_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metadata.title} />
      <meta name="twitter:description" content={metadata.description} />
      <meta name="twitter:image" content={SHARE_IMAGE} />
    </Helmet>
  );
}
