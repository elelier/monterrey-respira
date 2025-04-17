// src/utils/adsense.ts
export interface AdSenseConfig {
    clientId: string;
    slots: {
      header: string;
      sidebar: string;
      content: string;
    };
    enabled: boolean;
    privacy: {
      consentRequired: boolean;
      consentMessage: string;
      consentLink: string;
    };
  }
  
  export const adsenseConfig: AdSenseConfig = {
    clientId: import.meta.env.VITE_ADSENSE_CLIENT_ID || '',
    slots: {
      header: import.meta.env.VITE_ADSENSE_SLOT_HEADER || '',
      sidebar: import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR || '',
      content: import.meta.env.VITE_ADSENSE_SLOT_CONTENT || ''
    },
    enabled: import.meta.env.VITE_ADSENSE_ENABLED === 'true',
    privacy: {
      consentRequired: true,
      consentMessage: 'Este sitio web utiliza AdSense para mostrar anuncios relevantes. Al continuar navegando, aceptas el uso de cookies y la política de privacidad.',
      consentLink: '/privacy-policy'
    }
  };