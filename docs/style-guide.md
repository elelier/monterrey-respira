# Guía de Estilos - MonterreyRespira

Esta guía de estilos define los elementos visuales, tipográficos y de interacción para mantener una experiencia de usuario coherente en toda la aplicación MonterreyRespira.

## Índice

1. [Paleta de Colores](#paleta-de-colores)
2. [Tipografía](#tipografía)
3. [Componentes UI](#componentes-ui)
4. [Iconografía](#iconografía)
5. [Estilos Responsivos](#estilos-responsivos)
6. [Temas Dinámicos](#temas-dinámicos)

## Paleta de Colores

### Colores base

- **Blanco:** `#FFFFFF` - Fondo principal
- **Negro:** `#000000` - Texto principal

### Escalas de grises

- **Gris 50:** `#F8FAFC` - Fondos secundarios
- **Gris 100:** `#F1F5F9` - Fondos de componentes
- **Gris 200:** `#E2E8F0` - Bordes suaves
- **Gris 300:** `#CBD5E1` - Bordes, separadores
- **Gris 400:** `#94A3B8` - Texto deshabilitado
- **Gris 500:** `#64748B` - Texto secundario
- **Gris 600:** `#475569` - Texto de énfasis
- **Gris 700:** `#334155` - Texto principal
- **Gris 800:** `#1E293B` - Fondos oscuros
- **Gris 900:** `#0F172A` - Fondos muy oscuros

### Colores para estados de calidad del aire

#### Bueno (Good)
- **Primary:** `#4ADE80` (Verde)
- **Gradient:** `from-green-400 to-emerald-500`
- **Background:** `#ECFDF5`
- **Text:** `#065F46`

#### Moderado (Moderate)
- **Primary:** `#FBBF24` (Ámbar)
- **Gradient:** `from-amber-400 to-yellow-500`
- **Background:** `#FFFBEB`
- **Text:** `#92400E`

#### Insalubre para grupos sensibles (Unhealthy for Sensitive Groups)
- **Primary:** `#FB923C` (Naranja)
- **Gradient:** `from-orange-400 to-orange-500`
- **Background:** `#FFF7ED`
- **Text:** `#9A3412`

#### Insalubre (Unhealthy)
- **Primary:** `#F87171` (Rojo)
- **Gradient:** `from-red-400 to-red-500`
- **Background:** `#FEF2F2`
- **Text:** `#B91C1C`

#### Muy insalubre (Very Unhealthy)
- **Primary:** `#C084FC` (Púrpura)
- **Gradient:** `from-purple-400 to-purple-500`
- **Background:** `#FAF5FF`
- **Text:** `#7E22CE`

#### Peligroso (Hazardous)
- **Primary:** `#9F1239` (Rosa intenso)
- **Gradient:** `from-rose-700 to-rose-800`
- **Background:** `#FFF1F2`
- **Text:** `#9F1239`

### Colores de Acento

- **Azul primario:** `#3B82F6` - Acciones, enlaces
- **Verde éxito:** `#10B981` - Confirmaciones, éxito
- **Rojo error:** `#EF4444` - Errores, alertas críticas
- **Amarillo advertencia:** `#F59E0B` - Advertencias, alertas

## Tipografía

MonterreyRespira utiliza la familia de fuentes del sistema para una experiencia nativa y rendimiento óptimo.

### Jerarquía

- **Títulos principales (H1):**
  - Tamaño: `2rem` (32px)
  - Peso: Bold (700)
  - Color: `#1E293B` (Dark: `#F8FAFC`)

- **Títulos secundarios (H2):**
  - Tamaño: `1.5rem` (24px)
  - Peso: Bold (700)
  - Color: `#334155` (Dark: `#E2E8F0`)

- **Títulos terciarios (H3):**
  - Tamaño: `1.25rem` (20px)
  - Peso: Semibold (600)
  - Color: `#475569` (Dark: `#CBD5E1`)

- **Subtítulos (H4):**
  - Tamaño: `1.125rem` (18px)
  - Peso: Semibold (600)
  - Color: `#64748B` (Dark: `#94A3B8`)

- **Cuerpo de texto:**
  - Tamaño: `1rem` (16px)
  - Peso: Regular (400)
  - Color: `#334155` (Dark: `#E2E8F0`)

- **Texto pequeño:**
  - Tamaño: `0.875rem` (14px)
  - Peso: Regular (400)
  - Color: `#475569` (Dark: `#CBD5E1`)

- **Texto muy pequeño:**
  - Tamaño: `0.75rem` (12px)
  - Peso: Regular (400)
  - Color: `#64748B` (Dark: `#94A3B8`)

## Componentes UI

### Botones

#### Botón Primario
```html
<button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
  Botón Primario
</button>
```

#### Botón Secundario
```html
<button class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors">
  Botón Secundario
</button>
```

#### Botón Dinámico (según calidad del aire)
```html
<button class={`px-4 py-2 ${getStatusButtonClass()} rounded-md transition-colors`}>
  Botón Dinámico
</button>
```

### Tarjetas

#### Tarjeta Básica
```html
<div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
  Contenido de la tarjeta
</div>
```

#### Tarjeta Dinámica (según calidad del aire)
```html
<div class={`bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border-2 ${getStatusBorderClass()}`}>
  Contenido de la tarjeta
</div>
```

### Inputs

#### Input de Texto
```html
<input
  type="text"
  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-white"
  placeholder="Placeholder"
/>
```

#### Selector
```html
<select class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-white">
  <option>Opción 1</option>
  <option>Opción 2</option>
</select>
```

## Iconografía

MonterreyRespira utiliza los iconos de [Ionicons](https://ionicons.com/) a través de react-icons/io5.

### Tamaños de iconos

- **Extra pequeño:** `w-4 h-4`
- **Pequeño:** `w-5 h-5`
- **Mediano:** `w-6 h-6`
- **Grande:** `w-8 h-8`
- **Extra grande:** `w-10 h-10`

### Ejemplos de uso

```jsx
import { IoLeafOutline, IoAlertCircleOutline, IoThermometerOutline } from 'react-icons/io5';

// Icono pequeño
<IoLeafOutline className="w-5 h-5 text-green-500" />

// Icono mediano con color dinámico
<IoAlertCircleOutline className={`w-6 h-6 ${getIconColorClass()}`} />
```

## Estilos Responsivos

MonterreyRespira utiliza Tailwind CSS para manejar los estilos responsivos. Estas son las principales clases de breakpoints:

- **sm:** `640px` - Dispositivos móviles en horizontal
- **md:** `768px` - Tablets
- **lg:** `1024px` - Desktops pequeños
- **xl:** `1280px` - Desktops
- **2xl:** `1536px` - Pantallas grandes

### Ejemplos de uso

```html
<!-- Disposición en columna en móviles, fila en tablets y mayores -->
<div class="flex flex-col md:flex-row">
  <!-- Contenido -->
</div>

<!-- Oculto en móviles, visible en desktop -->
<div class="hidden lg:block">
  <!-- Contenido -->
</div>

<!-- Grid de 1 columna en móviles, 2 en tablets, 3 en desktops -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Contenido -->
</div>
```

## Temas Dinámicos

MonterreyRespira incluye un sistema de temas dinámicos que se ajusta según la calidad del aire. Estos temas afectan a diversos componentes de la aplicación.

### Funciones de utilidad

```jsx
// Obtener color de botón según la calidad del aire
const getStatusButtonClass = () => {
  if (!theme) return 'bg-blue-500 hover:bg-blue-600 text-white';

  switch (theme.primary) {
    case '#4ade80': return 'bg-green-500 hover:bg-green-600 text-white';
    case '#fbbf24': return 'bg-amber-500 hover:bg-amber-600 text-white';
    case '#fb923c': return 'bg-orange-500 hover:bg-orange-600 text-white';
    case '#f87171': return 'bg-red-500 hover:bg-red-600 text-white';
    case '#c084fc': return 'bg-purple-500 hover:bg-purple-600 text-white';
    case '#9f1239': return 'bg-rose-600 hover:bg-rose-700 text-white';
    default: return 'bg-blue-500 hover:bg-blue-600 text-white';
  }
};

// Obtener color de borde según la calidad del aire
const getStatusBorderClass = () => {
  if (!theme) return 'border-blue-500';

  switch (theme.primary) {
    case '#4ade80': return 'border-green-500';
    case '#fbbf24': return 'border-amber-500';
    case '#fb923c': return 'border-orange-500';
    case '#f87171': return 'border-red-500';
    case '#c084fc': return 'border-purple-500';
    case '#9f1239': return 'border-rose-600';
    default: return 'border-blue-500';
  }
};
```

### Modo Oscuro

MonterreyRespira soporta modo oscuro utilizando las clases de Tailwind CSS. El modo oscuro se activa automáticamente según las preferencias del sistema.

```html
<!-- Ejemplo de componente con soporte para modo oscuro -->
<div class="bg-white text-gray-800 dark:bg-slate-800 dark:text-gray-200">
  Contenido con soporte para modo oscuro
</div>
```
