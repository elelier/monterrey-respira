import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AirQualityStatus } from '../types';
import Recommendations from './Recommendations';

const statuses: AirQualityStatus[] = [
  'good',
  'moderate',
  'unhealthy-sensitive',
  'unhealthy',
  'very-unhealthy',
  'hazardous',
  'unknown',
];

describe('Recommendations', () => {
  it.each(statuses)('keeps readable dark surfaces for %s', (status) => {
    render(<Recommendations status={status} />);
    const items = screen.getAllByRole('listitem');

    expect(items).toHaveLength(3);
    expect(Array.from(items[0].classList).some((className) => className.startsWith('dark:bg-'))).toBe(true);
    expect(Array.from(items[0].classList).some((className) => className.startsWith('dark:border-'))).toBe(true);
    expect(Array.from(items[0].firstElementChild?.classList ?? []).some((className) => className.startsWith('dark:bg-'))).toBe(true);
  });
});
