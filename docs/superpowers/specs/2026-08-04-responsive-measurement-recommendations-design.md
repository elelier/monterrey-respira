# Diseño: metadata de medición y contraste de recomendaciones

Fecha: 2026-08-04  
Alcance: Home pública de MtyRespira, sin cambios de datos ni contrato.

## Objetivo

Mejorar la lectura de la hora de medición en móvil y evitar pérdida de contraste en la sección de Recomendaciones cuando el tema oscuro está activo.

## Diseño aprobado

### Metadata de medición

Se conservarán los dos lugares donde se muestra la medición:

- En `Layout.tsx`, el pill del encabezado seguirá mostrando `Medición` y la hora.
- En `AqiHomeV2Prototype.tsx`, el chip de frescura seguirá mostrando el estado (`Actual`, `+12 h`, `+24 h` o `Sin validar`) y la hora.

En ambos casos, la etiqueta y el valor serán nodos separados. En el breakpoint base/mobile se dispondrán en columna, con alineación y altura suficientes para evitar que el texto se amontone. Desde `sm` volverán a una fila horizontal para conservar la densidad del escritorio. El contenido, formato de hora, accesibilidad y semántica de frescura permanecen sin cambios.

### Recomendaciones

`Recommendations.tsx` mantendrá las clases semánticas por `AirQualityStatus`, pero cada estado recibirá variantes de tema oscuro con:

- texto de acento más luminoso;
- fondos oscuros opacos, no fondos claros translúcidos;
- bordes visibles en oscuro;
- fondos de icono diferenciados, manteniendo el mismo color de severidad.

Los estados `good`, `moderate`, `unhealthy-sensitive`, `unhealthy`, `very-unhealthy`, `hazardous` y `unknown` conservarán su significado cromático y copy. No se modificarán recomendaciones, AQI, fuentes ni datos.

## Componentes afectados

- `src/components/Layout.tsx`: estructura responsive del pill de medición del encabezado.
- `src/components/AqiHomeV2Prototype.tsx`: estructura responsive del chip de frescura y hora.
- `src/components/Recommendations.tsx`: variantes de contraste para los siete estados.

## Pruebas

- Ampliar `AqiHomeV2Prototype.test.tsx` para verificar que el estado de frescura y la hora siguen presentes como elementos separados.
- Añadir prueba de `Recommendations` para verificar los tres elementos visibles, el copy semántico y la presencia de variantes dark de contraste para cada estado.
- Mantener las pruebas existentes de estados AQI, frescura, datos ausentes y degradación.

Las pruebas no dependerán de valores inventados ni de la hora local actual; usarán el timestamp fijo ya existente en los fixtures.

## Validación visual

En el preview actualizado se comprobará:

- Home en 390×844 y 1440×1000.
- Tema claro y oscuro.
- Pill del encabezado y chip de frescura sin solapamiento.
- Recomendaciones legibles en todos los estados semánticos.
- Sin overflow horizontal ni errores de consola.

## No alcance

No se cambiarán RPC, Supabase, pipeline, proveedor ambiental, copy de recomendaciones, reglas AQI, rutas públicas, laboratorio, privacidad ni configuración de Cloudflare.

## Rollback

Revertir el commit de implementación restaura las clases y estructuras visuales actuales sin afectar datos, contratos ni persistencia.
