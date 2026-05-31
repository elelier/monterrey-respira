import { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAirQuality } from '../context/AirQualityContext';
import { getMainLogoIcon, getPollutantInfo } from '../utils/airQualityUtils';
import { AQI_STATUS_SHARE_LABELS } from '../utils/aqiDesignTokens';
import { Link, useLocation } from 'react-router-dom';
import { IoHomeOutline, IoLayersOutline, IoLinkOutline, IoMenuOutline, IoShareOutline } from 'react-icons/io5';
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

export default function Layout({ children }: LayoutProps) {
  const { theme, airQualityData, selectedCity } = useAirQuality();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  // Obtener la ciudad actual para el mensaje de compartir.
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

  // Obtener la imagen de compartición basada en la calidad del aire
  const getShareImage = () => {
    if (!theme) return '/images/seo/share-image.png';

    // Crear un nombre de archivo único basado en la calidad del aire
    return `/images/seo/share-image-${theme.primary.replace('#', '')}.png`;
  };

  // Aplicar el tema dinámico al body
  useEffect(() => {
    if (theme) {
      // Cambiar el color de fondo del body según la calidad del aire
      document.body.style.backgroundColor = theme.background;
      document.body.style.color = theme.text;

      // Transición suave
      document.body.style.transition = 'background-color 1s ease, color 1s ease';
    }

    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      document.body.style.transition = '';
    };
  }, [theme]);

  // Obtener clase de color basada en el tema
  const getHeaderBgClass = () => {
    if (!theme) return 'bg-blue-100 text-blue-800';

    switch (theme.primary) {
      case '#4ade80': return 'bg-green-100 text-green-800';
      case '#fbbf24': return 'bg-amber-100 text-amber-800';
      case '#fb923c': return 'bg-orange-100 text-orange-800';
      case '#f87171': return 'bg-red-100 text-red-800';
      case '#c084fc': return 'bg-purple-100 text-purple-800';
      case '#9f1239': return 'bg-rose-100 text-rose-800';
      case '#64748b': return 'bg-slate-100 text-slate-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Get theme-based color for bottom nav active items
  const getBottomNavActiveClass = () => {
    if (!theme) return 'text-blue-600';

    switch (theme.primary) {
      case '#4ade80': return 'text-green-600';
      case '#fbbf24': return 'text-amber-600';
      case '#fb923c': return 'text-orange-600';
      case '#f87171': return 'text-red-600';
      case '#c084fc': return 'text-purple-600';
      case '#9f1239': return 'text-rose-600';
      case '#64748b': return 'text-slate-600';
      default: return 'text-blue-600';
    }
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

      <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
        <header className={`sticky top-0 z-30 border-b border-white/10 shadow-sm backdrop-blur-sm dark:border-slate-700 ${theme ? `bg-gradient-to-r ${theme.gradient}` : 'bg-white/90 dark:bg-slate-900/90'}`}>
          <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-auto sm:px-6 sm:py-5 md:py-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
              whileTap={{
                scale: 1.1,
                transition: { duration: 0.2 }
              }}
              className="flex items-center"
            >
              <Link to="/"
                className="flex items-center group hover:opacity-90 transition-opacity"
                onClick={() => {
                  // Efecto de respiración al hacer click
                  const logoElement = document.querySelector('.logo-container');
                  if (logoElement) {
                    logoElement.animate(
                      {
                        scale: [1, 1.05, 1],
                        opacity: [1, 0.95, 1],
                      },
                      {
                        duration: 4000,
                        easing: 'ease-in-out',
                        fill: 'forwards',
                      },
                    );
                  }
                }}
              >
                <motion.div
                  className="logo-container mr-2 flex h-8 w-8 items-center justify-center rounded-full sm:mr-3 sm:h-10 sm:w-10"
                  whileHover={{
                    scale: 1.1,
                    transition: { duration: 0.3 }
                  }}
                >
                  <img
                    src={getMainLogoIcon()}
                    alt="Logo Monterrey Respira"
                    className="h-7 w-7 sm:h-8 sm:w-8"
                  />
                </motion.div>
                <div className="logo-container">
                  <h1 className={`${theme ? 'text-white' : 'text-black'} text-[1.2rem] font-bold leading-tight transition-colors duration-500 sm:text-2xl sm:font-black`}>MonterreyRespira</h1>
                  <span className={`${theme ? 'text-slate-200' : 'text-gray-600'} text-xs sm:text-sm hidden sm:block transition-colors duration-500`}>Lecturas disponibles del aire</span>
                </div>
              </Link>
            </motion.div>

            {/* Navegación principal - visible solo en pantallas grandes */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md ${location.pathname === '/' ? 'bg-white/20' : 'hover:bg-white/10'} text-white transition-colors`}
              >
                Inicio
              </Link>
              <Link
                to="/acerca-de"
                className={`px-3 py-2 rounded-md ${location.pathname === '/acerca-de' ? 'bg-white/20' : 'hover:bg-white/10'} text-white transition-colors`}
              >
                Acerca de
              </Link>
              <Link
                to="/datos-y-apis#metodologia-y-limites"
                className={`px-3 py-2 rounded-md ${location.pathname === '/datos-y-apis' ? 'bg-white/20' : 'hover:bg-white/10'} text-white transition-colors`}
              >
                Datos y fuentes
              </Link>
              <Link
                to="/asociaciones"
                className={`px-3 py-2 rounded-md ${location.pathname === '/asociaciones' ? 'bg-white/20' : 'hover:bg-white/10'} text-white transition-colors`}
              >
                Asociaciones
              </Link>
            </nav>

            <div className="flex items-center gap-1 sm:gap-4">
              {airQualityData && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`hidden sm:flex items-center text-sm px-3 py-1 sm:px-4 sm:py-2 rounded-full ${getHeaderBgClass()}`}
                >
                  <span className="font-semibold text-xs sm:text-sm">
                    Medicion:
                  </span>
                  <span className="ml-1 text-xs sm:text-sm">
                    {formatNullableTimestamp(airQualityData.timestamp, {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </motion.div>
              )}

              {/* Botón de compartir */}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: SOCIAL_PREVIEW_TITLE,
                      text: shareDescription,
                      url: window.location.href
                    })
                      .then(() => submitShareSignal('native_share'))
                      .catch((error: unknown) => {
                        if (error instanceof DOMException && error.name === 'AbortError') {
                          return;
                        }

                        console.error(error);
                      });
                  } else {
                    // Copiar URL al portapapeles como alternativa
                    navigator.clipboard.writeText(window.location.href)
                      .then(() => {
                        submitShareSignal('clipboard_fallback');
                        alert('URL copiada al portapapeles');
                      })
                      .catch(console.error);
                  }
                }}
                className={`rounded-xl p-1.5 ${theme ? 'hover:bg-white/20' : 'hover:bg-gray-100'} transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:p-2`}
                aria-label="Compartir"
                type="button"
              >
                <IoShareOutline className={`h-5 w-5 sm:h-7 sm:w-7 ${theme ? 'text-white' : 'text-gray-600'}`} />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-xl p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:hidden"
                type="button"
                aria-label="Abrir menu"
              >
                <IoMenuOutline className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-700"
            >
              <nav className="px-4 py-2 rounded-md bg-white text-black">
                <Link to="/" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  Inicio
                </Link>
                <Link to="/acerca-de" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  Acerca de
                </Link>
                <Link to="/datos-y-apis#metodologia-y-limites" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  Datos, fuentes y metodología
                </Link>
                <Link to="/asociaciones" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  Asociaciones
                </Link>
                <Link to="/asociaciones#desahogate" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  Acción ciudadana
                </Link>
                <Link to="/politica-de-privacidad" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  Política de Privacidad
                </Link>
              </nav>
            </motion.div>
          )}
        </header>

        <main className="container mx-auto px-3 py-1.5 sm:px-6 md:py-4 lg:px-8">
          {children}
        </main>

        <footer className="container mx-auto py-6 md:py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          <div className="space-y-3">
            <p className="text-xs sm:text-sm">MonterreyRespira {currentYear} - Lecturas disponibles de calidad del aire en Monterrey, Nuevo León</p>
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2" aria-label="Enlaces secundarios">
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Inicio
              </Link>
              <Link
                to="/acerca-de"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Acerca de
              </Link>
              <Link
                to="/datos-y-apis#metodologia-y-limites"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Datos y metodología
              </Link>
              <Link
                to="/asociaciones"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Asociaciones
              </Link>
              <Link
                to="/politica-de-privacidad"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Política de Privacidad
              </Link>
            </nav>
            <div className="mt-2">
              <a
                href="https://ko-fi.com/Y8Y11CCJPV"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 text-sm text-white bg-amber-400 hover:bg-amber-500 rounded-md shadow-sm transition-colors duration-200 ease-in-out"
              >
                <img src="https://ko-fi.com/img/cup-border.png" className="mr-1 h-4 w-4 object-contain" alt="Ko-fi" />
                <span className="text-xs">¡Apoya con un Cafecito!</span>
              </a>
            </div>
            <p className="mt-2 text-xs sm:text-sm">
              Desarrollado con <span aria-label="corazón" role="img">❤️</span> por <a href="https://www.elelier.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">elelier</a>
            </p>
          </div>
        </footer>

        {/* Mobile bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-40 rounded-t-[1.5rem] border-t border-gray-200 bg-white/95 shadow-[0_-14px_35px_rgba(15,23,42,0.16)] backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 md:hidden">
          <div className="grid h-14 grid-cols-3">
            <Link
              to="/"
              aria-label="Ir al inicio"
              className={`flex flex-col items-center justify-center ${location.pathname === '/' ? getBottomNavActiveClass() : 'text-gray-500'}`}
            >
              <IoHomeOutline className="mb-0.5 text-lg" />
              <span className="text-[0.68rem]">Inicio</span>
            </Link>
            <Link
              to="/datos-y-apis#metodologia-y-limites"
              aria-label="Ver datos, fuentes y metodología"
              className={`flex flex-col items-center justify-center ${location.pathname === '/datos-y-apis' ? getBottomNavActiveClass() : 'text-gray-500'}`}
            >
              <IoLayersOutline className="mb-0.5 text-lg" />
              <span className="text-[0.68rem]">Datos</span>
            </Link>
            <Link
              to="/asociaciones#desahogate"
              aria-label="Ver acciones ciudadanas"
              className={`flex flex-col items-center justify-center ${location.pathname === '/asociaciones' ? getBottomNavActiveClass() : 'text-gray-500'}`}
            >
              <IoLinkOutline className="mb-0.5 text-lg" />
              <span className="text-[0.68rem]">Acción</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
