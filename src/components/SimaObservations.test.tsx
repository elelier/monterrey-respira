import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { fetchRecentSimaObservations } from '../services/apiService';
import SimaObservations from './SimaObservations';

vi.mock('../services/apiService', () => ({
  fetchRecentSimaObservations: vi.fn(),
}));

it('shows the persisted measurement, station, unit and local observation time', async () => {
  vi.mocked(fetchRecentSimaObservations).mockResolvedValue([{
    station_id: 'centro',
    station_name: 'Centro',
    municipality: 'Monterrey',
    observed_at: '2026-11-20T02:00:00Z',
    pollutant: 'O3',
    concentration: 24,
    unit: 'ppb',
  }]);

  render(<SimaObservations />);

  expect(await screen.findByText('24 ppb')).toBeInTheDocument();
  expect(screen.getByText('Centro, Monterrey')).toBeInTheDocument();
  expect(screen.getByText('O3')).toBeInTheDocument();
  expect(screen.getByText(/19 nov.*20:00/)).toHaveAttribute('datetime', '2026-11-20T02:00:00Z');
});
