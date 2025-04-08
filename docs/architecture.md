# Arquitectura de MonterreyRespira

## Visión General

MonterreyRespira es una aplicación web moderna que proporciona información en tiempo real sobre la calidad del aire en Monterrey y su área metropolitana. La arquitectura está diseñada para ser escalable, mantenible y accesible, siguiendo principios de desarrollo web moderno.

### Arquitectura General

**Frontend (React + TypeScript):**
- Desplegado en Netlify
- UI dinámica y responsiva
- Sistema de temas basado en calidad del aire
- Optimización para rendimiento

**Backend (Serverless):**
- Buildship para lógica de negocio
- Supabase para persistencia
- Cron jobs para actualización de datos

**Flujo de Datos:**
1. **Usuario:** Interactúa con la UI React
2. **Frontend:** Solicita datos a Buildship
3. **API Backend:** Consulta Supabase
4. **Base de Datos:** Almacena datos de calidad del aire
5. **Pipeline de Datos:** Actualiza datos periódicamente
6. **API Externa:** Obtiene datos de AirVisual

### Seguridad y Protección

*   **Autenticación:**
    *   JWT para usuarios
    *   API keys protegidas
    *   Validación de tokens
    *   Sesiones seguras

*   **Validación:**
    *   Sanitización de datos
    *   Validación de formularios
    *   Protección contra XSS
    *   Protección contra CSRF

### Monitoreo y Logging

*   **Sistema de Logging:**
    *   Logs de errores
    *   Logs de rendimiento
    *   Logs de acceso
    *   Logs de seguridad

*   **Telemetría:**
    *   Métricas de uso
    *   Rendimiento
    *   Errores
    *   Accesibilidad

## Arquitectura Frontend (Detalle - React)

La aplicación frontend está construida con React y TypeScript, desplegada en Netlify.

### Estructura del Proyecto

```
monterrey-respira/
├── public/           # Archivos estáticos
├── src/
│ ├── assets/         # Recursos multimedia
│ │   ├── images/     # Imágenes optimizadas
│ │   ├── icons/      # Iconos SVG
│ │   └── fonts/      # Fuentes tipográficas
│ ├── components/     # Componentes UI reutilizables
│ │   ├── ui/         # Componentes básicos
│ │   ├── layout/     # Componentes de layout
│ │   └── features/   # Componentes por funcionalidad
│ ├── context/        # Context API
│ │   └── AirQuality/ # Contexto de datos y temas
│ ├── pages/         # Componentes de rutas
│ │   ├── Dashboard/  # Página principal
│ │   ├── Data/       # Página de datos
│ │   └── About/      # Página sobre el proyecto
│ ├── services/      # Integración con APIs
│ │   ├── api/       # Llamadas a Buildship
│ │   └── utils/      # Funciones auxiliares
│ ├── types/         # Tipos TypeScript
│ │   ├── api/       # Tipos de API
│ │   └── components/ # Tipos de componentes
│ ├── utils/         # Utilidades compartidas
│ │   ├── helpers/   # Funciones auxiliares
│ │   └── constants/ # Valores constantes
│ └── config/        # Configuración global
│     ├── theme/     # Configuración de temas
│     └── settings/  # Configuración de aplicación
└── ...             # Archivos de configuración
```

### Patrones y Principios

*   **Gestión de Estado**
    *   **Context API:**
        *   AirQualityContext: Gestión de datos y temas
        *   AuthenticationContext: Gestión de autenticación
        *   UIContext: Estado de interfaz
    *   **Local State:**
        *   useState para componentes
        *   useEffect para efectos secundarios
        *   useReducer para lógica compleja
        *   Optimización: React.memo para componentes, useCallback para callbacks, useMemo para cálculos, Lazy loading para componentes pesados

*   **Rendimiento y Optimización**
    *   **Caché:**
        *   localStorage para datos
        *   sessionStorage para UI
        *   IndexedDB para datos pesados
    *   **Code Splitting:**
        *   Rutas dinámicas
        *   Componentes por demanda
        *   Bundles optimizados
    *   **Assets:**
        *   Imágenes optimizadas
        *   Fuentes cargadas por demanda
        *   Lazy loading de recursos

