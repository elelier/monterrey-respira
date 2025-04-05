# Arquitectura de MonterreyRespira

## Visión General del Sistema

MonterreyRespira sigue una arquitectura moderna basada en web, separando claramente el frontend (interfaz de usuario) del backend (lógica de datos y servicios). Se apoya fuertemente en servicios serverless para escalabilidad y mantenimiento reducido.

**Flujo General:**

1.  **Usuario:** Interactúa con la aplicación React desplegada en Netlify.
2.  **Frontend (React en Netlify):** Solicita datos de calidad del aire al endpoint API de Buildship. Muestra la información y adapta su UI.
3.  **API Backend (Buildship Endpoint):** Recibe la solicitud del frontend, consulta la base de datos Supabase (ejecutando una función SQL optimizada) y devuelve los datos más recientes.
4.  **Base de Datos (Supabase):** Almacena la configuración de las ciudades monitoreadas y el historial detallado de lecturas de calidad del aire.
5.  **Pipeline de Datos (Buildship Cron Job):** Se ejecuta periódicamente (ej. cada hora).
    *   Consulta la lista de ciudades activas en Supabase.
    *   Llama a la API externa (AirVisual) para obtener datos actualizados para cada ciudad (con lógica de reintento y manejo de errores).
    *   Procesa los datos recibidos.
    *   Inserta las nuevas lecturas en Supabase (`air_quality_readings`).
    *   Actualiza el estado de cada ciudad en Supabase (`cities`), incluyendo timestamps y resultados de la actualización.
6.  **API Externa (AirVisual):** Proporciona los datos crudos de calidad del aire y clima.

**Diagrama Conceptual:**
[Usuario] <--> [React App (Netlify)] <--> [Buildship API Endpoint] <--> [Supabase DB]
^
| (Inserts/Updates)
|
[Buildship Cron Workflow] <--------> [AirVisual API]
| ^
|_________| (Reads city list/status)
|
[Supabase DB]   


## Arquitectura Frontend (Detalle - React)

La aplicación frontend está construida con React y TypeScript, desplegada en Netlify.

### Estructura del Proyecto (Frontend)

monterrey-respira/
├── public/ # Archivos estáticos
├── src/ # Código fuente del frontend
│ ├── assets/ # Imágenes, iconos, etc.
│ ├── components/ # Componentes UI reutilizables (Botones, Tarjetas, Mapas)
│ ├── context/ # Context API para estado global (ej. AirQualityContext)
│ ├── hooks/ # Hooks personalizados (ej. useAirQualityData)
│ ├── layouts/ # Estructura de páginas (ej. MainLayout)
│ ├── pages/ # Componentes que representan rutas/vistas (ej. HomePage, CityDetailPage)
│ ├── services/ # Lógica para interactuar con APIs (ej. apiService.ts llamando a Buildship)
│ ├── styles/ # Estilos globales, temas (CSS Modules, Styled Components, etc.)
│ ├── types/ # Definiciones de tipos TypeScript (ej. AirQualityData, City)
│ ├── utils/ # Funciones auxiliares genéricas
│ ├── App.tsx # Componente Raíz, configuración de rutas
│ └── main.tsx # Punto de entrada, renderizado inicial
└── ... # Archivos de config (vite.config.ts, tsconfig.json, netlify.toml)


### Patrones y Principios (Frontend)

*   **Gestión de Estado:**
    *   **Context API:** Para estado global compartido (datos de calidad del aire, ciudad seleccionada, preferencias de usuario).
    *   **`useState`/`useEffect`:** Para estado local dentro de componentes.
    *   **(Potencialmente)** Librerías como Zustand o Jotai si la complejidad del estado crece.
*   **Obtención de Datos:**
    *   Se centraliza en `services/` que llaman al endpoint de Buildship (`GET /latest-air-quality`).
    *   Se usan hooks (`hooks/`) para encapsular la lógica de fetching y manejo de estado (loading, error).
    *   Se implementa un *fallback* inicial a datos simulados si la API falla durante el desarrollo temprano (como se menciona en el `architecture.md` original), aunque la meta es depender del backend robusto.
*   **Componentes Visuales:**
    *   **Reutilizables y Modulares:** Construidos en `components/`.
    *   **Responsivos:** Adaptables a diferentes tamaños de pantalla.
    *   **Tematización Dinámica:** Colores y estilos cambian según el nivel de AQI usando Contexto y/o CSS variables.
*   **Rendimiento:**
    *   `React.memo` y `useCallback` para evitar renders innecesarios.
    *   Lazy loading para componentes pesados (ej. librerías de mapas o gráficos) usando `React.lazy` y `Suspense`.
    *   Optimización de assets (imágenes, fuentes).

## Arquitectura Backend (Detalle - Serverless)

El backend es completamente serverless, aprovechando Buildship para la lógica y Supabase para la persistencia.

*   **Orquestación (Buildship):** Un workflow principal disparado por un `Schedule Trigger` (CRON) maneja todo el ciclo de vida de la actualización de datos. Ver [Pipeline de Datos](./data-pipeline.md) para el detalle paso a paso.
*   **API (Buildship):** Un `API Endpoint Trigger` expone los datos procesados al frontend. Actualmente, el endpoint principal es `GET /latest-air-quality`. Ver [API de Lectura](./data-pipeline.md#5-api-de-lectura-para-frontend-get-latest-air-quality).
*   **Base de Datos (Supabase):**
    *   Utiliza PostgreSQL.
    *   Esquema definido con tablas `cities` y `air_quality_readings`. Ver [Diseño de Base de Datos](./data-pipeline.md#3-diseño-de-base-de-datos-supabase).
    *   Se aprovechan funciones SQL (`get_latest_air_quality_per_city`) para consultas eficientes.
    *   Row Level Security (RLS) está habilitado; Buildship opera con la `service_role` key para bypass RLS.

## Flujo de Datos (Combinado)

1.  **Actualización Periódica (Backend):**
    *   Buildship Cron se activa.
    *   Obtiene lista de ciudades activas de Supabase.
    *   Para cada ciudad (priorizando fallidas/antiguas):
        *   Verifica si necesita actualización (intervalo > X min o último intento fallido).
        *   Si sí, llama a AirVisual API (con reintentos).
        *   Si éxito: Inserta lectura en `air_quality_readings`, actualiza `cities` (timestamp, estado='success', coords).
        *   Si error: Actualiza `cities` (estado='error: tipo_error').
        *   Si no necesita update: Actualiza `cities` (estado='skipped: up_to_date').
2.  **Solicitud del Usuario (Frontend):**
    *   Usuario abre la app o navega.
    *   Componente React (vía hook/context/service) llama a `GET /latest-air-quality` en Buildship.
    *   Buildship Endpoint ejecuta la función SQL `get_latest_air_quality_per_city` en Supabase.
    *   Supabase devuelve la lectura más reciente por cada ciudad activa.
    *   Buildship devuelve el JSON al Frontend.
    *   React actualiza el estado y renderiza la UI con los datos frescos y estilos correspondientes.

Este enfoque separa las preocupaciones, permite que el frontend sea rápido (solo lee datos pre-procesados), y hace que el backend sea robusto y resiliente a fallos temporales de la API externa.