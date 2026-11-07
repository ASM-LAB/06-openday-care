# SPEC 05 — Vincular padre

> **Estado:** Implantadp
> **Depende de:** SPEC 02
> **Fecha:** 2026-11-07
> **Objetivo:** Añadir al perfil de Mateo un modal adaptable para simular la invitación de otro padre sin enviar correos ni guardar datos.

## Alcance

**Incluye:**

- Reemplazar el control visual «Vincular otro padre» de `/kids/mateo-fernandez` por un botón que abra un modal basado en `references/pantallas/vincular-padre.dc.html`.
- Reproducir el estilo, los textos, los campos y el orden de la referencia, adaptando el modal a ventanas estrechas.
- Mostrar el nombre «Mateo Fernández» en el encabezado y conservar el aviso sobre el acceso al feed de Mateo, aclarando que la invitación es simulada.
- Permitir ingresar el nombre y el correo de la persona invitada, y elegir entre Mamá, Papá y Tutor/a. Mamá aparece seleccionada inicialmente.
- Exigir un nombre no vacío y un correo con formato válido. Mostrar errores junto a los campos, conservar lo ingresado y mantener abierto el modal si la validación falla.
- Mostrar el código ilustrativo `7K4P9` y «Vence en 7 días», aclarando que el código no es válido para una activación real.
- Cerrar el modal con su botón X, con Escape o al hacer clic fuera. Cerrar sin enviar descarta los valores ingresados.
- Tras un envío válido, cerrar el modal y mostrar en el perfil un aviso accesible que aclare que no se envió ningún correo ni se guardaron datos.
- Permitir abrir y cerrar el modal nuevamente sin modificar la lista estática de padres del perfil.

**Fuera de alcance (para futuras especificaciones):**

- Envío de correo, creación de cuentas, autenticación o activación real de invitaciones.
- Generación o validación de códigos reales, vencimientos reales y aceptación de invitaciones.
- Guardar invitaciones o nuevos padres en memoria, `sessionStorage`, `localStorage` o una base de datos.
- Vincular padres a niños distintos de Mateo o crear perfiles para los niños agregados durante la sesión.
- Editar o eliminar los padres estáticos existentes en el perfil.

## Modelo de datos

Esta especificación no introduce estructuras persistentes. El nombre, el correo, el parentesco seleccionado y los errores existen solo en el estado temporal del modal y se descartan al cerrarlo. El código `7K4P9` es contenido ilustrativo fijo, no un código de invitación real.

## Plan de implementación

1. Crear `app/kids/[id]/LinkParentModal.tsx` y `app/kids/[id]/link-parent-modal.module.css` con el disparador accesible y el modal adaptable; implementar los campos, el parentesco inicial, la validación, el cierre por X/Escape/clic exterior y el descarte de valores al cerrar.
2. Integrar el componente en `app/kids/[id]/page.tsx`, mantener el control disponible solo en el perfil estático de Mateo y mostrar tras un envío válido un aviso accesible de simulación, sin alterar ni persistir los padres existentes.
3. Verificar la apariencia frente a `references/pantallas/vincular-padre.dc.html`, el uso a 1200 × 800 y en una ventana estrecha, el recorrido de abrir/cerrar/enviar y los comandos `npx tsc --noEmit` y `npm run build`.

## Criterios de aceptación

- [ ] En `/kids/mateo-fernandez`, «Vincular otro padre» abre el modal y el botón X lo cierra.
- [ ] El modal muestra a Mateo Fernández, el aviso informativo, los campos de nombre y correo, las tres opciones de parentesco y el código ilustrativo, en el orden de la referencia.
- [ ] El contenido indica claramente que el correo no se enviará y que el código no sirve para una activación real.
- [ ] Mamá aparece seleccionada al abrir; se puede seleccionar Papá o Tutor/a.
- [ ] Enviar con nombre vacío o correo inválido mantiene el modal abierto, señala el campo correspondiente y conserva los valores ingresados.
- [ ] Enviar con nombre y correo válidos cierra el modal y muestra en el perfil un aviso accesible de que no se envió correo ni se guardaron datos.
- [ ] Escape y un clic fuera cierran el modal sin mostrar el aviso de envío; los valores se descartan al cerrar.
- [ ] Abrir de nuevo el modal no añade ni modifica filas en la lista estática de padres.
- [ ] El modal se puede usar en una ventana estrecha sin desbordamiento horizontal y su contenido puede desplazarse si no cabe en alto.
- [ ] `npx tsc --noEmit` y `npm run build` finalizan correctamente.

## Decisiones

- **Sí:** abrir el modal únicamente desde el perfil de Mateo, porque es el único perfil con una acción de vinculación definida.
- **Sí:** simular el envío sin persistencia ni correo real, en coherencia con las pantallas estáticas actuales.
- **Sí:** usar el código fijo `7K4P9` como ejemplo y marcarlo explícitamente como no válido, en vez de sugerir una invitación operativa.
- **Sí:** validar nombre y correo y seleccionar Mamá inicialmente, según los campos de la referencia.
- **Sí:** cerrar con X, Escape o clic exterior y descartar los valores no enviados, para que cancelar no deje datos temporales en el modal.
- **Sí:** mostrar un aviso explícito tras el envío simulado, evitando que se confunda con un correo realmente enviado.
- **Sí:** adaptar el modal a pantallas estrechas; el diseño de escritorio sigue la referencia.
- **No:** modificar el modelo de padres del perfil o vincular los niños nuevos de SPEC 04; no forman parte de este flujo.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El texto de la referencia puede hacer creer que se enviará un correo real. | Aclarar en el aviso y en la confirmación que el flujo es simulado y no guarda datos. |
| El modal puede exceder el alto disponible en ventanas pequeñas. | Limitar su tamaño al área visible y permitir desplazamiento vertical del contenido. |

## Qué **no** incluye esta especificación

- Envío de correos, autenticación, activación de cuentas o códigos reales.
- Guardar invitaciones o padres, de forma temporal o persistente.
- Vincular padres a perfiles distintos de Mateo o a los niños nuevos.
- Editar o eliminar las filas de padres existentes.
