# Roadmap — MtyRespira

Estado: brownfield operativo  
Fecha: 2026-05-30

## Cambio de curso

La prioridad actual de MtyRespira es blindar confianza operativa y convertir la presencia pública en una experiencia clara, accionable y cívicamente útil.

Principios vigentes:

1. Contrato de datos verificable.
2. Frescura honesta.
3. Degradación explícita.
4. Continuidad de pipeline y proveedor.
5. UX mobile-first legible y accesible.
6. Acción ciudadana clara sin inventar afiliaciones ni capturar datos personales.

## Estado documental vigente

Story 1.2.1 — Canonical Project Docs Stop: completada por PR #24.

Story 1.3 — Provider Continuity Readiness: completada en `elelier/airquality_pipeline` por PR #14.

Story 1.3.1 — App Docs Provider State Reconciliation + Roadmap Unlock: completada por PR #25.

Story 1.4 — Public Runtime Verification Gate: completada / degraded resolved por Story 1.4.1 y Story 1.4.2.

Story 1.4.1 — Public Metadata Freshness Claim Cleanup: completada por PR #27.

Story 1.4.2 — Read-only RPC Evidence Capture: completada por PR #30 con evidencia live read-only en `docs/evidence/story-1-4-2-rpc-read-only-evidence.md`.

Resultado Story 1.4.2:

- RPC verificada: `get_latest_air_quality_per_city`.
- Resultado: pass.
- Filas observadas: 9.
- Ciudades observadas: Cadereyta Jimenez, Ciudad Benito Juárez, Garcia, General Escobedo, Guadalupe, Monterrey, San Nicolas de los Garza, San Pedro Garza Garcia, Santa Catarina.
- Sin drift bloqueante de shape/nullability.
- `wind_direction_deg` y `weather_icon` fueron nulos en 9 filas y se mantienen como contexto nullable.
- No hubo cambios runtime, frontend, pipeline, provider, Cloudflare ni contrato de datos.

Story 1.4.11 — Historical Chart Weather Field Source Fix: completada por PR #33 y PR #34.

Resultado Story 1.4.11:

- La gráfica histórica consume campos canónicos `weather_*` / `avg_weather_*`.
- El contrato documentado en `docs/shared-data-contract.md` fue alineado con los RPC históricos reales.
- Se corrigió spacing mobile del eje Y en la gráfica.
- Sin fallback silencioso a campos meteorológicos legacy WAQI.

Mitigación de riesgo histórico:

- `elelier/airquality_pipeline` PR #30 agrega backfill controlado Open-Meteo para completar históricos meteorológicos.
- El backfill es manual, dry-run por defecto y `--apply` explícito.
- No toca AQI, contaminantes, geolocalización, raw payload ni campos legacy.

## Fase 1 — Blindaje crítico

### Story 1.1 — RPC Contract Smoke + Runtime Nullability Verification

Estado: completada si existe PR merged con evidencia de smoke/nullability.

### Story 1.2 — Freshness Truth UX + Stale Data Guard

Estado: completada por PR #23.

### Story 1.2.1 — Canonical Project Docs Stop

Estado: completada por PR #24.

### Story 1.3 — Provider Continuity Readiness

Estado: completada por PR #14 en `elelier/airquality_pipeline`.

### Story 1.3.1 — App Docs Provider State Reconciliation + Roadmap Unlock

Estado: completada por PR #25.

### Story 1.4 — Public Runtime Verification Gate

Estado: completada / degraded resolved.

Resultado:

- Story 1.4.1 mitigó el drift público de metadata/frescura.
- Story 1.4.2 capturó evidencia live read-only de la RPC crítica.
- No queda bloqueo activo para cerrar Fase 1.

### Story 1.4.1 — Public Metadata Freshness Claim Cleanup

Estado: completada por PR #27.

### Story 1.4.2 — Read-only RPC Evidence Capture

Estado: completada por PR #30.

### Story 1.4.11 — Historical Chart Weather Canonical Source

Estado: completada por PR #33 y PR #34 en `elelier/monterrey-respira`.

Objetivo:

Corregir gráficas históricas de temperatura, humedad y viento para usar Open-Meteo canónico, no campos legacy WAQI.

## Fase 2 — Limpieza y gobernanza

Fase 2 puede iniciar después del merge de PR #30 porque el bloqueo de Story 1.4 queda resuelto.

