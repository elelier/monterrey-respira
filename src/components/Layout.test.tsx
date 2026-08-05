import { HelmetProvider } from 'react-helmet-async';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Layout from './Layout';
import { ThemeProvider } from '../context/ThemeContext';

vi.mock('../context/AirQualityContext', () => ({
  useAirQuality: () => ({
    theme: null,
    airQualityData: { timestamp: '2026-07-26T18:20:00Z' },
    selectedCity: { city_id: 'monterrey', name: 'Monterrey' },
  }),
}));

describe('Layout', () => {
  it('renders shared navigation, footer and a working theme control', () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/datos-y-apis']}>
          <ThemeProvider>
            <Layout><div>Contenido de prueba</div></Layout>
          </ThemeProvider>
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(screen.getByRole('link', { name: 'Datos y fuentes' })).toHaveClass('site-nav-link--active');
    expect(screen.getByRole('contentinfo')).toHaveClass('site-footer');
    expect(screen.getByRole('link', { name: 'Ver datos, fuentes y metodología' })).toBeInTheDocument();

    const measurementLabel = screen.getByText('Medición');
    const measurementValue = measurementLabel.nextElementSibling;
    expect(measurementValue).toHaveTextContent(/^\d{1,2}:\d{2}/);
    expect(measurementLabel.parentElement).toHaveClass('flex-col', 'sm:flex-row');

    const themeButton = screen.getByRole('button', { name: 'Cambiar a modo oscuro' });
    fireEvent.click(themeButton);
    expect(screen.getByRole('button', { name: 'Cambiar a modo claro' })).toBeInTheDocument();
    expect(document.documentElement).toHaveClass('dark');
  });
});
