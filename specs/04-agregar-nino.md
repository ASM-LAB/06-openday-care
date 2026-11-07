# SPEC 04 — Agregar niño

> **Estado:** Aprobado
> **Depende de:** SPEC 02
> **Fecha:** 2026-11-07
> **Objetivo:** Añadir desde Kids un formulario para registrar niños de prueba en la sala Soles y conservarlos durante la sesión de la pestaña.

## Alcance

**Incluye:**

- Crear `/kids/agregar`, reproduciendo la referencia `references/pantallas/agregar-nino.dc.html` y adaptando el formulario a pantallas estrechas.
- Conectar el botón «Agregar niño» de `/kids` con el formulario.
- Exigir nombre no vacío, fecha de nacimiento real no futura y sala Soles; mostrar errores junto a los campos inválidos y conservar lo escrito.
- Permitir ingresar alergias separadas por comas y notas médicas, ambas opcionales.
- Guardar los niños en `sessionStorage` para conservarlos durante la sesión de la pestaña, incluidas navegación y recarga.
- Volver a `/kids` tras guardar correctamente o cancelar. Cancelar descarta los cambios sin pedir confirmación.
- Añadir los niños guardados después de los ocho perfiles fijos, en orden de creación, y actualizar el contador de la sala.
- Mostrar en las tarjetas nuevas el nombre, la inicial, la edad, «sin padres vinculados» y la primera alergia si existe. Las tarjetas nuevas no abren un perfil.
- Mostrar la edad en meses completos antes del primer cumpleaños y en años completos desde entonces.
- Informar en el formulario si no se pueden guardar los datos, sin perder los valores ingresados.
- Si los datos guardados no se pueden leer, mostrar los ocho perfiles fijos y un aviso sin borrar los datos guardados.

**Fuera de alcance (para futuras especificaciones):**

- Backend, base de datos, sincronización, autenticación y perfiles persistentes.
- Datos reales de niños o uso de alergias y notas médicas en producción.
- Crear perfiles individuales o navegación a perfiles para los niños nuevos.
- Editar, eliminar, buscar o filtrar niños.
- Más salas que Soles, asignación de padres o cambios a los ocho perfiles fijos.
- Rediseñar para móvil las pantallas distintas del formulario de agregar niño.

## Modelo de datos

Los registros temporales se guardan en `sessionStorage` bajo la clave `opendaycare:kids:v1` como un arreglo JSON:

```ts
type SessionKid = {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  room: "Soles";
  allergies: string[];
  medicalNotes: string;
};
```

El nombre se guarda sin espacios al principio o al final. Las alergias se separan por comas, se recortan y se guardan como etiquetas no vacías. La lista de datos fijos de SPEC 02 no cambia. Los registros temporales son solo para pruebas: `sessionStorage` no protege información médica y no debe usarse para datos reales.

## Plan de implementación

1. Crear `app/kids/agregar/page.tsx` y `app/kids/agregar/agregar.module.css` para reproducir el formulario, sus controles editables, validación por campo, errores accesibles y distribución adaptable; conectar cancelar con `/kids` y comprobar que `/kids/agregar` carga directamente.
2. Actualizar `app/kids/page.tsx` y `app/kids/kids.module.css` para enlazar «Agregar niño» al formulario, leer y validar los registros de `sessionStorage`, anexar sus tarjetas tras los ocho perfiles fijos y calcular el contador y las edades; comprobar que datos inválidos o inaccesibles muestran el aviso y no ocultan la lista fija.
3. Implementar el guardado del formulario en `sessionStorage` con la clave y el formato definidos, la navegación a `/kids` tras guardar, y el manejo del fallo de escritura conservando los valores; verificar el recorrido `/kids` → `/kids/agregar` → `/kids` y que los registros sobreviven una recarga de la pestaña.

## Criterios de aceptación

- [ ] El botón «Agregar niño» de `/kids` abre `/kids/agregar`.
- [ ] `/kids/agregar` reproduce el contenido y el orden de campos de la referencia.
- [ ] Nombre, fecha y sala son obligatorios; sala solo permite Soles.
- [ ] El formulario rechaza nombres vacíos, fechas inexistentes y fechas futuras, muestra errores por campo y conserva los valores ingresados.
- [ ] Alergias y notas médicas pueden dejarse vacías; las alergias se guardan separadas en etiquetas por coma.
- [ ] Guardar datos válidos escribe el registro con el formato especificado y vuelve a `/kids`.
- [ ] El niño nuevo aparece después de los ocho perfiles fijos, actualiza el contador y muestra su nombre, inicial, edad y estado de vinculación; si tiene alergias, la tarjeta muestra la primera.
- [ ] Las tarjetas nuevas no enlazan al perfil de Mateo ni a otro perfil.
- [ ] La edad aparece en meses completos antes del primer cumpleaños y en años completos desde el primer cumpleaños.
- [ ] Los registros se mantienen al navegar y recargar la pestaña, y no se requiere conservarlos al cerrar la pestaña.
- [ ] Cancelar vuelve a `/kids` sin confirmación y sin guardar el formulario.
- [ ] Si falla la escritura, el formulario permanece abierto, conserva sus valores y muestra un error.
- [ ] Si no se pueden leer los registros, `/kids` mantiene los ocho perfiles fijos y muestra un aviso sin borrar los datos.
- [ ] En ventanas estrechas, fecha y sala se disponen sin desbordar el formulario.
- [ ] `npx tsc --noEmit` y `npm run build` finalizan correctamente.

## Decisiones

- **Sí:** usar `sessionStorage`, para conservar los registros al navegar y recargar sin persistirlos después de cerrar la pestaña.
- **No:** usar una base de datos o `localStorage`, porque esta especificación limita el registro a datos de prueba temporales.
- **Sí:** ofrecer únicamente Soles, la única sala representada por la pantalla Kids actual.
- **Sí:** rechazar fechas futuras además de fechas inválidas y campos vacíos, para evitar registros de nacimiento incoherentes.
- **Sí:** mostrar errores junto a cada campo y conservar los datos escritos cuando falle la validación o el almacenamiento.
- **Sí:** anexar tarjetas sin perfil y mostrar «sin padres vinculados», para no abrir el perfil estático de Mateo por error.
- **Sí:** mostrar la primera alergia como etiqueta y conservar las notas médicas sin exponerlas en la tarjeta.
- **Sí:** adaptar únicamente el formulario a pantallas estrechas.
- **Sí:** limitar explícitamente los datos a pruebas; `sessionStorage` no es almacenamiento seguro para información médica real.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `sessionStorage` puede estar deshabilitado o fallar al escribir. | Mantener el formulario con sus valores y mostrar un error; no simular un guardado exitoso. |
| Los datos médicos de prueba son accesibles desde el navegador. | Advertir que no deben ingresarse datos reales y excluir autenticación y uso en producción del alcance. |
| El contenido guardado puede estar dañado o tener un formato inesperado. | Validar el formato al leer, mostrar un aviso y conservar visible la lista fija sin borrar el contenido almacenado. |

## Qué **no** incluye esta especificación

- Backend, base de datos, sincronización, autenticación ni persistencia entre sesiones de pestaña.
- Datos reales de niños ni almacenamiento seguro de alergias o notas médicas.
- Perfiles individuales, edición, eliminación, búsqueda o filtros para niños nuevos.
- Salas adicionales o asignación de padres.
- Un rediseño móvil de otras pantallas.
