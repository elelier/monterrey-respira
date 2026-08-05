import { motion } from 'framer-motion';
import { IoLogoGithub } from 'react-icons/io5';
import Layout from '../components/Layout';
import DataTrustExplainer from '../components/DataTrustExplainer';
import { PageActions, PageMasthead, Section, SurfaceCard } from '../components/ui/VisualPrimitives';

const repositories = [
  {
    title: 'Pipeline de datos',
    description: 'Repositorio que contiene el código del pipeline de datos y procesamiento:',
    href: 'https://github.com/elelier/airquality_pipeline',
    label: 'airquality_pipeline →',
    items: ['Consulta de proveedores externos', 'Validación antes de guardar lecturas', 'Base de datos Supabase', 'Automatización con GitHub Actions'],
  },
  {
    title: 'Webapp frontend',
    description: 'Repositorio que contiene la aplicación web:',
    href: 'https://github.com/elelier/monterrey-respira',
    label: 'monterrey-respira →',
    items: ['Interfaz de usuario', 'Visualización de datos', 'Estados de frescura y degradación', 'Documentación técnica'],
  },
  {
    title: 'Estructura general',
    description: 'Ambos repositorios trabajan en conjunto para proporcionar una solución completa:',
    items: ['Separación clara de responsabilidades', 'Desarrollo independiente', 'Despliegue público en Cloudflare Pages', 'Mantenimiento modular'],
  },
];

export default function DatosYApis() {
  return (
    <Layout>
      <div className="mx-auto max-w-5xl">
        <PageMasthead
          eyebrow="Transparencia de datos"
          title="Datos, metodología y límites"
          description="De dónde salen las lecturas, qué significan los huecos de datos y qué no debe interpretarse como una promesa de MtyRespira."
        />

        <Section ariaLabel="Metodología y límites" className="mt-0">
          <DataTrustExplainer />
        </Section>

        <Section ariaLabel="Repositorios y estructura técnica">
          <div className="section-header">
            <div>
              <p className="section-header__eyebrow">Trazabilidad</p>
              <h2 className="section-header__title">Repositorios y estructura técnica</h2>
            </div>
            <PageActions>
              <a href="https://github.com/elelier/monterrey-respira" target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full border border-[var(--mty-border)] px-4 py-2 text-sm font-bold text-[var(--mty-accent)] transition hover:border-[var(--mty-accent)] hover:bg-[var(--mty-accent-soft)]">
                <IoLogoGithub className="mr-2 text-lg" />
                Ver código
              </a>
            </PageActions>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {repositories.map((repository) => (
              <motion.div key={repository.title} whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300 }}>
                <SurfaceCard className="h-full p-5">
                  <h3 className="mb-2 text-lg font-bold text-[var(--mty-text)]">{repository.title}</h3>
                  <p className="mb-3 text-sm leading-6 text-[var(--mty-muted-text)]">{repository.description}</p>
                  {repository.href && <a href={repository.href} target="_blank" rel="noopener noreferrer" className="mb-3 inline-block text-sm font-bold text-[var(--mty-accent)] hover:text-[var(--mty-focus)]">{repository.label}</a>}
                  <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--mty-muted-text)]">
                    {repository.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </SurfaceCard>
              </motion.div>
            ))}
          </div>
        </Section>
      </div>
    </Layout>
  );
}
