# Registro de Cambios (Changelog)

Este documento registra los cambios significativos realizados en el proyecto MonterreyRespira.

## Versión 18 (Actual)

### Corrección de duplicación y scroll al inicio
- Eliminada sección duplicada de Guía de Contaminantes
- Añadido componente ScrollToTop para que la página siempre vuelva al inicio al navegar entre rutas
- Simplificado el contenido de la guía de contaminantes para mejor legibilidad
- Optimizado el rendimiento al cargar nuevas páginas

## Versión 17

### Mejoras en la navegación y nuevas páginas
- El logo y nombre ahora son clickeables y llevan a la página principal
- Cambiado el texto del CTA de "Conocer asociaciones" a "Únete al movimiento"
- Creadas páginas de "Acerca de" y "Datos y APIs" para los enlaces del footer
- Convertidas las tarjetas de recursos en enlaces funcionales a recursos externos

## Versión 16

### Optimizaciones para producción y mejoras de diseño
- Mejorado el manejo de errores de APIs para evitar mensajes de error en consola
- Implementado sistema robusto de fallback a datos simulados
- Simplificada la configuración de Netlify para facilitar el despliegue
- Rediseñada la sección de recursos con un aspecto más atractivo e intuitivo
- Añadido estilo mejorado para la sección de Guía de Contaminantes

## Versión 15

### Preparación para despliegue final
- Actualizado netlify.toml para mejorar compatibilidad con el entorno de despliegue
- Añadido soporte para imágenes remotas de same-assets.com
- Simplificada la configuración de entorno para evitar conflictos de versión
- Optimizado proceso de construcción para despliegue en producción

## Versión 14

### Mejora del diseño de las tarjetas de asociaciones
- Rediseñadas las tarjetas de asociaciones con headers adaptados al color de la calidad del aire
- Mejorados los iconos de redes sociales haciéndolos más grandes e interactivos con animaciones
- Implementado sistema de truncamiento de texto para emails y teléfonos evitando que se empalmen
- Optimizado el diseño para diferentes tamaños de pantalla
- Añadidas animaciones de hover para mejorar la interactividad de los elementos

## Versión 13

### Documentación completa del proyecto
- Creada estructura de documentación en la carpeta docs/
- Añadido documento de arquitectura que explica la estructura y patrones del proyecto
- Creada documentación de APIs con detalles sobre las fuentes de datos y estrategias de fallback
- Desarrollado roadmap con plan de implementación a corto, mediano y largo plazo
- Añadida guía de contribución con instrucciones detalladas para colaboradores

## Versión 4

### Implementación de selector de ciudades y mapa
- Creada funcionalidad para seleccionar diferentes municipios del área metropolitana de Monterrey
- Añadido mapa interactivo que muestra la ubicación seleccionada
- Implementados datos específicos por ubicación
- Mejorada la experiencia de usuario con navegación intuitiva
- Corregidos errores de compilación para permitir despliegue
