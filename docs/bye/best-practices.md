# Mejores Prácticas Implementadas

Estado: legacy / no fuente de verdad operativa

Este documento conserva notas de una implementación anterior. Si contradice `docs/shared-data-contract.md`, `docs/architecture.md` o `docs/data-pipeline.md`, pierde prioridad.

Este documento describe las mejores prácticas y patrones de diseño implementados en MonterreyRespira.

## Arquitectura y Estructura

### Patrón de Contexto para Estado Global

- Utilizamos React Context API para manejar el estado global de la aplicación
- Separamos la lógica de negocio del componente UI
- Implementamos hooks personalizados (`useAirQuality`) para acceder al contexto

### Estructura Modular

- Organización del código en módulos y componentes reutilizables
- Separación clara entre:
  - Componentes de UI (`components/`)
  - Lógica de negocio (`services/`)
  - Tipos de datos (`types/`)
  - Páginas completas (`pages/`)

### Principio de Responsabilidad Única

- Cada componente tiene una responsabilidad específica y bien definida
- Los componentes complejos se descomponen en componentes más pequeños y manejables

## Manejo de Datos

### Estrategia de fallback retirada

- El sistema anterior intentaba API principal IQAir, complemento OpenAQ y datos simulados.
- Ese flujo está retirado y no representa el contrato vigente.
- El runtime actual obtiene AQI desde WAQI/AQICN, contexto meteorológico desde Open-Meteo y expone datos normalizados al frontend mediante Supabase RPC.
- Si faltan datos críticos, la UI debe degradar a estado desconocido o sin lectura; no debe inventar mediciones.

### Datos simulados determinísticos retirados

- Una versión anterior generaba datos simulados de manera determinística basados en:
  - Ubicación seleccionada
  - Momento del día
  - Valores históricos realistas
- El producto vigente no debe presentar datos simulados como lecturas ambientales.

### Indicadores de origen de datos

- La implementación retirada distinguía visualmente entre datos reales y simulados.
- El producto vigente no presenta datos simulados como lecturas ambientales.

## Experiencia de Usuario

### Diseño Adaptativo a la Calidad del Aire

- Los componentes cambian de color según el nivel de contaminación
- Sistema de temas que afecta a toda la aplicación basándose en la calidad del aire
- Consistencia visual a través de toda la interfaz

### Navegación Mejorada

- Implementación de React Router para navegación entre páginas
- Componente ScrollToTop para mejor experiencia al cambiar de página
- Enlaces claros y consistentes en toda la aplicación

### Accesibilidad

- Textos alternativos para imágenes
- Contraste adecuado para legibilidad
- Estructura semántica HTML
- Indicadores visuales claros para estados interactivos

## Rendimiento

### Optimización de Componentes

- Uso de `motion` de Framer Motion para animaciones eficientes
- Transiciones suaves con rendimiento optimizado
- Carga condicional de componentes pesados

### Manejo de Errores

- Sistema de supresión de errores para evitar mensajes en consola
- Degradación elegante cuando hay problemas con APIs externas
- Retroalimentación clara al usuario

## Despliegue

### Configuración retirada

- La configuración de Netlify pertenece al flujo retirado.
- El despliegue público vigente es Cloudflare Pages.
- El proceso de construcción vigente es `npm run build`.

### Manejo de Recursos Externos

- Configuración para permitir imágenes de dominios externos
- Optimización de recursos en tiempo de compilación
- Comportamiento consistente en desarrollo y producción
