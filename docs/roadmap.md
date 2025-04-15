Aquí tienes el contenido listo para reemplazar tu archivo docs/roadmap.md, reflejando fielmente el estado actual del proyecto tras 3 semanas, el avance real y los siguientes pasos recomendados. El formato es claro y profesional, siguiendo el estilo de tu documentación.

Roadmap de MonterreyRespira (Actualizado - Semana 3)
Este roadmap refleja el estado actual del proyecto tras 3 semanas de desarrollo, con una separación clara entre lo ya integrado y las siguientes prioridades sugeridas.

1. Avance Actual (Semana 3)
Backend & Pipeline de Datos
[x] Configuración y despliegue de Supabase como base de datos principal (PostgreSQL).
[x] Esquema de tablas cities y air_quality_readings creado y documentado.
[x] Seguridad: RLS habilitado, uso de service_role para el pipeline.
[x] Pipeline automatizado en Buildship para:
[x] Sincronización de ciudades monitoreadas con la API de AirVisual.
[x] Obtención y almacenamiento programado (CRON) de datos de calidad del aire cada hora.
[x] Manejo de errores y reintentos automáticos.
[x] Función RPC get_latest_air_quality_per_city implementada y consumida desde el frontend.
Frontend
[x] Estructura modular en React + TypeScript, con rutas principales y layout adaptativo.
[x] Integración con Supabase vía API propia (no consumo directo de APIs externas en frontend).
[x] Contexto global para calidad del aire: manejo de estado, caché local y refresco.
[x] Componentes clave implementados:
[x] Tarjetas y visualizaciones de calidad del aire.
[x] Mapa interactivo y mapas de calor (heatmap).
[x] Gráficos históricos y comparativos.
[x] Sistema de alertas visuales.
[x] Accesibilidad básica y soporte para temas dinámicos.
[x] Guía de estilos y arquitectura documentadas y alineadas con el código.
[x] Tipografía y paleta de colores arquitectónica (Montserrat, Work Sans, colores por estado AQI).
DevOps y Calidad
[x] Despliegue automático en Netlify.
[x] Linting (ESLint), formateo (Prettier) y control de calidad automatizado.
[x] Documentación técnica y de diseño actualizada.
2. Siguientes pasos recomendados (Prioridades)
Backend & Pipeline
[ ] Optimizar la función RPC para mayor eficiencia si crece el volumen de datos.
[ ] Implementar endpoint para datos históricos reales.
[ ] Integrar nuevas fuentes de datos (ej. SIMA) cuando estén disponibles.
[ ] Mejorar logs y telemetría del pipeline (Buildship).
Frontend
[ ] Implementar lazy loading para componentes pesados (mapas, gráficos).
[ ] Mejorar la experiencia móvil (optimización de UI/UX en dispositivos pequeños).
[ ] Añadir modo para personas daltónicas y accesibilidad avanzada (WCAG 2.1 AA).
[ ] Permitir preferencias de usuario persistentes (requiere Supabase Auth).
[ ] Mejorar sistema de alertas (push/email) y configuración de umbrales personalizados.
[ ] Añadir sección de participación ciudadana (reportes, galería, compartir en redes).
[ ] Desarrollar vista de pronóstico de calidad del aire (integrar modelos o APIs de forecast).
Visualización y Analítica
[ ] Implementar comparativas entre ciudades.
[ ] Añadir vistas de tendencias y patrones a largo plazo.
[ ] Preparar la base para análisis predictivo y visualización avanzada.
Escalabilidad y Expansión
[ ] Planificar la expansión a otras ciudades de México.
[ ] Preparar la infraestructura para soportar mayor volumen y diversidad de datos.
3. Visión a mediano y largo plazo
Plataforma educativa ambiental y gamificación.
Calculadora de huella de carbono personal.
Modelos de predicción y alertas preventivas.
Expansión nacional y comparativas regionales.
