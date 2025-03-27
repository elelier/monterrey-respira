# Arquitectura de MonterreyRespira

## Visión General

MonterreyRespira es una aplicación web que muestra datos de calidad del aire en tiempo real para Monterrey y su área metropolitana. La aplicación está construida con React y TypeScript, utilizando un enfoque modular y orientado a componentes.

## Estructura del Proyecto

```
monterrey-respira/
├── docs/              # Documentación del proyecto
├── public/            # Archivos estáticos
├── src/               # Código fuente
│   ├── components/    # Componentes reutilizables
│   ├── context/       # Contextos de React (estado global)
│   ├── pages/         # Páginas de la aplicación
│   ├── services/      # Servicios para comunicación con APIs
│   ├── types/         # Definiciones de tipos TypeScript
│   ├── utils/         # Utilidades y funciones auxiliares
│   ├── App.tsx        # Componente principal
│   └── main.tsx       # Punto de entrada
└── ...                # Archivos de configuración
```

## Patrones y Principios

### Gestión de Estado

- **Context API**: Utilizamos React Context para gestionar el estado global de la aplicación, específicamente para los datos de calidad del aire y la selección de ciudades.
- **useState/useEffect**: Para estados locales de componentes.

### Obtención de Datos

- **Estrategia de Fallback**: La aplicación intenta obtener datos de APIs reales (IQAir, OpenAQ), con un fallback a datos simulados cuando las APIs no están disponibles.
- **Servicios Modulares**: Los servicios están organizados en módulos para facilitar su mantenimiento y pruebas.

### Componentes Visuales

- **Componentes Responsivos**: Los componentes visuales adaptan su apariencia según la calidad del aire actual.
- **Sistema de Temas**: Utilizamos un sistema de temas que cambia colores y estilos según el nivel de contaminación.

## Flujo de Datos

1. El usuario selecciona una ciudad
2. El contexto `AirQualityContext` solicita datos al servicio `apiService`
3. El servicio intenta obtener datos reales, o genera datos simulados si es necesario
4. Los componentes reciben los datos actualizados a través del contexto
5. La interfaz se actualiza con los nuevos datos y adapta su apariencia según la calidad del aire

## Consideraciones de Rendimiento

- Uso de React.memo para componentes que no necesitan renderizarse frecuentemente
- Implementación de lazy loading para la carga de mapas y otros componentes pesados
- Uso de imágenes y recursos optimizados