### Story 2.1 — Docs Drift Cleanup

Objetivo: eliminar referencias o afirmaciones obsoletas que contradigan runtime vigente.

### Story 2.2 — Cross-Repo Change Checklist

Objetivo: evitar cambios locales que rompan el producto coordinado.

Todo PR que toque datos debe declarar impacto sobre:

```text
pipeline -> Supabase/RPC -> frontend -> UX
```

## Fase 3 — UX y visualización posterior

Solo después de cerrar Fase 1:

- Mejoras mobile-first.
- Pulido de tarjetas AQI.
- Visualizaciones históricas más claras.
- Mejoras de accesibilidad.
- Comparativas entre ciudades.

## Fase 4 — Web Presence Hardening + Civic Action UX

Estado: lista para iniciar desarrollo.

Objetivo:

Convertir MtyRespira de dashboard funcional a presencia web confiable, legible, accionable y cívicamente útil para usuarios no técnicos en Monterrey.

Fuente de insight:

Roast UX/web presence del sitio público `https://mtyrespira.elelier.com/`, revisando Home, Acerca de, Datos y APIs, Asociaciones, mapa, gráficas, CTAs, footer y experiencia mobile.

Principios de esta fase:

- Mobile-first antes que desktop polish.
- Claridad ciudadana antes que jerga técnica.
- Datos ambientales sin promesas excesivas.
- Acción cívica externa con transparencia.
- Accesibilidad visual como requisito, no decoración.
- No capturar firmas ni datos personales de campañas externas.
- No tocar pipeline ni BD salvo historia explícita.

### Story 4.1 — Hero Message + CTA Wiring Pass

Área: app / UX.

Objetivo:

Hacer que los CTAs principales expliquen claramente qué puede hacer el usuario y naveguen a una acción concreta.

Alcance:

- Reescribir microcopy principal: evitar frases ambiguas como “Calidad del aire disponible”.
- Conectar botones hero a secciones útiles mediante anchors.
- Revisar `¿Cómo puedo ayudar?` en Home y Asociaciones.
- Mantener CTAs externos con `target="_blank"` y `rel="noopener noreferrer"`.
- Evitar afirmar afiliaciones formales con campañas externas.

Criterios de aceptación:

- Todo botón visible ejecuta navegación o acción verificable.
- Ningún CTA queda como botón decorativo.
- En mobile, el CTA primario se ve sin scroll horizontal ni truncamiento.
- El CTA de campaña ciudadana mantiene aviso de referencia externa.

Validación:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Navegación manual Home y `/asociaciones` en mobile.

### Story 4.2 — Accessibility Contrast + Readability Pass

Área: app / UX / accesibilidad.

Objetivo:

Mejorar contraste, legibilidad y jerarquía visual en hero, tarjetas, navegación y fondos con overlays.

Alcance:

- Revisar texto blanco sobre amarillo/foto.
- Agregar overlays o tokens de contraste donde aplique.
- Revisar tamaños de fuente mobile.
- Asegurar focus states visibles.
- Evitar textos claros sobre fondos saturados.

Criterios de aceptación:

- Hero principal y hero de Asociaciones tienen contraste legible en mobile.
- Links y botones tienen estados focus/hover visibles.
- No se reduce información ambiental crítica.
- No cambia contrato de datos.

Validación:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Revisión visual mobile 390px y desktop.

### Story 4.3 — Historical Charts Mobile Legibility Pass

Área: app / UX / visualización.

Objetivo:

Hacer que las gráficas históricas sean legibles en mobile, con ejes visibles, unidades claras y tooltips útiles.

Alcance:

- Revisión de márgenes de `LineChart` y `YAxis`.
- Tooltips con valor exacto, fecha y unidad.
- Leyenda clara por métrica.
- Evitar que eje Y o labels X se corten.
- Mantener `connectNulls={false}` para no inventar datos.

Criterios de aceptación:

- Eje Y visible en 24h, 7d, 30d y 6m.
- Unidades claras para AQI, °C, %, km/h.
- Gaps reales permanecen visibles.
- No fallback a legacy weather fields.

Validación:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Revisión de Monterrey en mobile.

### Story 4.4 — Recommendations Interaction Clarity

Área: app / UX.

Objetivo:

