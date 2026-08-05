import { HelmetProvider } from 'react-helmet-async';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import RouteMetadata from './RouteMetadata';

describe('RouteMetadata', () => {
  it('marks the visual laboratory route as noindex', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/lab/aqi-home-v2']}>
          <RouteMetadata />
        </MemoryRouter>
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(document.title).toContain('Laboratorio AQI Home V2');
      expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
    });
  });
});
