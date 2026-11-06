# SPEC 02 — Kids

> **Estado:** Aprovado
> **Depende de:** SPEC 01
> **Fecha:** 2026-11-06
> **Objetivo:** Añadir las pantallas estáticas de Kids y perfil, reproduciendo sus referencias y conectando su navegación con el Feed.

## Alcance

**Incluye:**

- Crear `/kids` con el listado estático de ocho perfiles de `references/pantallas/ninos.dc.html`.
- Crear `/kids/[id]` con el perfil estático de Mateo de `references/pantallas/perfil-nino.dc.html`.
- Reproducir la distribución, colores, tipografías, textos, iconos y espaciados de ambas referencias.
- Usar “Kids” en las etiquetas de navegación, el título de la sección y el enlace para volver al listado.
- Conectar Feed con `/`, Kids con `/kids`, y todas las tarjetas del listado con `/kids/mateo-fernandez`.
- Mantener la búsqueda y las acciones sin destino como controles visuales sin comportamiento.
- Mantener la estructura de escritorio de las referencias en pantallas pequeñas, sin rediseño adaptable.

**Fuera de alcance (para futuras especificaciones):**

- Autenticación, base de datos, persistencia y contenido dinámico.
- Perfiles individuales distintos del perfil estático de Mateo.
- Buscar o filtrar perfiles, agregar, editar, eliminar o vincular perfiles y padres.
- Funcionalidad de resumen del día, avisos, cuenta, crear publicación o cerrar sesión.
- Rediseño adaptable para móvil.

## Modelo de datos

Esta especificación no introduce estructuras persistentes. El listado usa los ocho perfiles fijos de la referencia. El único perfil definido tiene el identificador `mateo-fernandez` y contiene los datos fijos de la referencia. Todas las tarjetas enlazan a ese perfil. Los identificadores no definidos muestran una página 404.

## Plan de implementación

1. Crear `app/kids/[id]/page.tsx` y `app/kids/kids.module.css` para representar el perfil de Mateo, su barra lateral y el estado 404 para identificadores desconocidos; verificar que `/kids/mateo-fernandez` carga directamente.
2. Crear `app/kids/page.tsx` usando los estilos de `app/kids/kids.module.css`, con las ocho tarjetas enlazadas al perfil de Mateo y los controles restantes sin acciones; verificar `/kids` y la navegación de ida y vuelta entre lista y perfil.
3. Actualizar `app/page.tsx` para que el menú del Feed enlace a `/kids`, y hacer que la navegación Feed de las pantallas Kids y perfil vuelva a `/`; verificar el recorrido `/` → `/kids` → `/kids/mateo-fernandez` → `/kids` → `/`.

## Criterios de aceptación

- [x] `/kids` muestra los ocho perfiles en el mismo orden y con el contenido de la plantilla.
- [x] `/kids/mateo-fernandez` muestra los datos del perfil de Mateo de la plantilla.
- [x] Una captura a 1200 × 800 coincide con las referencias en distribución, colores, tipografía y espaciado.
- [x] La navegación usa la etiqueta “Kids” y funciona entre Feed, lista y perfil según las rutas definidas.
- [x] Las ocho tarjetas abren `/kids/mateo-fernandez` y el enlace “Volver a Kids” abre `/kids`.
- [x] Una ruta `/kids/[id]` con un identificador no definido presenta una página 404.
- [x] La búsqueda y los controles fuera del alcance conservan su apariencia, pero no navegan ni ejecutan acciones.
- [x] En una ventana móvil se conserva la estructura de la referencia sin adaptación adicional.
- [x] `npx tsc --noEmit` y `npm run build` finalizan correctamente.

## Decisiones

- **Sí:** usar contenido fijo de las referencias, porque no se solicita backend ni contenido dinámico.
- **Sí:** usar `/kids` y `/kids/[id]`, con `mateo-fernandez` como único identificador definido.
- **Sí:** todas las tarjetas abren el perfil de Mateo, igual que los enlaces de la plantilla.
- **Sí:** usar “Kids” en las etiquetas de navegación, el título y el enlace de retorno; el texto descriptivo de las referencias se conserva.
- **Sí:** presentar 404 para identificadores desconocidos, sin mostrar datos de otro perfil.
- **Sí:** mantener los controles sin destinos como elementos visuales, y no añadir un comportamiento que requiere otras pantallas.
- **Sí:** conservar la estructura móvil original, en coherencia con SPEC 01.
- **No:** añadir autenticación, base de datos, persistencia ni interacciones de gestión; no son necesarias para reproducir las pantallas y conectar las rutas solicitadas.

## Reglas de código

- Mantener el código limpio y usar nombres en inglés para variables y constantes.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| La comparación visual varía según el navegador o la disponibilidad de las fuentes. | Comparar las referencias y las rutas en el mismo navegador a 1200 × 800 y verificar la carga de Fredoka y Nunito. |

## Qué **no** incluye esta especificación

- Autenticación, base de datos, persistencia ni datos dinámicos.
- Perfiles individuales para los otros siete perfiles del listado.
- Búsqueda funcional o acciones para agregar, editar, eliminar o vincular perfiles y padres.
- Las pantallas de resumen del día, avisos, cuenta, crear publicación o inicio/cierre de sesión.
- Un diseño móvil alternativo.
