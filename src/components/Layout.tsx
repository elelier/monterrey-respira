import { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAirQuality } from '../context/AirQualityContext';
import { getMainLogoIcon } from '../utils/airQualityUtils';
import { Link, useLocation } from 'react-router-dom';
import { IoHomeOutline, IoInformationCircleOutline, IoLayersOutline, IoLinkOutline, IoMenuOutline } from 'react-icons/io5';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme, airQualityData } = useAirQuality();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      {/* Header - Now sticky and mobile-optimized */}
      <header className={`sticky top-0 z-30 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 ${theme ? `bg-gradient-to-r ${theme.gradient}` : 'bg-white/90 dark:bg-slate-900/90'}`}>
        <div className="container mx-auto py-3 md:py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
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
                  const breathAnimation = {
                    scale: [1, 1.05, 1],
                    opacity: [1, 0.95, 1],
                    transition: {
                      duration: 4,
                      repeat: 1,
                      ease: "easeInOut"
                    }
                  };
                  logoElement.animate(breathAnimation, {
                    duration: 4000,
                    fill: "forwards"
                  });
                }
              }}
            >
              <motion.div 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mr-2 sm:mr-3 logo-container"
                whileHover={{
                  scale: 1.1,
                  transition: { duration: 0.3 }
                }}
              >
                <img
                  src={getMainLogoIcon()}
                  alt="Logo Monterrey Respira"
                  className="w-6 h-6 sm:w-6 sm:h-6"
                />
              </motion.div>
              <div className="logo-container">
                <h1 className={`text-lg sm:text-2xl font-bold ${theme ? 'text-white' : 'text-black'} leading-tight transition-colors duration-500`}>MonterreyRespira</h1>
                <p className={`text-xs sm:text-sm ${theme ? 'text-slate-200' : 'text-gray-600'} hidden sm:block transition-colors duration-500`}>Calidad del Aire en Tiempo Real</p>
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
              to="/datos-y-apis" 
              className={`px-3 py-2 rounded-md ${location.pathname === '/datos-y-apis' ? 'bg-white/20' : 'hover:bg-white/10'} text-white transition-colors`} 
            >
              Datos y APIs
            </Link>
            <Link 
              to="/asociaciones" 
              className={`px-3 py-2 rounded-md ${location.pathname === '/asociaciones' ? 'bg-white/20' : 'hover:bg-white/10'} text-white transition-colors`} 
            >
              Asociaciones
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            {airQualityData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`hidden sm:flex items-center text-sm px-3 py-1 sm:px-4 sm:py-2 rounded-full ${getHeaderBgClass()}`}
              >
                <span className="font-semibold text-xs sm:text-sm">Actualizado: </span>
                <span className="ml-1 text-xs sm:text-sm">
                  {new Date(airQualityData.timestamp).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </motion.div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md md:hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <IoMenuOutline className="w-6 h-6 text-white" />            
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
              <Link to="/" className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                Inicio
              </Link>
              <Link to="/acerca-de" className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                Acerca de
              </Link>
              <Link to="/datos-y-apis" className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                Datos y APIs
              </Link>
              <Link to="/asociaciones" className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                Asociaciones
              </Link>
            </nav>
          </motion.div>
        )}
      </header>

      <main className="container mx-auto py-3 md:py-4 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="container mx-auto py-6 md:py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p className="text-xs sm:text-sm">MonterreyRespira {new Date().getFullYear()} - Monitoreando la calidad del aire en Monterrey, Nuevo León</p>
        <p className="mt-2 text-xs sm:text-sm hidden md:block">
          <Link
            to="/acerca-de"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Acerca de
          </Link>
          {' · '}
          <Link
            to="/datos-y-apis"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Datos y APIs
          </Link>
          {' · '}
          <Link
            to="/asociaciones"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Asociaciones
          </Link>
          {' · '}
          <a
            href="https://ko-fi.com/Y8Y11CCJPV"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            ¡Apoya el proyecto con un cafecito!
          </a>
        </p>
        <p className="mt-2 text-xs sm:text-sm">Desarrollado con <span aria-label="corazón" role="img">❤️< /span> por <a href="https://www.elelier.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">elelier</a></p>
      </footer>

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 md:hidden z-40">
        <div className="grid grid-cols-4 h-16">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center ${location.pathname === '/' ? getBottomNavActiveClass() : 'text-gray-500'}`}
          >
            <IoHomeOutline className="text-xl mb-1" />
            <span className="text-xs">Inicio</span>
          </Link>
          <Link
            to="/acerca-de"
            className={`flex flex-col items-center justify-center ${location.pathname === '/acerca-de' ? getBottomNavActiveClass() : 'text-gray-500'}`}
          >
            <IoInformationCircleOutline className="text-xl mb-1" />
            <span className="text-xs">Acerca de</span>
          </Link>
          <Link
            to="/datos-y-apis"
            className={`flex flex-col items-center justify-center ${location.pathname === '/datos-y-apis' ? getBottomNavActiveClass() : 'text-gray-500'}`}
          >
            <IoLayersOutline className="text-xl mb-1" />
            <span className="text-xs">Datos</span>
          </Link>
          <Link
            to="/asociaciones"
            className={`flex flex-col items-center justify-center ${location.pathname === '/asociaciones' ? getBottomNavActiveClass() : 'text-gray-500'}`}
          >
            <IoLinkOutline className="text-xl mb-1" />
            <span className="text-xs">Enlaces</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
