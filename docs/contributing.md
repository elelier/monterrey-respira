# Guía de Contribución

¡Gracias por tu interés en contribuir a MonterreyRespira! Este documento proporciona las pautas básicas para contribuir al proyecto.

## Configuración del Entorno de Desarrollo

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/monterrey-respira.git
   cd monterrey-respira
   ```

2. **Instalar dependencias**
   ```bash
   bun install
   ```

3. **Iniciar el servidor de desarrollo**
   ```bash
   bun run dev
   ```

## Estructura del Proyecto

Familiarízate con la estructura del proyecto descrita en [architecture.md](./architecture.md).

## Flujo de Trabajo

1. **Crear una nueva rama para tu contribución**
   ```bash
   git checkout -b feature/nombre-de-tu-feature
   ```

2. **Realizar cambios siguiendo las convenciones del proyecto**
   - Revisar la [guía de estilo](./style-guide.md)
   - Seguir los patrones de arquitectura existentes

3. **Ejecutar pruebas locales**
   ```bash
   bun run lint
   ```

4. **Enviar un Pull Request**
   - Proporcionar una descripción clara de los cambios
   - Referenciar cualquier issue relacionado
   - Añadir capturas de pantalla si es relevante

## Convenciones de Código

### Estilo de Código

- Seguir las reglas de ESLint/Prettier configuradas en el proyecto
- Utilizar nombres descriptivos para variables, funciones y componentes
- Documentar funciones y componentes complejos
- Evitar la duplicación de código

### Convenciones de Commits

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(ámbito): descripción corta

Descripción larga (opcional)

BREAKING CHANGE: descripción (opcional)
```

**Tipos de commits**:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de errores
- `docs`: Cambios en documentación
- `style`: Cambios que no afectan el significado del código
- `refactor`: Cambios que no añaden funcionalidad ni corrigen errores
- `perf`: Cambios para mejorar rendimiento
- `test`: Añadir o corregir pruebas
- `chore`: Cambios en el proceso de build o herramientas auxiliares

## Reportar Bugs

Al reportar bugs, incluye:
- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs. comportamiento actual
- Capturas de pantalla cuando sea posible
- Entorno (navegador, sistema operativo, dispositivo)

## Proponer Mejoras

Para proponer mejoras:
- Describe claramente la mejora
- Explica por qué sería beneficiosa
- Proporciona ejemplos o mockups cuando sea posible
- Incluye consideraciones de implementación

## Recursos para Contribuidores

- [Documentación de React](https://reactjs.org/docs/getting-started.html)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [APIs de Calidad del Aire](./api.md)

## Código de Conducta

Nos comprometemos a crear un entorno amigable y respetuoso para todos los contribuidores. Por favor, sé respetuoso y constructivo en todas las interacciones.

---

¡Gracias por contribuir a mejorar la calidad del aire en Monterrey!
