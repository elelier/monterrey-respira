import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { IoHomeOutline, IoLayersOutline, IoLinkOutline, IoMenuOutline, IoMoonOutline, IoShareOutline, IoSunnyOutline } from 'react-icons/io5';
import { useAirQuality } from '../context/AirQualityContext';
import { useTheme } from '../context/ThemeContext';
import { getMainLogoIcon, getPollutantInfo } from '../utils/airQualityUtils';
import { AQI_STATUS_SHARE_LABELS } from '../utils/aqiDesignTokens';
import { Metadata } from './seo/Metadata';
import { Analytics } from './seo/Analytics';
import { getCitySlug } from '../utils/cityRoutingUtils';
import { formatNullableTimestamp, hasReliableAqi } from '../utils/airQualityDisplay';
import { CityShareMethod, submitCityShareSignal } from '../services/coreSignalService';
import type { AirQualityData, AirQualityStatus } from '../types';

interface LayoutProps {
  children: ReactNode;
}

const CITY_SHARE_SIGNAL_FAILED_MESSAGE = 'No se pudo registrar señal anónima de compartir ciudad:';
const SOCIAL_PREVIEW_TITLE = 'MonterreyRespira - Lecturas de calidad del aire';
const SOCIAL_PREVIEW_DESCRIPTION = 'Consulta lecturas disponibles de AQI, contaminante principal y recomendaciones por municipio.';

const hasShareableAqi = (aqi: number | null | undefined, status: AirQualityStatus): aqi is number => {
  return status !== 'unknown' && hasReliableAqi(aqi);
};

const formatMainPollutantForShare = (pollutant: string | null | undefined): string | null => {
  if (!pollutant) {
    return null;
  }

  return getPollutantInfo(pollutant).name;
};

const buildCitySnapshotShareDescription = (
  cityName: string,
  airQualityData: AirQualityData | null | undefined,
): string => {
  if (!airQualityData || !hasShareableAqi(airQualityData.aqi, airQualityData.status)) {
    return `Calidad del aire en ${cityName}:\nÚltima lectura no disponible.\nRevisa recomendaciones en MtyRespira.`;
  }

  const pollutantLabel = formatMainPollutantForShare(airQualityData.main_pollutant_us);
  const snapshotParts = [
    `AQI ${airQualityData.aqi}`,
    AQI_STATUS_SHARE_LABELS[airQualityData.status],
    pollutantLabel,
  ].filter(Boolean);

  return `Calidad del aire en ${cityName}:\n${snapshotParts.join(' · ')}\nRevisa recomendaciones en MtyRespira.`;
};

const getNavLinkClass = (isActive: boolean) => `site-nav-link${isActive ? ' site-nav-link--active' : ''}`;

