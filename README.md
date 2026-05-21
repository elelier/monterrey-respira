# MonterreyRespira

![MonterreyRespira Logo](public/mty.png)

MonterreyRespira es una aplicación web pública que presenta lecturas disponibles de calidad del aire para Monterrey y su área metropolitana.

El producto ayuda a las personas a consultar AQI, contaminante principal cuando está disponible, contexto ambiental y la frescura de la medición reportada. No promete monitoreo en tiempo real: la app distingue entre hora de medición, actualización del pipeline y estados degradados o sin lectura.

## ✨ Características

- 📊 Visualización de lecturas disponibles de calidad del aire
- 🗺️ Mapa interactivo y selección de ciudad
- 📈 Gráficos históricos de contaminantes cuando hay datos disponibles
- 🔍 Información sobre contaminantes y efectos en la salud
- 📱 Diseño responsive optimizado para dispositivos móviles
- 🕒 Freshness Truth UX: medición reciente, con retraso, vieja o sin lectura disponible

## 🛠️ Tecnologías

- **Frontend:** React, TypeScript, Vite
- **Estilos:** TailwindCSS
- **Visualización:** Chart.js, Leaflet
- **Animaciones:** Framer Motion
- **Iconos:** React Icons
- **Datos:** Supabase RPC `get_latest_air_quality_per_city`
- **Pipeline ambiental:** repositorio `elelier/airquality_pipeline`
- **Hosting app:** Cloudflare Pages

## 🧭 Arquitectura resumida

```text
provider -> airquality_pipeline -> Supabase tables -> get_latest_air_quality_per_city -> frontend
```

Conceptos críticos:

- `reading_timestamp` = tiempo de medición ambiental.
- `last_successful_update_at` = trazabilidad de éxito del pipeline.
- `get_latest_air_quality_per_city` = RPC crítica consumida por el frontend.
- `cities` y `air_quality_readings` = tablas ambientales principales.

Core DB no se usa para lecturas ambientales.

## 🚀 Comenzando

### Prerequisitos

- Node.js 18.x o superior
- Bun recomendado o npm

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/elelier/monterrey-respira.git
   cd monterrey-respira
   ```

2. Instala las dependencias:
   ```bash
   bun install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   bun dev
   ```

4. Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## 📚 Documentación canónica

La documentación principal vive en la carpeta [docs](./docs):

- [Reglas para agentes](./AGENTS.md)
- [Índice documental](./docs/DOCUMENTATION_INDEX.md)
- [PRD](./docs/PRD.md)
- [Arquitectura](./docs/architecture.md)
- [Roadmap](./docs/roadmap.md)
- [Contrato compartido de datos](./docs/shared-data-contract.md)
- [Freshness Truth UX](./docs/freshness-truth-ux.md)
- [Mapa de blindaje y cambio de curso](./docs/blindaje-y-cambio-de-curso.md)
- [Guía de Estilo](./docs/style-guide.md)
- [API](./docs/api.md)
- [Contribución](./docs/contributing.md)

## 🤝 Contribuir

Las contribuciones son bienvenidas dentro del alcance de MtyRespira. Antes de abrir cambios, lee [AGENTS.md](./AGENTS.md) y la [guía de contribución](./docs/contributing.md).

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en este repositorio.

## 🙏 Agradecimientos

- A las organizaciones y comunidades que publican información ambiental.
- A la comunidad de desarrolladores de Monterrey.