Hacer obvio que las recomendaciones son accionables, expandibles o navegables.

Alcance:

- Revisar flechas pequeñas en recomendaciones.
- Agregar labels tipo “Ver recomendación”.
- Mejorar estado abierto/cerrado si aplica.
- Mantener recomendaciones condicionadas por AQI actual.

Criterios de aceptación:

- Usuario entiende qué pasa al tocar cada recomendación.
- No se rompe layout mobile.
- No se inventan recomendaciones fuera del estado AQI.

### Story 4.5 — Metropolitan Map UX Layer

Área: app / UX / mapa.

Objetivo:

Hacer el mapa más comprensible para usuarios no técnicos.

Alcance:

- Agregar leyenda de colores AQI cerca del mapa.
- Revisar zoom inicial y superposición de etiquetas.
- Agregar explicación breve de marcadores.
- Considerar filtro por municipio o contaminante dominante si el contrato lo permite.

Criterios de aceptación:

- El usuario entiende qué significa cada color de marcador.
- El mapa no requiere leer documentación externa para interpretarse.
- No se cambia geolocalización ni coordenadas.

### Story 4.6 — Associations Media Ownership + Layout Consistency

Área: app / UX / contenido.

Objetivo:

Eliminar dependencia frágil de imágenes externas para logos de asociaciones y estabilizar el layout.

Alcance:

- Mantener fallback por iniciales.
- Evaluar subir logos permitidos a assets propios del repo.
- Homologar tamaño y alineación de tarjetas.
- Evitar imágenes rotas por hotlink/CORS.

Criterios de aceptación:

- Ninguna tarjeta muestra icono roto.
- Las tarjetas se ven consistentes con o sin logo.
- Se documenta si un logo no puede alojarse por derechos/permiso.

### Story 4.7 — Civic Action CTA Integration

Área: app / UX / contenido cívico.

Objetivo:

Integrar llamadas a acción ciudadana actuales sin convertir MtyRespira en capturador de datos ni prometer afiliación formal.

Alcance:

- Mantener bloque “Desahógate” como referencia externa.
- Revisar copy de transparencia.
- Evaluar ubicación del bloque en Home o Asociaciones.
- Medir clics solo si existe analítica privacy-safe en el proyecto.

Criterios de aceptación:

- CTA externo claro y visible.
- Copy explica que MtyRespira no procesa firmas ni datos personales.
- No se mezcla con lecturas ambientales ni contrato de datos.

### Story 4.8 — Datos y APIs Trust Cleanup

Área: app / UX / documentación pública.

Objetivo:

Actualizar `/datos-y-apis` para reflejar el estado real: WAQI/AQICN activo, Open-Meteo para clima, Supabase/RPC, no datos simulados en producción.

Alcance:

- Remover o aclarar menciones de “datos simulados” si ya no aplican.
- Separar fuentes AQI vs clima.
- Explicar `reading_timestamp`, `weather_timestamp`, `last_successful_update_at` en lenguaje ciudadano.
- Revisar enlaces a repositorios.

Criterios de aceptación:

- Página no contradice `docs/shared-data-contract.md`.
- No promete tiempo real.
- Fuente activa y fallback quedan claros.

### Story 4.9 — SEO + Route Metadata Pass

Área: app / Cloudflare / SEO.

Objetivo:

Mejorar presencia web orgánica con metadata específica por ruta.

Alcance:

- Title y meta description por Home, Acerca, Datos y APIs, Asociaciones.
- Open Graph / Twitter cards básicas si el stack actual lo permite.
- Canonical URL por ruta.
- Revisar favicon/logo.

Criterios de aceptación:

- Cada ruta pública tiene título y descripción específica.
- No hay metadata que prometa tiempo real si no corresponde.
- Build pasa sin warnings nuevos.

### Story 4.10 — Footer/Nav Information Architecture Cleanup

Área: app / UX.

Objetivo:

Reducir redundancia entre nav superior, nav inferior y footer, especialmente en mobile.

Alcance:

- Revisar navegación mobile y desktop.
- Evaluar si bottom nav necesita todas las rutas.
- Hacer año del footer dinámico.
- Mantener enlaces críticos: Acerca, Datos y APIs, Asociaciones, Política de Privacidad.

Criterios de aceptación:

