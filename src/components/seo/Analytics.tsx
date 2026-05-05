// src/components/seo/Analytics.tsx
import { useEffect } from 'react';
import ReactGA from 'react-ga4';

interface AnalyticsProps {
  trackingId?: string;
}

export const Analytics = ({ trackingId }: AnalyticsProps) => {
  useEffect(() => {
    if (!trackingId) {
      return;
    }

    ReactGA.initialize(trackingId);
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname + window.location.search });
  }, [trackingId]);

  return null;
};
