# Componentes Principales

Este documento describe los componentes principales de MonterreyRespira y cómo interactúan entre sí.

## Estructura de Componentes

```
MonterreyRespira
├── App.tsx                  # Configuración de rutas y contexto global
├── Layout                   # Estructura común (header, footer, etc.)
├── Pages
│   ├── Dashboard            # Página principal con datos de calidad del aire
│   ├── Asociaciones         # Página de organizaciones ambientales
│   ├── AcercaDe             # Página informativa sobre el proyecto
│   └── DatosYApis           # Página sobre fuentes de datos
└── Componentes funcionales
    ├── AirQualityCard       # Tarjeta principal de calidad del aire
    ├── PollutantsChart      # Gráfico de contaminantes
    ├── HistoricalChart      # Gráfico de datos históricos
    ├── CitySelector         # Selector de ciudades
    ├── StationMap           # Mapa interactivo
    ├── Recommendations      # Recomendaciones basadas en calidad del aire
    └── PollutantsInfo       # Información detallada sobre contaminantes
```

## Componentes Core

### `AirQualityCard`

**Propósito**: Muestra el índice de calidad del aire actual y datos básicos.

**Características**:
- Cambia de color según la calidad del aire (buena, moderada, mala, etc.)
- Muestra el valor AQI con animación
- Incluye datos meteorológicos complementarios (temperatura, humedad, viento)
- Indica si los datos son reales o simulados

**Interacciones**:
- Recibe datos del contexto `AirQualityContext`
- Se actualiza automáticamente cuando cambian los datos

### `CitySelector`

**Propósito**: Permite al usuario cambiar entre diferentes ubicaciones del área metropolitana.

**Características**:
- Menú desplegable con ciudades disponibles
- Muestra la ubicación actual seleccionada
- Diseño adaptativo para móvil y escritorio

**Interacciones**:
- Al seleccionar una ciudad, actualiza el estado en `AirQualityContext`
- Desencadena nueva solicitud de datos para la ubicación seleccionada

### `StationMap`

**Propósito**: Visualiza la ubicación seleccionada y estaciones cercanas en un mapa interactivo.

**Características**:
- Mapa de Leaflet con marcadores personalizados
- Resalta la ubicación actual seleccionada
- Muestra estaciones de monitoreo cercanas
- Fallback a `CityMapPlaceholder` cuando hay problemas de carga

**Interacciones**:
- Se actualiza cuando cambia la ciudad seleccionada
- Maneja errores de carga de manera elegante

### `PollutantsChart`

**Propósito**: Visualiza gráficamente las concentraciones de contaminantes principales.

**Características**:
- Gráfico de barras para comparar niveles de contaminantes
- Código de colores para cada contaminante
- Escala adaptativa según valores máximos

**Interacciones**:
- Recibe datos del contexto `AirQualityContext`
- Se actualiza cuando cambian los datos del aire

### `HistoricalChart`

**Propósito**: Muestra tendencias históricas de calidad del aire.

**Características**:
- Gráfico de líneas con datos de varios días
- Múltiples series para diferentes contaminantes
- Escala temporal personalizable

**Interacciones**:
- Obtiene datos históricos del servicio `apiService`
- Maneja estados de carga y error

### `Recommendations`

**Propósito**: Proporciona recomendaciones basadas en la calidad del aire actual.

**Características**:
- Recomendaciones personalizadas según nivel de contaminación
- Iconos ilustrativos para cada tipo de recomendación
- Animaciones suaves para mejorar la experiencia de usuario

**Interacciones**:
- Recibe el estado de calidad del aire como prop
- Genera diferentes conjuntos de recomendaciones según el estado

### `PollutantsInfo`

**Propósito**: Proporciona información detallada sobre los principales contaminantes del aire.

**Características**:
- Explicaciones detalladas sobre cada contaminante (PM2.5, PM10, O3, etc.)
- Información sobre fuentes, efectos en la salud y umbrales de calidad
- Animaciones para mejorar la experiencia de usuario

**Interacciones**:
- Componente independiente sin dependencias externas
- Utiliza componentes de Motion para animaciones

## Páginas

### `Dashboard`

**Propósito**: Página principal que integra todos los componentes de visualización de datos.

**Características**:
- Layout de dos columnas en escritorio, una columna en móvil
- Distribución organizada de componentes
- CTA para incentivar la participación ciudadana

**Componentes incluidos**:
- `CitySelector`
- `AirQualityCard`
- `PollutantsChart`
- `HistoricalChart`
- `StationMap`
- `Recommendations`
- `PollutantsInfo`

### `Asociaciones`

**Propósito**: Muestra información sobre organizaciones ambientales relacionadas con la calidad del aire.

**Características**:
- Tarjetas interactivas para cada organización
- Diseño responsive con grid adaptativo
- Iconos de redes sociales y contacto

**Interacciones**:
- Enlaces externos a sitios web de organizaciones
- Enlaces a redes sociales y correo electrónico

### `AcercaDe` y `DatosYApis`

**Propósito**: Páginas informativas sobre el proyecto y sus fuentes de datos.

**Características**:
- Diseño limpio enfocado en contenido
- Secciones bien organizadas con jerarquía visual clara
- Elementos interactivos complementarios

## Sistema de Navegación

### `Layout`

**Propósito**: Proporciona estructura común para todas las páginas.

**Características**:
- Header con logo que lleva a la página principal
- Footer con enlaces a páginas informativas
- Aplicación consistente de temas basados en calidad del aire

### `ScrollToTop`

**Propósito**: Mejora la experiencia de usuario al navegar entre páginas.

**Características**:
- Desplaza automáticamente la página al inicio al cambiar de ruta
- Implementado a nivel de Router para afectar a todas las navegaciones
