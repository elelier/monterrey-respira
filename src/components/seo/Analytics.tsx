// src/components/seo/Analytics.tsx
import React from 'react';
import ReactGA from 'react-ga4';

interface AnalyticsProps {
  trackingId: string;
}

export const Analytics: React.FC<AnalyticsProps> = ({ trackingId }) => {
  ReactGA.initialize(trackingId);

  React.useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  return null;
};