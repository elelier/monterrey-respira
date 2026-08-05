import Layout from '../components/Layout';
import { Callout, PageMasthead, Section, SurfaceCard } from '../components/ui/VisualPrimitives';

interface PrivacyGroup {
  title: string;
  items: string[];
}

const groups: PrivacyGroup[] = [
  {
    title: '1. Uso de Google Analytics 4',
    items: [
      'La aplicación inicializa Google Analytics 4 y envía una vista de página únicamente cuando el deployment tiene configurada la variable VITE_GOOGLE_ANALYTICS_ID.',
      'Si esa variable no está configurada, la integración de analítica no se inicializa.',
    ],
  },
  {
    title: '2. Geolocalización en el navegador',
    items: [
      'La opción "Usar mi ubicación" solicita permiso al navegador y usa la posición recibida para encontrar el municipio compatible más cercano.',
      'En el flujo del selector, la posición exacta se usa en el navegador; las señales de cobertura envían una ciudad de referencia, una distancia redondeada y un rango de distancia, no las coordenadas exactas.',
    ],
  },
  {
    title: '3. Información guardada localmente',
    items: [
      'El sitio usa localStorage para conservar la preferencia de tema, el municipio seleccionado y una copia temporal de lecturas de calidad del aire junto con su marca de tiempo.',
      'La copia local de lecturas se considera válida durante una hora; después se ignora y puede solicitarse una lectura nueva. No se afirma aquí un periodo de retención para datos almacenados por servicios externos.',
      'La aplicación no escribe cookies propias mediante document.cookie y no monta un flujo propio de consentimiento de cookies en las rutas públicas actuales.',
    ],
  },
  {
    title: '4. Señales de producto',
    items: [
      'Cuando las variables públicas de Core DB están configuradas, el sitio puede enviar señales de compartir ciudad y de demanda fuera de cobertura mediante la RPC submit_signal.',
      'La señal de compartir puede incluir ciudad, ruta, método de compartir, AQI disponible, estado de frescura, idioma del navegador y zona horaria.',
      'La señal fuera de cobertura puede incluir la ciudad compatible más cercana, distancia redondeada, rango de distancia, área de cobertura, idioma del navegador y zona horaria.',
      'Core DB se usa para estas señales de producto; no es la fuente de las lecturas ambientales.',
    ],
  },
  {
    title: '5. Datos que no solicita la interfaz pública',
    items: [
      'No se solicitan nombre, correo electrónico, teléfono, dirección, cuenta de usuario ni formulario de contacto.',
    ],
  },
  {
    title: '6. Retención, seguridad y límites de esta descripción',
    items: [
      'El repositorio solo define la expiración de una hora para la copia local de lecturas descrita arriba. No define periodos de retención para Google Analytics 4 ni para las señales de Core DB.',
      'Esta página no enumera medidas de seguridad específicas porque el repositorio no define un catálogo público de controles.',
      'La descripción se limita a comportamientos técnicos verificables y queda sujeta a aprobación del contenido legal y del responsable correspondiente.',
    ],
  },
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
          description="Descripción factual de los datos técnicos que el producto puede usar en el navegador y de las señales de producto que puede enviar cuando la configuración correspondiente está habilitada."
        />

        <Callout tone="warning" title="Contenido pendiente de aprobación">
          La fecha de entrada en vigor y la identidad o contacto del responsable legal aún no están definidos en el repositorio. Este documento describe únicamente comportamientos técnicos verificables y requiere revisión humana antes de considerarse definitivo.
        </Callout>

        <Section ariaLabel="Comportamientos de privacidad">
          <div className="section-header"><h2 className="section-header__title">Comportamientos descritos</h2></div>
          <div className="grid gap-4 md:grid-cols-2">
            {groups.map((group) => <PrivacyGroupCard key={group.title} group={group} />)}
          </div>
        </Section>

        <Section ariaLabel="Alcance de esta política">
          <SurfaceCard className="space-y-4 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[var(--mty-accent)]">Alcance</h2>
            <p className="leading-7 text-[var(--mty-muted-text)]">
              Las lecturas ambientales provienen del flujo público de Supabase y sus RPC de consulta. Esta página no agrega fuentes de datos, no define políticas de terceros y no sustituye la revisión legal pendiente.
            </p>
          </SurfaceCard>
        </Section>
      </div>
    </Layout>
  );
}
