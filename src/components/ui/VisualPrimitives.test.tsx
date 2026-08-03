import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Callout, InfoPill, PageMasthead, Section, SurfaceCard } from './VisualPrimitives';

describe('VisualPrimitives', () => {
  it('composes a consistent masthead and section landmarks', () => {
    render(
      <PageMasthead
        eyebrow="Lecturas disponibles"
        title="Aire legible para la ciudad"
        description="Contexto claro para decidir mejor."
      />,
    );

    render(
      <Section id="metodologia">
        <SurfaceCard>
          <InfoPill tone="accent">Fuente pública</InfoPill>
          <Callout tone="info" title="Límite conocido">
            La actualización depende del pipeline.
          </Callout>
        </SurfaceCard>
      </Section>,
    );

    expect(screen.getByRole('heading', { name: 'Aire legible para la ciudad' })).toHaveClass('visual-masthead__title');
    expect(screen.getByRole('region', { name: 'metodologia' })).toHaveClass('section-block');
    expect(screen.getByText('Fuente pública')).toHaveClass('info-pill--accent');
    expect(screen.getByRole('note')).toHaveClass('callout--info');
  });
});
