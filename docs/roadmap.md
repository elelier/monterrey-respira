# Roadmap de MonterreyRespira

Este documento presenta la visión a futuro y las funcionalidades planificadas para MonterreyRespira, organizadas por fases de desarrollo. Nuestra infraestructura se basa en un frontend React desplegado en Netlify y un backend serverless (Buildship + Supabase) para la gestión y provisión de datos.

## Fase 1: Fundación Backend y Mejoras a corto plazo (1-3 meses)

### 1.1 Implementación de Backend de Datos (Buildship + Supabase)
*   **Objetivo:** Crear una capa intermedia para gestionar APIs externas, mejorar rendimiento y controlar el flujo de datos.
*   [ ] **Configurar Infraestructura Base:**
    *   [ ] Crear y configurar proyecto en Supabase (Base de Datos PostgreSQL).
    *   [ ] Definir y crear esquema inicial de DB para lecturas de calidad del aire.
    *   [ ] Configurar proyecto en Buildship y conectar a Supabase.
*   [ ] **Desarrollar Recolección de Datos (Workflow Cron):**
    *   [ ] Crear workflow programado en Buildship para ejecución periódica (ej. cada 30-60 mins).
    *   [ ] Implementar llamadas a APIs externas iniciales (ej. OpenAQ, IQAir) dentro del workflow.
    *   [ ] Añadir lógica de procesamiento/transformación de datos en Buildship.
    *   [ ] Implementar escritura de datos unificados en la base de datos Supabase.
*   [ ] **Crear API Propia (Endpoints Buildship):**
    *   [ ] Desarrollar endpoint API inicial (ej. `/api/latest_readings`) en Buildship para consultar datos desde Supabase.
    *   [ ] Desarrollar endpoint API para datos históricos básicos (ej. `/api/historical?station_id=X`).
*   [ ] **Integración Frontend:**
    *   [ ] Modificar la aplicación React para consumir datos desde los nuevos endpoints de Buildship en lugar de las APIs externas directamente.
*   [ ] **Mejorar estrategia de manejo de errores de APIs:** (Implementar dentro de los workflows de Buildship).

### 1.2 Optimización de Rendimiento (Apoyado por Backend)
*   [ ] Implementar lazy loading para componentes pesados (Frontend).
*   [ ] Optimizar renderizado de mapas (Frontend).
*   [ ] **Mejorar manejo de caché de datos:**
    *   [ ] (Backend) Servir datos pre-procesados y cacheados implícitamente desde Supabase.
    *   [ ] (Frontend) Evaluar e implementar caché adicional en el cliente si es necesario.

### 1.3 Expansión de APIs (Vía Backend)
*   [ ] **Integrar datos de SIMA (Sistema Integral de Monitoreo Ambiental):** (Añadir como fuente al workflow de recolección en Buildship cuando esté disponible).

### 1.4 Experiencia de Usuario
*   [ ] Añadir modo para personas daltónicas.
*   [ ] Implementar preferencias de usuario persistentes (Podría requerir Supabase Auth más adelante).
*   [ ] Mejorar accesibilidad general (WCAG 2.1 AA).

## Fase 2: Funcionalidades a mediano plazo (4-6 meses)

### 2.1 Sistema de Alertas
*   *(Dependencia: Backend Buildship/Supabase establecido. Puede requerir Supabase Auth)*
*   [ ] Implementar sistema de notificaciones push (requerirá lógica adicional, quizás Supabase Edge Functions o similar).
*   [ ] Añadir alertas por correo electrónico.
*   [ ] Crear configuración de umbral personalizado para alertas.

### 2.2 Visualización Avanzada
*   *(Dependencia: Datos históricos acumulándose en Supabase DB)*
*   [ ] Implementar mapa de calor para visualizar contaminación por zonas (requerirá procesar datos agregados desde Supabase).
*   [ ] Añadir gráficos comparativos entre ciudades (si se añaden datos de otras ciudades al backend).
*   [ ] Desarrollar vista de pronóstico de calidad del aire (requerirá integración de modelos o fuentes de pronóstico en el backend).

### 2.3 Participación Ciudadana
*   [ ] Implementar sistema de reportes ciudadanos (podría usar Supabase para almacenar reportes).
*   [ ] Añadir sección para compartir en redes sociales.
*   [ ] Crear galería de imágenes de la ciudad con diferentes niveles de contaminación.

## Fase 3: Visión a largo plazo (7-12 meses)

### 3.1 Plataforma Educativa
*   [ ] Desarrollar sección de educación ambiental.
*   [ ] Crear módulo de gamificación para incentivar acciones positivas.
*   [ ] Implementar calculadora de huella de carbono personal.

### 3.2 Análisis Predictivo
*   *(Dependencia: Volumen significativo de datos históricos en Supabase DB)*
*   [ ] Integrar modelos de predicción de calidad del aire (podrían ejecutarse como tareas programadas o funciones serverless consultando Supabase).
*   [ ] Desarrollar alertas preventivas basadas en patrones y meteorología.
*   [ ] Visualizar tendencias y patrones a largo plazo.

### 3.3 Expansión Regional
*   [ ] Expandir la aplicación a otras ciudades de México (requerirá escalar la recolección de datos en el backend).
*   [ ] Implementar comparativas entre regiones.
*   [ ] Crear índice de ciudades por calidad del aire.

## Consideraciones Técnicas

### Infraestructura
*   **Arquitectura Serverless:** Backend (Buildship + Supabase), Frontend (React en Netlify).
*   **Base de Datos:** Supabase (PostgreSQL) para almacenamiento persistente de datos de calidad del aire.
*   Implementación de CDN para recursos estáticos (Netlify lo maneja por defecto).
*   Optimización para dispositivos móviles (PWA).

### Seguridad
*   Implementar autenticación (ej. Supabase Auth) para funcionalidades avanzadas (preferencias, alertas personalizadas, reportes).
*   Añadir cifrado de datos sensibles.
*   Realizar auditorías de seguridad periódicas.
*   Gestionar API Keys externas de forma segura (usando Buildship Secrets).

## Métricas de Éxito
*(Sin cambios)*
- Tiempo de carga < 2 segundos
- Cobertura de testing > 80%
- Disponibilidad > 99.9%
- Crecimiento de usuarios activos > 15% mensual
- Reducción de rebote < 30%

## Despliegue
*   **Frontend:** React App desplegado en Netlify. `netlify.toml` configurado.
*   **Backend:** Workflows y API Endpoints desplegados en Buildship. Base de datos alojada en Supabase. *(Infraestructuras separadas)*