- Navegación no se siente duplicada ni pesada.
- Footer no tiene año hardcodeado.
- Rutas existentes siguen accesibles.

### Story 4.11 — Public Web Presence QA Matrix

Área: QA / app.

Objetivo:

Crear una matriz de QA visual y funcional para evitar regresiones públicas.

Alcance:

- Checklist mobile 390px, desktop 1024px+.
- Rutas: `/`, `/acerca-de`, `/datos-y-apis`, `/asociaciones`.
- Estados: loading, datos disponibles, datos degradados si puede simularse.
- Verificación de imágenes, CTAs, links externos y contraste.

Criterios de aceptación:

- Checklist vive en `docs/`.
- Cada PR de Fase 4 puede referenciarlo.
- No requiere secretos ni writes a Supabase.

## Orden recomendado de ejecución

1. Story 4.1 — Hero Message + CTA Wiring Pass.
2. Story 4.2 — Accessibility Contrast + Readability Pass.
3. Story 4.3 — Historical Charts Mobile Legibility Pass.
4. Story 4.8 — Datos y APIs Trust Cleanup.
5. Story 4.5 — Metropolitan Map UX Layer.
6. Story 4.4 — Recommendations Interaction Clarity.
7. Story 4.6 — Associations Media Ownership + Layout Consistency.
8. Story 4.7 — Civic Action CTA Integration.
9. Story 4.9 — SEO + Route Metadata Pass.
10. Story 4.10 — Footer/Nav Information Architecture Cleanup.
11. Story 4.11 — Public Web Presence QA Matrix.

## Siguiente historia lista para desarrollo

### Story 4.1 — Hero Message + CTA Wiring Pass

Repo principal: `elelier/monterrey-respira`.

Branch sugerida:

```text
ux/story-4-1-hero-message-cta-wiring
```

Prompt de arranque sugerido:

```text
Copilot | Agent: UX-UI / Dev / QA | Model: GPT-5 Codex

Trabaja en MtyRespira, repo `elelier/monterrey-respira`.

Primero valida:
1. Ejecuta `get_repo elelier/monterrey-respira`.
2. Si NO devuelve exactamente `elelier/monterrey-respira`, STOP.

Historia:
Story 4.1 — Hero Message + CTA Wiring Pass

Objetivo:
Hacer que los CTAs principales expliquen claramente qué puede hacer el usuario y naveguen a una acción concreta, empezando por Home y `/asociaciones`.

Tareas:
1. Revisar Home, `/asociaciones`, header/nav y footer.
2. Detectar botones decorativos o CTAs sin acción.
3. Reescribir microcopy ambiguo como “Calidad del aire disponible” hacia mensaje ciudadano claro.
4. Conectar CTAs a anchors internos o rutas reales.
5. Mantener links externos con `target="_blank"` y `rel="noopener noreferrer"`.
6. Preservar transparencia de campañas externas: MtyRespira no procesa firmas ni datos personales.
7. Validar mobile y desktop.

Guardrails:
- NO Supabase writes.
- NO DDL.
- NO pipeline changes.
- NO AQI/provider changes.
- NO geolocalización.
- NO secretos.
- No inventar afiliaciones con asociaciones o campañas.

Validación:
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Revisión manual de Home y `/asociaciones` en mobile.

Commit:
`ux: clarify hero messaging and cta wiring`

Abre PR pequeño contra `main`.
```

## Fuera de alcance hasta nuevo aviso

- Auth de usuarios.
- Alertas personalizadas.
- Nuevas fuentes productivas sin contrato verificado.
- Pronóstico ambiental.
- Expansión nacional.
- Gamificación.
- Nuevas lecturas ambientales fuera del contrato actual.
- Captura propia de firmas o datos personales de campañas ciudadanas.

## Documentos canónicos relacionados

- `AGENTS.md`
- `docs/DOCUMENTATION_INDEX.md`
- `docs/PRD.md`
- `docs/architecture.md`
- `docs/shared-data-contract.md`
- `docs/freshness-truth-ux.md`
- `docs/blindaje-y-cambio-de-curso.md`
- `docs/public-runtime-verification-gate.md`
- `docs/evidence/story-1-4-2-rpc-read-only-evidence.md`
- `elelier/airquality_pipeline/docs/provider-continuity-readiness.md`
- `elelier/airquality_pipeline/docs/provider-continuity-runbook.md`
