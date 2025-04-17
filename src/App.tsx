import { AirQualityProvider } from './context/AirQualityContext';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Asociaciones from './pages/Asociaciones';
import AcercaDe from './pages/AcercaDe';
import DatosYApis from './pages/DatosYApis';
import './App.css';
import PrivacyPolicy from './pages/PrivacyPolicy';


// Componente que se asegura de que la página se desplace hacia arriba al navegar
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    
    <Router >
      <ScrollToTop />
      <AirQualityProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/asociaciones" element={<Asociaciones />} />
          <Route path="/acerca-de" element={<AcercaDe />} />
          <Route path="/datos-y-apis" element={<DatosYApis />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </AirQualityProvider>
    </Router>
  );
}

export default App;
