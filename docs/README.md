# MonterreyRespira — documentación

MonterreyRespira es una aplicación web pública que presenta lecturas disponibles de calidad del aire para Monterrey y su área metropolitana.

El producto muestra AQI, contaminante principal cuando está disponible, contexto meteorológico y frescura de la medición reportada. No promete monitoreo en tiempo real: distingue entre la hora de medición, la actualización del pipeline horario y los estados degradados o sin lectura.

## Prerrequisitos

Para desarrollar y ejecutar MonterreyRespira localmente necesitas:

- Node.js 18 o superior.
- npm 9 o superior, o Bun.
- Git.
- La URL y la anon key del proyecto Supabase ambiental para lectura pública.

No necesitas una cuenta de Buildship ni credenciales de WAQI/AQICN, Open-Meteo o AirVisual para ejecutar el frontend. Los secretos de proveedor y `SUPABASE_SERVICE_ROLE_KEY` pertenecen exclusivamente al pipeline `elelier/airquality_pipeline`.

## Instalación y uso

1. Clona el repositorio:

```bash
git clone https://github.com/elelier/monterrey-respira.git
cd monterrey-respira
```

2. Instala las dependencias:

```bash
npm install
```

3. Copia `.env.example` a `.env` y completa, como mínimo:

```bash
VITE_SUPABASE_URL=tu_url_publica_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_supabase
```

El mismo archivo documenta las variables opcionales para analítica, AdSense y señales de producto en Core DB. Core DB no es una fuente de lecturas ambientales.

4. Inicia el servidor de desarrollo:

```bash
npm run dev
```

5. Abre `http://localhost:3000`.

6. Valida el frontend:

```bash
npm run lint
npm run build
```

El despliegue público vigente usa Cloudflare Pages. Configura ahí únicamente variables `VITE_*` públicas o publicables; nunca expongas `SUPABASE_SERVICE_ROLE_KEY`, `WAQI_API_TOKEN` ni `AIRVISUAL_API_KEY` en el frontend.

## Características clave

- **Lecturas disponibles:** AQI US, contaminante principal cuando el proveedor lo entrega y estado de frescura.
- **Contexto meteorológico:** campos canónicos de Open-Meteo cuando están disponibles; no sustituyen ni alteran el AQI.
- **Frontera de lectura:** Supabase RPC `get_latest_air_quality_per_city`; el productor vive en `elelier/airquality_pipeline`.
- **Pipeline horario:** GitHub Actions ejecuta el pipeline cada hora con WAQI/AQICN como proveedor AQI activo.
- **Visualización geográfica:** mapa, selección de ciudad y coordenadas normalizadas desde el contrato compartido.
- **Datos históricos:** gráficas basadas en mediciones almacenadas, sin inventar huecos.
- **Diseño accesible:** contempla estados degradados, lectura ausente y distintas necesidades de accesibilidad.

## Pila tecnológica

- **Frontend:** React, TypeScript y Vite.
- **Hosting:** Cloudflare Pages.
- **Datos públicos:** Supabase anon client y RPC `get_latest_air_quality_per_city`.
- **Base de datos ambiental:** Supabase PostgreSQL, principalmente `cities` y `air_quality_readings`.
- **Pipeline ambiental:** Python y GitHub Actions en `elelier/airquality_pipeline`.
- **Proveedor AQI activo:** WAQI/AQICN.
- **Proveedor de contexto meteorológico:** Open-Meteo.
- **Proveedor AQI legacy/fallback:** IQAir/AirVisual, solo para ejecuciones manuales controladas cuando su acceso esté confirmado como sano.

## Estado del proyecto

El contrato operativo actual es:

```text
WAQI/AQICN + Open-Meteo -> airquality_pipeline -> Supabase -> RPC -> frontend -> Cloudflare Pages
```

Consulta el [roadmap](./roadmap.md) para conocer el plan detallado.

## Documentación

- **[Índice documental](./DOCUMENTATION_INDEX.md):** mapa de documentos canónicos y controles de drift.
- **[PRD](./PRD.md):** alcance de producto y restricciones.
- **[Arquitectura](./architecture.md):** límites entre frontend, pipeline, Supabase y Cloudflare.
- **[Contrato compartido de datos](./shared-data-contract.md):** payloads, RPC, nullability y reglas de frescura.
- **[Pipeline de datos](./data-pipeline.md):** flujo técnico del productor horario y frontera de lectura.
- **[Freshness Truth UX](./freshness-truth-ux.md):** lenguaje y estados de frescura honestos.
- **[Roadmap](./roadmap.md):** fases, historias y gates.
- **[Contribución](./contributing.md):** guía para colaborar.
- **[Guía de estilo](./style-guide.md):** lineamientos visuales y de componentes.

Esta documentación ayuda a mantener el contrato vigente de MonterreyRespira, evitar regresiones de datos y comunicar con honestidad la frescura y cobertura disponibles.