export default function Layout({ children }: LayoutProps) {
  const { theme, airQualityData, selectedCity } = useAirQuality();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  const currentCity = selectedCity.name;
  const shareDescription = buildCitySnapshotShareDescription(currentCity, airQualityData);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const submitShareSignal = (shareMethod: CityShareMethod) => {
    const shareableAqi = airQualityData && hasReliableAqi(airQualityData)
      ? airQualityData.aqi
      : null;

    void submitCityShareSignal({
      cityId: selectedCity.city_id,
      cityName: selectedCity.name,
      citySlug: getCitySlug(selectedCity),
      route: window.location.pathname,
      shareMethod,
      aqiUs: shareableAqi,
      measurementFreshness: airQualityData?.measurementFreshness ?? 'unknown',
    }).catch((error: unknown) => {
      console.warn(CITY_SHARE_SIGNAL_FAILED_MESSAGE, error);
    });
  };

  const getShareImage = () => {
    if (!theme) return '/images/seo/share-image.png';
    return `/images/seo/share-image-${theme.primary.replace('#', '')}.png`;
  };

  return (
    <>
      <Metadata
        title={SOCIAL_PREVIEW_TITLE}
        description={SOCIAL_PREVIEW_DESCRIPTION}
        keywords={`calidad del aire, contaminación, ${currentCity}, zona metropolitana, ambiente, monitoreo, salud`}
        image={getShareImage()}
        type="website"
      />
      <Analytics trackingId={import.meta.env.VITE_GOOGLE_ANALYTICS_ID} />

      <div className="page-shell min-h-screen overflow-x-hidden pb-20 md:pb-0">
        <header className="site-header">
          <div className="site-header__inner container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              className="flex items-center"
            >
              <Link to="/" className="group flex items-center" aria-label="MonterreyRespira, ir al inicio">
                <motion.div
                  className="logo-container mr-2 flex h-9 w-9 items-center justify-center sm:mr-3 sm:h-10 sm:w-10"
                  whileHover={{ scale: 1.08, transition: { duration: 0.3 } }}
                >
                  <img src={getMainLogoIcon()} alt="Logo Monterrey Respira" className="h-8 w-8 sm:h-9 sm:w-9" />
                </motion.div>
                <div>
                  <h1 className="text-[1.15rem] font-black leading-tight text-[var(--mty-text)] sm:text-2xl">MonterreyRespira</h1>
                  <span className="hidden text-xs text-[var(--mty-muted-text)] sm:block sm:text-sm">Lecturas disponibles del aire</span>
                </div>
              </Link>
            </motion.div>

            <nav className="site-nav hidden md:flex" aria-label="Navegación principal">
              <Link to="/" className={getNavLinkClass(location.pathname === '/')}>Inicio</Link>
              <Link to="/acerca-de" className={getNavLinkClass(location.pathname === '/acerca-de')}>Acerca de</Link>
              <Link to="/datos-y-apis#metodologia-y-limites" className={getNavLinkClass(location.pathname === '/datos-y-apis')}>Datos y fuentes</Link>
              <Link to="/asociaciones" className={getNavLinkClass(location.pathname === '/asociaciones')}>Asociaciones</Link>
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              {airQualityData && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="info-pill info-pill--status inline-flex shrink-0 flex-col items-center gap-0.5 whitespace-nowrap sm:flex-row sm:gap-1"
                >
                  <span>Medición</span>
                  <span>{formatNullableTimestamp(airQualityData.timestamp, { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                </motion.div>
              )}

              <button
                onClick={toggleTheme}
                className="theme-toggle"
                aria-label={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                title={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                type="button"
              >
                {resolvedTheme === 'dark' ? <IoSunnyOutline aria-hidden="true" /> : <IoMoonOutline aria-hidden="true" />}
                <span className="theme-toggle__label">{resolvedTheme === 'dark' ? 'Claro' : 'Oscuro'}</span>
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: SOCIAL_PREVIEW_TITLE, text: shareDescription, url: window.location.href })
                      .then(() => submitShareSignal('native_share'))
                      .catch((error: unknown) => {
                        if (error instanceof DOMException && error.name === 'AbortError') return;
                        console.error(error);
                      });
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                      .then(() => {
                        submitShareSignal('clipboard_fallback');
                        alert('URL copiada al portapapeles');
                      })
                      .catch(console.error);
                  }
                }}
                className="rounded-full p-2 text-[var(--mty-text)] transition-colors hover:bg-[var(--mty-accent-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--mty-focus)]"
                aria-label="Compartir"
                type="button"
              >
                <IoShareOutline className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-full p-2 text-[var(--mty-text)] focus:outline-none focus:ring-2 focus:ring-[var(--mty-focus)] md:hidden"
                type="button"
                aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={mobileMenuOpen}
              >
                <IoMenuOutline className="h-6 w-6" />
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-[var(--mty-border)] px-4 py-3 md:hidden">
              <nav className="container mx-auto grid gap-1" aria-label="Navegación móvil">
                <Link to="/" onClick={closeMobileMenu} className={getNavLinkClass(location.pathname === '/')}>Inicio</Link>
                <Link to="/acerca-de" onClick={closeMobileMenu} className={getNavLinkClass(location.pathname === '/acerca-de')}>Acerca de</Link>
                <Link to="/datos-y-apis#metodologia-y-limites" onClick={closeMobileMenu} className={getNavLinkClass(location.pathname === '/datos-y-apis')}>Datos, fuentes y metodología</Link>
                <Link to="/asociaciones" onClick={closeMobileMenu} className={getNavLinkClass(location.pathname === '/asociaciones')}>Asociaciones</Link>
                <Link to="/asociaciones#desahogate" onClick={closeMobileMenu} className={getNavLinkClass(false)}>Acción ciudadana</Link>
                <Link to="/politica-de-privacidad" onClick={closeMobileMenu} className={getNavLinkClass(location.pathname === '/politica-de-privacidad')}>Política de privacidad</Link>
              </nav>
            </motion.div>
          )}
        </header>

        <main className="site-main container mx-auto px-3 sm:px-6 lg:px-8">{children}</main>

        <footer className="site-footer container mx-auto px-4 py-7 text-center sm:px-6 lg:px-8">
          <div className="space-y-3">
            <p className="text-xs sm:text-sm">MonterreyRespira {currentYear} · Lecturas disponibles de calidad del aire en Monterrey, Nuevo León</p>
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2" aria-label="Enlaces secundarios">
              <Link to="/">Inicio</Link>
              <Link to="/acerca-de">Acerca de</Link>
              <Link to="/datos-y-apis#metodologia-y-limites">Datos y metodología</Link>
              <Link to="/asociaciones">Asociaciones</Link>
              <Link to="/politica-de-privacidad">Política de privacidad</Link>
            </nav>
            <div className="mt-2">
              <a href="https://ko-fi.com/Y8Y11CCJPV" target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full border border-[#d69a24] bg-[#f6c453] px-3 py-1.5 text-sm !text-[#241b08] shadow-sm transition-colors hover:bg-[#eab43c] hover:!text-[#171207]">
                <img src="https://ko-fi.com/img/cup-border.png" className="mr-1 h-4 w-4 object-contain" alt="Ko-fi" />
                <span className="text-xs">¡Apoya con un cafecito!</span>
              </a>
            </div>
            <p className="mt-2 text-xs sm:text-sm">Desarrollado por <a href="https://www.elelier.com" target="_blank" rel="noopener noreferrer">elelier</a></p>
          </div>
        </footer>

        <div className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-40 rounded-t-[1.5rem] md:hidden">
          <div className="grid h-14 grid-cols-3">
            <Link to="/" aria-label="Ir al inicio" className={location.pathname === '/' ? 'is-active flex flex-col items-center justify-center' : 'flex flex-col items-center justify-center'}>
              <IoHomeOutline className="mb-0.5 text-lg" />
              <span className="text-[0.68rem]">Inicio</span>
            </Link>
            <Link to="/datos-y-apis#metodologia-y-limites" aria-label="Ver datos, fuentes y metodología" className={location.pathname === '/datos-y-apis' ? 'is-active flex flex-col items-center justify-center' : 'flex flex-col items-center justify-center'}>
              <IoLayersOutline className="mb-0.5 text-lg" />
              <span className="text-[0.68rem]">Datos</span>
            </Link>
            <Link to="/asociaciones#desahogate" aria-label="Ver acciones ciudadanas" className={location.pathname === '/asociaciones' ? 'is-active flex flex-col items-center justify-center' : 'flex flex-col items-center justify-center'}>
              <IoLinkOutline className="mb-0.5 text-lg" />
              <span className="text-[0.68rem]">Acción</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
