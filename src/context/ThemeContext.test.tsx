import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeContext';

describe('ThemeContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
    vi.restoreAllMocks();
  });

  it('applies an explicit dark theme and persists the preference', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

    act(() => result.current.setMode('dark'));

    expect(result.current.resolvedTheme).toBe('dark');
    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(window.localStorage.getItem('mtyRespiraThemeMode')).toBe('dark');
  });

  it('follows the system preference when the mode is system', () => {
    const listeners: ((event: MediaQueryListEvent) => void)[] = [];
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((_event, listener) => listeners.push(listener)),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }) as unknown as MediaQueryList);

    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

    expect(result.current.mode).toBe('system');
    expect(result.current.resolvedTheme).toBe('dark');
    expect(document.documentElement).toHaveClass('dark');

    act(() => result.current.setMode('light'));
    expect(document.documentElement).not.toHaveClass('dark');
    expect(listeners.length).toBeGreaterThan(0);
  });
});
