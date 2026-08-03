import type { ElementType, ReactNode } from 'react';

interface PageMastheadProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  action?: ReactNode;
  className?: string;
}

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

interface SurfaceCardProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

interface InfoPillProps {
  tone?: 'neutral' | 'accent' | 'status';
  children: ReactNode;
  className?: string;
}

interface CalloutProps {
  tone?: 'info' | 'warning' | 'success' | 'neutral';
  title?: string;
  children: ReactNode;
  className?: string;
}

const joinClasses = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ');

export function PageMasthead({ eyebrow, title, description, actions, className }: PageMastheadProps) {
  return (
    <header className={joinClasses('visual-masthead', className)}>
      <div>
        {eyebrow && <p className="visual-masthead__eyebrow">{eyebrow}</p>}
        <h1 className="visual-masthead__title">{title}</h1>
        {description && <p className="visual-masthead__description">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

export function Section({ id, children, className, ariaLabel }: SectionProps) {
  return (
    <section id={id} aria-label={ariaLabel ?? id} className={joinClasses('section-block', className)}>
      {children}
    </section>
  );
}

export function SectionHeader({ eyebrow, title, description, action, className }: PageMastheadProps) {
  return (
    <div className={joinClasses('section-header', className)}>
      <div>
        {eyebrow && <p className="section-header__eyebrow">{eyebrow}</p>}
        <h2 className="section-header__title">{title}</h2>
        {description && <p className="section-header__description">{description}</p>}
      </div>
      {action && <div className="page-actions">{action}</div>}
    </div>
  );
}

export function SurfaceCard({ as: Component = 'article', children, className }: SurfaceCardProps) {
  return <Component className={joinClasses('surface-card', className)}>{children}</Component>;
}

export function InfoPill({ tone = 'neutral', children, className }: InfoPillProps) {
  return <span className={joinClasses('info-pill', `info-pill--${tone}`, className)}>{children}</span>;
}

export function Callout({ tone = 'neutral', title, children, className }: CalloutProps) {
  return (
    <aside role="note" className={joinClasses('callout', `callout--${tone}`, className)}>
      {title && <strong className="callout__title">{title}</strong>}
      <div>{children}</div>
    </aside>
  );
}

export function PageActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={joinClasses('page-actions', className)}>{children}</div>;
}
