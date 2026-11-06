# SPEC 01 — Feed como página de inicio

> **Estado:** aprobado
> **Depende de:** Ninguna
> **Fecha:** 2026-11-06
> **Objetivo:** Reproducir en `/` el aspecto de `references/pantallas/feed.dc.html`.

## Alcance

**Incluye:**

- Reemplazar la página inicial de Next.js por el feed de la plantilla.
- Reproducir la barra lateral, el encabezado y las tres publicaciones con sus textos, iconos, colores y espaciados originales.
- Aplicar las tipografías Fredoka y Nunito y conservar el marcador visual de la fotografía.
- Mantener la estructura de la plantilla también en pantallas pequeñas, sin adaptación específica.
- Mostrar los controles como elementos exclusivamente visuales, sin navegación ni acciones.

**Fuera de alcance (para futuras especificaciones):**

- Autenticación, base de datos y persistencia.
- Navegación a las otras pantallas, y funcionalidad de crear, editar, reaccionar o comentar publicaciones.
- Contenido dinámico, incluida una fecha actualizada automáticamente.
- Rediseño adaptable para móvil.

## Modelo de datos

Esta especificación no introduce estructuras de datos persistentes. El contenido del feed es fijo y coincide con la plantilla proporcionada.

## Plan de implementación

1. Ajustar `app/layout.tsx` y `app/globals.css` para el idioma español, los metadatos y los estilos base de la plantilla; verificar que la página siga arrancando.
2. Sustituir el contenido de `app/page.tsx` por el feed estático con la distribución, publicaciones, iconos y textos de la referencia; verificar `/` en escritorio y móvil.
3. Representar los controles de la plantilla sin destinos ni acciones, manteniendo su apariencia; revisar visualmente la página completa.

## Criterios de aceptación

- [x] `/` muestra la barra lateral, encabezado y publicaciones en el mismo orden y con el contenido de la referencia.
- [x] Una captura de `/` a 1200 × 800 coincide visualmente con la referencia en distribución, colores, tipografía y espaciado.
- [x] Al desplazarse por la página se ven las tres publicaciones y el marcador de fotografía.
- [x] En una ventana móvil se conserva la estructura original sin adaptación adicional.
- [x] Los controles visibles no navegan ni ejecutan acciones.
- [x] `npx tsc --noEmit` y `npm run build` finalizan correctamente.

## Decisiones

- **Sí:** usar contenido fijo, incluida la fecha escrita en la plantilla, porque no hay backend ni se solicita contenido dinámico.
- **Sí:** conservar la estructura original en pantallas pequeñas, según la decisión tomada para esta especificación.
- **Sí:** conservar visualmente los controles pero desactivar navegación y acciones, ya que sus destinos no forman parte de este alcance.
- **No:** añadir autenticación, base de datos o persistencia; no son necesarios para reproducir la plantilla.
- **No:** crear las demás pantallas enlazadas desde la plantilla; cada una requeriría su propio alcance.

## Reglas de código
usa un codigo limpio y usar variables y constantes en ingles

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| La comparación visual varía según el navegador, el tamaño de ventana o la disponibilidad de las fuentes. | Comparar referencia y página en el mismo navegador a 1200 × 800 y verificar que Fredoka y Nunito se hayan cargado. |

## Qué **no** incluye esta especificación

- Autenticación, base de datos ni persistencia.
- Navegación o funcionalidades de otras pantallas.
- Contenido dinámico o fecha actualizada automáticamente.
- Un diseño móvil alternativo.