*   **Accesibilidad**
    *   **Semántica:**
        *   Roles ARIA correctos
        *   Estructura semántica
        *   Etiquetas descriptivas
    *   **Interactividad:**
        *   Teclado navigation
        *   Focus management
        *   Screen reader support
    *   **Visual:**
        *   Contraste WCAG 2.1 AAA
        *   Soporte para daltónicos
        *   Tamaño de texto ajustable

### Sistema de Caché y Estado

*   **Gestión de Estado Global**
    *   **AirQualityContext:**
        *   Datos de calidad del aire
        *   Estado de selección de ciudad
        *   Preferencias de usuario
        *   Configuraciones de visualización

*   **Sistema de Caché**
    *   **Caché Local (localStorage):**
        *   Clave: 'airQualityDataCache'
        *   Tiempo de expiración: 1 hora
        *   Timestamp de actualización
        *   Datos de última lectura
    *   **Estrategia de Caché:**
        *   Verificación automática al iniciar
        *   Actualización automática al expirar
        *   Almacenamiento de datos frescos
        *   Manejo de datos expirados

### Sistema de Temas y Animaciones

*   **Estructura de Temas Dinámicos**
    *   **Estados de Calidad del Aire**
        *   Bueno: Verde (#4ADE80)
        *   Moderado: Ámbar (#FBBF24)
        *   Insalubre: Naranja (#FB923C)
        *   Muy Insalubre: Rojo (#F87171)
        *   Peligroso: Púrpura (#C084FC)
        *   Muy Peligroso: Rosa (#9F1239)
    *   **Características Dinámicas**
        *   Gradientes contextuales
        *   Ajuste automático de contraste
        *   Transiciones suaves
        *   Efectos de blur
    *   **Optimización Visual**
        *   Sombras contextuales
        *   Hover effects
        *   Transiciones de color
        *   Animaciones suaves

*   **Sistema de Animaciones**
    *   **Biblioteca Principal**
        *   **Framer Motion:**
            *   Animaciones fluidas
            *   Gestos táctiles
            *   Optimización de rendimiento
            *   Compatibilidad con React
    *   **Transiciones de Estado**
        *   **Entrada/Salida:**
            *   Fade-in para elementos
            *   Slide-up para tarjetas
            *   Scale-up para botones
            *   Fade-out para elementos
        *   **Acciones de Usuario:**
            *   Hover effects
            *   Click animations
            *   Drag and drop
            *   Scroll animations
    *   **Transiciones de Tema**
        *   Transiciones suaves de color
        *   Gradientes dinámicos
        *   Ajuste automático de contraste
        *   Efectos de blur en cambios
    *   **Estado de Carga**
        *   Loading spinners
        *   Skeleton loading
        *   Progress indicators
        *   Fade transitions
    *   **Efectos Visuales**
        *   Efectos de blur en fondo
        *   Glassmorphism en elementos
        *   Efectos de profundidad
        *   Hover effects 3D

*   **Optimización de Rendimiento**
    *   **Animaciones Performantes**
        *   Uso de GPU
        *   Optimización de frames
        *   Animaciones suaves
        *   Reducción de re-renders
    *   **Carga Lazy**
        *   Animaciones solo cuando visible
        *   Suspense para componentes
        *   Optimización de recursos
        *   Priorización de animaciones



### Sistema de Optimización de Rendimiento

*   **Caché de Datos**
    *   **Implementación Local:**
        *   Clave: 'airQualityDataCache'
        *   Tiempo de expiración: 1 hora
        *   Timestamp de actualización
        *   Datos de última lectura
    *   **Estrategia de Caché:**
        *   Verificación automática al iniciar
        *   Actualización automática al expirar
        *   Almacenamiento de datos frescos
        *   Manejo de datos expirados

*   **Carga Lazy de Componentes**
    *   **Componentes Pesados:**
        *   Mapas (Leaflet)
        *   Gráficos (Chart.js)
        *   Componentes de visualización
        *   Librerías externas
    *   **Implementación:**
        *   `React.lazy` para componentes
        *   `Suspense` para estados de carga
        *   Lazy loading de assets
        *   Priorización de recursos

*   **Optimización de Assets**
    *   **Imágenes:**
        *   Optimización de tamaño
        *   Formatos modernos (WebP)
        *   Lazy loading de imágenes
        *   Redimensionamiento responsivo
    *   **Fuentes:**
        *   Montserrat (sans-serif)
        *   Work Sans (display)
        *   Optimización de font-display
        *   Carga solo de pesos necesarios
    *   **Iconos:**
        *   React Icons
        *   SVG optimizados
        *   Sprites cuando necesario
        *   Lazy loading

*   **Optimización de Componentes**
    *   **React.memo:**
        *   Componentes reutilizables
        *   Props que no cambian
        *   Optimización de renders
        *   Memoización de listas
    *   **useCallback:**
        *   Funciones de callback
        *   Handlers de eventos
        *   Callbacks de render
        *   Memoización de funciones
    *   **useMemo:**
        *   Cálculos costosos
        *   Objetos complejos
        *   Optimización de memoria
        *   Memoización de datos

*   **Optimización de Rendimiento General**
    *   **Virtualización:**
        *   Listas largas
        *   Tablas de datos
        *   Scroll infinito
        *   Componentes virtuales
    *   **Code Splitting:**
        *   Rutas dinámicas
        *   Componentes por demanda
        *   Bundles optimizados
        *   Carga diferida
    *   **Monitoreo:**
        *   Performance tracking
        *   Lighthouse
        *   Web Vitals
        *   Telemetry

### Sistema de Accesibilidad

*   **Contenido Descriptivo**
    *   **Alt Text:**
        *   Descripciones detalladas para imágenes
        *   Texto alternativo para iconos
        *   Descripciones de gráficos y mapas
        *   Alt text para elementos visuales
    *   **Aria Labels:**
        *   Etiquetas descriptivas para controles
        *   Aria-live para actualizaciones
        *   Aria-describedby para elementos
        *   Aria-hidden para elementos visuales

*   **Soporte para Lectores de Pantalla**
    *   **Estructura Semántica:**
        *   Encabezados jerárquicos
        *   Roles ARIA correctos
        *   Landmarks semánticos
        *   Estructura de navegación
    *   **Navegación:**
        *   Skip links para contenido principal
        *   Menús accesibles
        *   Enlaces con texto descriptivo
        *   Etiquetas de formularios

*   **Contraste y Visibilidad**
    *   **Ajuste de Contraste:**
        *   Ratio mínimo WCAG 2.1
        *   Modo alto contraste
        *   Ajuste automático por tema
        *   Soporte para daltónicos
    *   **Visualización:**
        *   Texto legible
        *   Tamaños de fuente ajustables
        *   Espaciado adecuado
        *   Colores distintivos

*   **Navegación por Teclado**
    *   **Tab Navigation:**
        *   Orden lógico de tab
        *   Enfoque visible
        *   Saltos de sección
        *   Accesos directos
    *   **Atajos de Teclado:**
        *   Navegación entre componentes
        *   Acciones principales
        *   Modos de vista
        *   Acceso rápido

*   **Interfaz Adaptativa**
    *   **Modos de Visualización:**
        *   Modo oscuro/claro
        *   Tamaño de texto ajustable
        *   Espaciado adaptable
        *   Controles de zoom
    *   **Personalización:**
        *   Preferencias de usuario
        *   Temas accesibles
        *   Configuraciones de lectura
        *   Ayudas visuales

*   **Pruebas de Accesibilidad**
    *   **Herramientas de Prueba:**
        *   Lighthouse
        *   Axe
        *   WAVE
        *   Testing con lectores de pantalla
    *   **Evaluación:**
        *   WCAG 2.1 AAA
        *   ARIA best practices
        *   Keyboard testing
        *   Screen reader testing

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
    *   Componente React (vía AirQualityContext) verifica el caché local:
        *   Busca datos en `localStorage` con clave 'airQualityDataCache'
        *   Verifica si los datos son válidos (menos de 1 hora de antigüedad)
    *   Si hay datos en caché y son válidos:
        *   Usa los datos del caché
        *   Actualiza el estado y renderiza la UI
    *   Si no hay datos en caché o están expirados:
        *   Llama a `GET /latest-air-quality` en Buildship
        *   Buildship Endpoint ejecuta la función SQL `get_latest_air_quality_per_city` en Supabase
        *   Supabase devuelve la lectura más reciente por cada ciudad activa
        *   Buildship devuelve el JSON al Frontend
        *   React actualiza el estado y renderiza la UI con los datos frescos
        *   Los nuevos datos se almacenan en `localStorage` con un timestamp

Este enfoque separa las preocupaciones, permite que el frontend sea rápido (solo lee datos pre-procesados), y hace que el backend sea robusto y resiliente a fallos temporales de la API externa.