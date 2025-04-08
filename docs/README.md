# MonterreyRespira - Monitor de Calidad del Aire

MonterreyRespira es una aplicación web dedicada a proporcionar información clara, accesible y en tiempo real sobre la calidad del aire en Monterrey y su área metropolitana. Nuestro objetivo es concienciar a la ciudadanía y ofrecer datos útiles para la toma de decisiones diarias.

## 📋 Prerrequisitos

Para desarrollar y ejecutar MonterreyRespira localmente necesitas:

* Node.js (versión 18 o superior)
* npm (versión 9 o superior)
* Git
* Una cuenta en Buildship para el backend
* Una cuenta en Supabase para la base de datos
* Clave API de AirVisual (para desarrollo local)

## 🛠️ Instalación y Uso

1. Clonar el repositorio:
```bash
git clone [https://github.com/elelier/monterrey-respira.git](https://github.com/elelier/monterrey-respira.git)
cd monterrey-respira

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
* crear un archivo .env
```bash
cp .env.example .env
```
* completar los valores en el archivo .env:
```bash
REACT_APP_AIRVISUAL_API_KEY=tu_clave_api
REACT_APP_SUPABASE_URL=tu_url_supabase
REACT_APP_SUPABASE_ANON_KEY=tu_clave_anonima
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

5. Acceder a la aplicación:
* Abre tu navegador y visita `http://localhost:3000`

6. Despliegue:
* Para desplegar la aplicación, puedes usar Netlify
* Configura las variables de entorno en Netlify
* Despliega la aplicación
```bash
npm run build
```


## ✨ Características Clave

*   **Datos en Tiempo Real:** Muestra las últimas lecturas de calidad del aire (AQI US, contaminante principal) y condiciones meteorológicas (temperatura, humedad, viento) para múltiples municipios.
*   **Fuente de Datos Robusta:** Utiliza un pipeline automatizado que recolecta, procesa y almacena datos de fuentes como AirVisual (IQAir), con planes de integrar otras (ej. SIMA).
*   **Visualización Geográfica:** (Planeado) Mapa interactivo mostrando la calidad del aire por zona.
*   **Datos Históricos:** (Planeado) Gráficos y consultas para analizar tendencias pasadas.
*   **Alertas Personalizadas:** (Planeado) Notificaciones push o por correo electrónico basadas en umbrales definidos por el usuario.
*   **Diseño Accesible:** Incluye consideraciones para daltónicos y cumplimiento de estándares WCAG.

## 💻 Pila Tecnológica

*   **Frontend:** [React](https://reactjs.org/) con [TypeScript](https://www.typescriptlang.org/), desplegado en [Netlify](https://www.netlify.com/).
*   **Backend (Serverless):**
    *   Orquestación y API: [Buildship](https://buildship.com/) (Workflows programados y Endpoints API).
    *   Base de Datos: [Supabase](https://supabase.com/) (Base de datos PostgreSQL + API REST).
*   **Fuente de Datos Primaria:** [AirVisual (IQAir) API](https://www.iqair.com/commercial/air-quality-monitors/airvisual-platform/api).

## 🚀 Estado del Proyecto

El proyecto está en desarrollo activo. La Fase 1 (Fundación Backend y Mejoras a corto plazo) está en curso, enfocándose en la implementación del pipeline de datos y la API principal.

Consulte el [Roadmap](./roadmap.md) para ver el plan detallado.

## 📚 Documentación

Esta carpeta contiene la documentación detallada del proyecto:

*   **[Guía de Estilo](./style-guide.md):** Lineamientos de diseño y componentes visuales. *(Nota: Archivo no proporcionado, asumiendo que existe o se creará)*
*   **[Arquitectura](./architecture.md):** Visión general de la estructura del sistema (Frontend y Backend) y patrones de diseño.
*   **[Pipeline de Datos y API Backend](./data-pipeline.md):** Descripción técnica exhaustiva del flujo de recolección de datos (Buildship/Supabase) y la API `GET /latest-air-quality` para el frontend.
*   **[APIs Externas y Adicionales](./api.md):** Documentación de APIs externas utilizadas y/o APIs internas adicionales. *(Nota: Puede solaparse con data-pipeline.md para la API principal)*
*   **[Roadmap](./roadmap.md):** Plan de desarrollo, fases y funcionalidades futuras.
*   **[Contribución](./contributing.md):** Guía para colaborar en el proyecto. *(Nota: Archivo no proporcionado, asumiendo que existe o se creará)*

## 🎯 Propósito de la Documentación

Esta documentación está diseñada para ayudar a desarrolladores, diseñadores y otros colaboradores a entender el proyecto MonterreyRespira, facilitar su mantenimiento y permitir su escalabilidad futura.

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor, revisa la [Guía de Contribución](./contributing.md) para más detalles sobre cómo participar.