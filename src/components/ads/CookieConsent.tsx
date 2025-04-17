// src/components/ads/CookieConsent.tsx
import React, { useState, useEffect } from 'react';
import { adsenseConfig } from '../../utils/adsense';

interface CookieConsentProps {
  onAccept: () => void;
}

export const CookieConsent = ({ onAccept }: CookieConsentProps) => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('adsense_consent');
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('adsense_consent', 'true');
    setShowConsent(false);
    onAccept();
  };

  if (!showConsent) return null;

  return (
    <div className="cookie-consent">
      <p>{adsenseConfig.privacy.consentMessage}</p>
      <a href={adsenseConfig.privacy.consentLink}>Ver Política de Privacidad</a>
      <button onClick={handleAccept}>Aceptar</button>
    </div>
  );
};