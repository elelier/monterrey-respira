import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

import PrivacyPolicy from './PrivacyPolicy';

describe('PrivacyPolicy', () => {
  it('describes only privacy behaviors backed by the current runtime', () => {
    render(<PrivacyPolicy />);

    const policyText = document.body.textContent ?? '';

    expect(policyText).toContain('Google Analytics 4');
    expect(policyText).toContain('VITE_GOOGLE_ANALYTICS_ID');
    expect(policyText).toContain('localStorage');
    expect(policyText).toContain('una hora');
    expect(policyText).toMatch(/geolocalización en el navegador/i);
    expect(policyText).toContain('Core DB');
    expect(policyText).toContain('idioma del navegador');
    expect(policyText).toContain('zona horaria');
    expect(policyText).toContain('No se solicitan');

    expect(policyText).not.toMatch(/AdSense|anuncios personalizados|interacciones publicitarias/i);
    expect(policyText).not.toMatch(/30 días|24 horas|encriptación|cifrado/i);
    expect(policyText).not.toMatch(/Pendiente de definir|Correo electrónico:|Teléfono:|Dirección:/i);
  });
});
