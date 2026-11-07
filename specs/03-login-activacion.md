# SPEC 03 — Inicio de sesión y activación de cuenta

> **Estado:** Aprobado
> **Depende de:** SPEC 01
> **Fecha:** 2026-11-07
> **Objetivo:** Añadir las pantallas simuladas de inicio de sesión y activación de cuenta reproduciendo sus referencias y conectando su navegación con el Feed.

## Alcance

**Incluye:**

- Crear `/login` con el aspecto de `references/pantallas/login.dc.html`, omitiendo el selector «Personal» o «Familia».
- Crear `/activar-cuenta` con el aspecto de `references/pantallas/activar-cuenta.dc.html`.
- Reproducir la distribución, colores, tipografías, textos, iconos y espaciados de ambas referencias.
- Mostrar inicialmente los valores de ejemplo de las referencias y permitir editar todos los campos.
- Permitir marcar y desmarcar la autorización para compartir fotos, que aparece marcada inicialmente.
- Conectar «Activá tu cuenta» con `/activar-cuenta` y «Iniciar sesión» con `/login`.
- Hacer que «Iniciar sesión» y «Activar mi cuenta» abran `/` sin validar los campos ni guardar datos.
- Mantener «¿Olvidaste tu contraseña?» como control visual sin acción y «Cerrar sesión» del Feed sin cambios.
- Mantener la estructura de escritorio de las referencias en pantallas pequeñas, sin rediseño adaptable.

**Fuera de alcance (para futuras especificaciones):**

- Autenticación, cuentas, invitaciones, sesiones y persistencia.
- Validación de campos, mensajes de error y estados de carga.
- Recuperación de contraseña y cierre de sesión funcional.
- Contenido dinámico, incluida la tarjeta de invitación o los datos del usuario.
- Rediseño adaptable para móvil.

## Modelo de datos

Esta especificación no introduce estructuras de datos persistentes. Los valores de los formularios y la autorización de fotos son temporales y se descartan al navegar o recargar. El contenido de la tarjeta de invitación de la referencia es fijo.

## Plan de implementación

1. Crear `app/login/page.tsx` y su hoja de estilos para reproducir el panel lateral, el formulario y el pie de la referencia, con los enlaces a `/activar-cuenta` y `/`; verificar `/login` en escritorio y móvil.
2. Crear `app/activar-cuenta/page.tsx` y su hoja de estilos para reproducir la tarjeta de invitación, los campos y la autorización marcable, con los enlaces a `/login` y `/`; verificar `/activar-cuenta` y el recorrido `/login` → `/activar-cuenta` → `/`.

## Criterios de aceptación

- [ ] `/login` muestra el panel lateral y el formulario en el mismo orden y con el contenido de la referencia.
- [ ] `/activar-cuenta` muestra la tarjeta de invitación, los campos y la autorización en el mismo orden y con el contenido de la referencia.
- [ ] Una captura de cada ruta a 1200 × 800 coincide visualmente con su referencia en distribución, colores, tipografía y espaciado.
- [ ] El login no muestra las opciones «Personal» ni «Familia».
- [ ] Los campos muestran inicialmente los valores de ejemplo de las referencias y pueden editarse.
- [ ] La autorización aparece marcada y puede desmarcarse y volver a marcarse.
- [ ] «Activá tu cuenta» abre `/activar-cuenta` e «Iniciar sesión» abre `/login`.
- [ ] «Iniciar sesión» y «Activar mi cuenta» abren `/` sin validar los campos ni guardar datos.
- [ ] «¿Olvidaste tu contraseña?» no navega ni ejecuta acciones, y «Cerrar sesión» del Feed conserva su comportamiento actual.
- [ ] En una ventana móvil se conserva la estructura de las referencias sin adaptación adicional.
- [ ] `npx tsc --noEmit` y `npm run build` finalizan correctamente.

## Decisiones

- **Sí:** pantallas simuladas con datos fijos, porque no se solicita backend ni autenticación real.
- **Sí:** usar `/login` y `/activar-cuenta`, manteniendo el Feed en `/` según SPEC 01.
- **Sí:** omitir el selector «Personal» o «Familia» y conservar el email de ejemplo de la referencia.
- **Sí:** navegar al Feed desde ambos botones principales sin validación, ya que no existe autenticación.
- **Sí:** permitir editar campos y marcar la autorización sin persistir, para que los formularios se comporten como formularios.
- **Sí:** dejar «¿Olvidaste tu contraseña?» y «Cerrar sesión» como están, porque su funcionalidad requiere otro alcance.
- **Sí:** conservar la estructura móvil original, en coherencia con SPEC 01 y SPEC 02.
- **No:** añadir validación, mensajes de error, estados de carga o persistencia; no son necesarios para reproducir las pantallas.

## Reglas de código

- Mantener el código limpio y usar nombres en inglés para variables y constantes.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| La comparación visual varía según el navegador o la disponibilidad de las fuentes. | Comparar las referencias y las rutas en el mismo navegador a 1200 × 800 y verificar la carga de Fredoka y Nunito. |
| Los campos editables podrían sugerir autenticación real. | No guardar datos ni mostrar mensajes de éxito; los botones solo navegan al Feed. |

## Qué **no** incluye esta especificación

- Autenticación, cuentas, invitaciones, sesiones ni persistencia.
- Validación de campos, mensajes de error o estados de carga.
- Recuperación de contraseña o cierre de sesión funcional.
- Contenido dinámico o datos reales de usuarios.
- Un diseño móvil alternativo.
