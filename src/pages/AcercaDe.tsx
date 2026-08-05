import { motion } from 'framer-motion';
import { IoLogoGithub } from 'react-icons/io5';
import Layout from '../components/Layout';
import { PageActions, PageMasthead, Section, SurfaceCard } from '../components/ui/VisualPrimitives';

const sections = [
  {
    title: 'Nuestra misión',
    paragraphs: [
      'MonterreyRespira es una plataforma diseñada para proporcionar información clara y accesible sobre la calidad del aire en Monterrey y su área metropolitana. Nuestro objetivo es ayudar a la ciudadanía a leer mediciones disponibles y entender cuándo un dato puede estar retrasado o no disponible.',
      'Creemos que la transparencia y el acceso a la información son fundamentales para fomentar la conciencia ambiental y promover acciones tanto individuales como colectivas que contribuyan a un aire más limpio para todos.',
    ],
  },
  {
    title: '¿Cómo funciona?',
    paragraphs: [
      'MonterreyRespira consume lecturas normalizadas desde Supabase. El AQI proviene de WAQI/AQICN y los campos meteorológicos se presentan como contexto cuando vienen en la lectura reportada.',
      'La plataforma presenta el Índice de Calidad del Aire (AQI), contaminante dominante cuando existe y recomendaciones generales según el estado reportado.',
      'También ofrecemos información sobre los principales contaminantes, sus efectos en la salud y recursos educativos para entender mejor la problemática de la contaminación atmosférica. MtyRespira no reemplaza avisos de emergencia.',
    ],
  },
  {
    title: 'Nuestro equipo',
    paragraphs: [
      'MonterreyRespira es un proyecto desarrollado por elelier para hacer más legibles las lecturas ambientales disponibles de Monterrey.',
      'La mejora continua se enfoca en claridad pública, trazabilidad de datos y estados honestos cuando los proveedores externos se retrasan o no entregan campos.',
    ],
  },
];

export default function AcercaDe() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        <PageMasthead
          eyebrow="El proyecto"
          title="Acerca de MonterreyRespira"
          description="Una lectura pública, comprensible y honesta de la calidad del aire en la zona metropolitana."
          actions={(
            <PageActions>
              <a href="https://github.com/elelier/monterrey-respira" target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full bg-[var(--mty-accent)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--mty-focus)]">
                <IoLogoGithub className="mr-2 text-xl" />
                Contribuye en GitHub
              </a>
            </PageActions>
          )}
        />

        <div className="grid gap-5">
          {sections.map((section) => (
            <Section key={section.title} ariaLabel={section.title} className="my-0">
              <SurfaceCard className="p-6 sm:p-8">
                <h2 className="mb-4 text-xl font-bold text-[var(--mty-accent)] sm:text-2xl">{section.title}</h2>
                <div className="space-y-4 text-[var(--mty-muted-text)] leading-7">
                  {section.paragraphs.map((paragraph) => (
                    <motion.p key={paragraph} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                      {paragraph}
                    </motion.p>
                  ))}
                </div>
              </SurfaceCard>
            </Section>
          ))}
        </div>
      </div>
    </Layout>
  );
}
