import { AirQualityProvider } from './context/AirQualityContext';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Asociaciones from './pages/Asociaciones';
import AcercaDe from './pages/AcercaDe';
import DatosYApis from './pages/DatosYApis';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RouteMetadata from './components/RouteMetadata';
import './App.css';

// Componente que se asegura de que la página se desplace hacia arriba al navegar
// y respeta anchors internos como /asociaciones#desahogate.
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const elementId = decodeURIComponent(hash.replace('#', ''));
    const scrollToHashElement = () => {
      document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    window.requestAnimationFrame(scrollToHashElement);
  }, [pathname, hash]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AirQualityProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/asociaciones" element={<Asociaciones />} />
          <Route path="/acerca-de" element={<AcercaDe />} />
          <Route path="/datos-y-apis" element={<DatosYApis />} />
          <Route path="/politica-de-privacidad" element={<PrivacyPolicy />} />
        </Routes>
        <RouteMetadata />
      </AirQualityProvider>
    </Router>
  );
}

export default App;
