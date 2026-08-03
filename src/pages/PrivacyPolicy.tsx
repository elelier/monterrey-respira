import Layout from '../components/Layout';
import { Callout, PageMasthead, Section, SurfaceCard } from '../components/ui/VisualPrimitives';

interface PrivacyGroup {
  title: string;
  items: string[];
}

const groups: PrivacyGroup[] = [
  {
    title: '1.1 Información que recopilamos automáticamente',
    items: ['Datos de uso del sitio web', 'Información del dispositivo', 'Datos de ubicación (solo para mostrar datos de calidad del aire)', 'Datos de navegación'],
  },
  {
    title: '1.2 Información de Google AdSense',
    items: ['Datos de visualización de anuncios', 'Interacciones con anuncios', 'Datos de geolocalización (para anuncios relevantes)'],
  },
  {
    title: '2.1 Uso de datos de usuarios',
    items: ['Mejorar la experiencia del usuario', 'Proporcionar información relevante sobre calidad del aire', 'Personalizar el contenido del sitio'],
  },
  {
    title: '2.2 Uso de datos de AdSense',
    items: ['Mostrar anuncios relevantes', 'Personalizar la publicidad según el contexto', 'Optimizar la entrega de anuncios'],
  },
  {
    title: '3.1 Cookies de AdSense',
    items: ['Mostrar anuncios relevantes', 'Medir el rendimiento de los anuncios', 'Personalizar la experiencia publicitaria'],
  },
  {
    title: '3.2 Cookies de rendimiento',
    items: ['Medir el uso del sitio web', 'Mejorar la funcionalidad', 'Optimizar el rendimiento'],
  },
  {
    title: '4.1 Medidas de seguridad',
    items: ['Encriptación de datos', 'Protección contra accesos no autorizados', 'Seguridad del sitio web'],
  },
  {
    title: '4.2 Retención de datos',
    items: ['Datos de uso: 30 días', 'Datos de ubicación: 24 horas', 'Datos de AdSense: según políticas de Google'],
  },
  {
    title: '5.1 Derechos de los usuarios',
    items: ['Acceder a tus datos', 'Corregir datos inexactos', 'Eliminar tus datos', 'Oponerte al procesamiento de datos'],
  },
  {
    title: '5.2 Control de anuncios',
    items: ['Opt-out de anuncios personalizados', 'Configurar preferencias de anuncios', 'Controlar cookies de AdSense'],
  },
];

const externalLinks = [
  ['Política de privacidad de Google AdSense', 'https://policies.google.com/privacy'],
  ['Términos de servicio de Google AdSense', 'https://www.google.com/adsense/localized-terms'],
  ['Política de cookies de Google', 'https://policies.google.com/technologies/cookies'],
];

function PrivacyGroupCard({ group }: { group: PrivacyGroup }) {
  return (
    <SurfaceCard className="p-5">
      <h3 className="mb-3 text-base font-bold text-[var(--mty-text)]">{group.title}</h3>
      <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--mty-muted-text)]">
        {group.items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </SurfaceCard>
  );
}

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="mx-auto max-w-5xl">
        <PageMasthead
          eyebrow="Documento público"
          title="Política de privacidad"
          description="Información sobre el uso descrito para navegación, ubicación del navegador y servicios externos de la web pública."
        />

        <Callout tone="warning" title="Contenido pendiente de revisión legal">
          La fecha de actualización y los datos de contacto del responsable aún no están definidos en el repositorio. Se mantienen explícitamente como pendientes y no se sustituyen por información inventada.
        </Callout>
        <p className="mt-4 text-sm text-[var(--mty-muted-text)]">Última actualización: Pendiente de definir</p>

        <Section ariaLabel="Información que recopilamos">
          <div className="section-header"><h2 className="section-header__title">1. Información que recopilamos</h2></div>
          <div className="grid gap-4 md:grid-cols-2">
            {groups.slice(0, 2).map((group) => <PrivacyGroupCard key={group.title} group={group} />)}
          </div>
        </Section>

        <Section ariaLabel="Uso de la información">
          <div className="section-header"><h2 className="section-header__title">2. Uso de la información</h2></div>
          <div className="grid gap-4 md:grid-cols-2">
            {groups.slice(2, 4).map((group) => <PrivacyGroupCard key={group.title} group={group} />)}
          </div>
        </Section>

        <Section ariaLabel="Cookies y tecnologías similares">
          <div className="section-header"><h2 className="section-header__title">3. Cookies y tecnologías similares</h2></div>
          <div className="grid gap-4 md:grid-cols-2">
            {groups.slice(4, 6).map((group) => <PrivacyGroupCard key={group.title} group={group} />)}
          </div>
        </Section>

        <Section ariaLabel="Protección de datos">
          <div className="section-header"><h2 className="section-header__title">4. Protección de datos</h2></div>
          <div className="grid gap-4 md:grid-cols-2">
            {groups.slice(6, 8).map((group) => <PrivacyGroupCard key={group.title} group={group} />)}
          </div>
        </Section>

        <Section ariaLabel="Tus derechos">
          <div className="section-header"><h2 className="section-header__title">5. Tus derechos</h2></div>
          <div className="grid gap-4 md:grid-cols-2">
            {groups.slice(8, 10).map((group) => <PrivacyGroupCard key={group.title} group={group} />)}
          </div>
        </Section>

        <Section ariaLabel="Cambios y contacto">
          <SurfaceCard className="space-y-6 p-6 sm:p-8">
            <div>
              <h2 className="mb-3 text-xl font-bold text-[var(--mty-accent)]">6. Cambios en la Política de Privacidad</h2>
              <p className="leading-7 text-[var(--mty-muted-text)]">Esta política puede actualizarse periódicamente. Los cambios significativos se comunicarán. Se mantendrá la fecha de última actualización.</p>
            </div>
            <div>
              <h2 className="mb-3 text-xl font-bold text-[var(--mty-accent)]">7. Contacto</h2>
              <p className="mb-3 leading-7 text-[var(--mty-muted-text)]">Si tienes preguntas sobre esta política de privacidad, puedes contactarnos a:</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--mty-muted-text)]">
                <li>Correo electrónico: Pendiente de definir</li>
                <li>Dirección: Pendiente de definir</li>
                <li>Teléfono: Pendiente de definir</li>
              </ul>
            </div>
          </SurfaceCard>
        </Section>

        <Section ariaLabel="Enlaces a recursos externos">
          <div className="section-header"><h2 className="section-header__title">8. Enlaces a recursos externos</h2></div>
          <div className="grid gap-3">
            {externalLinks.map(([label, href]) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="surface-card flex items-center justify-between p-4 font-semibold text-[var(--mty-accent)] transition hover:border-[var(--mty-accent)] hover:bg-[var(--mty-accent-soft)]">
                <span>{label}</span>
                <span aria-hidden="true">→</span>
              </a>
            ))}
          </div>
        </Section>
      </div>
    </Layout>
  );
}
