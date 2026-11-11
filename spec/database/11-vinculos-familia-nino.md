# SPEC 11 — Vínculos reales entre familias y niños

> **Estado:** Borrador
> **Depende de:** SPEC 05, SPEC 09, SPEC 10
> **Fecha:** 2026-11-11
> **Objetivo:** Permitir que el staff gestione en Supabase los vínculos entre cuentas de padres o tutores y niños de su guardería.

## Alcance

**Incluye:**

- Reemplazar la vinculación simulada del perfil de niño por relaciones persistidas entre cuentas existentes de padres/tutores y niños.
- Permitir varios padres/tutores por niño y varios niños por padre/tutor.
- Registrar el parentesco de cada relación como madre, padre o tutor.
- Permitir que personal activo `staff` y `admin` gestione relaciones solo dentro de su guardería.
- Permitir que un padre/tutor consulte sus propios vínculos sin habilitarle la lectura de datos médicos de `children`.
- Eliminar la relación al desvincular y retirar el acceso derivado de ella en verificaciones posteriores.
- Limitar la selección a cuentas Supabase ya existentes, activas, con `role = 'parent'` y de la misma guardería.

**Fuera de alcance (para futuras especificaciones):**

- Crear cuentas, invitaciones, envío de correos, activación de cuentas o búsqueda en `auth.users`.
- Permitir que padres/tutores creen o eliminen sus propias relaciones.
- Cambiar autenticación, perfiles, roles, estados o asignación de guardería.
- Exponer a padres/tutores notas médicas, alergias u otros datos de gestión de niños.

## Modelo de datos

Se reutilizan `public.users`, `public.children` y `public.rooms`. Se crea `public.parent_children` y se reutiliza o crea `public.relationship_type` después de inspeccionar el esquema remoto.

```ts
type RelationshipType = "mother" | "father" | "guardian";

type ParentChild = {
  parent_id: string; // uuid, FK a public.users.id
  child_id: string; // uuid, FK a public.children.id
  relationship: RelationshipType;
  created_at: string; // timestamptz
};
```

La combinación `(parent_id, child_id)` es única. Ambas claves foráneas tienen índices. El borrado de una cuenta o de un niño elimina sus relaciones dependientes. Las etiquetas visibles son «Madre», «Padre» y «Tutor/a»; los valores persistidos son ingleses.

RLS queda habilitado en `public.parent_children`. Un padre/tutor activo puede leer solamente relaciones cuyo `parent_id` coincide con su UUID autenticado. Personal activo `staff` y `admin` puede leer y gestionar relaciones solo cuando el perfil y el niño pertenecen a la misma guardería. Ninguna política de esta tabla concede lectura de columnas sensibles de `public.children`.

## Plan de implementación

1. Inspeccionar en Supabase remoto las tablas, tipos, políticas y perfiles de `users`, `children` y `rooms`; consultar la documentación vigente y el changelog de Supabase antes de cambiar RLS o el esquema. Confirmar que los perfiles de padres ya existentes están activos y asignados a una guardería. No cambiar datos durante la inspección.
2. Crear una migración versionada para `relationship_type` si hace falta, `parent_children`, restricciones, índices, grants mínimos y políticas RLS. Aplicarla y verificarla en el proyecto remoto mediante Supabase MCP, sin configurar una instancia local.
3. Añadir lecturas y acciones de servidor que validen sesión, rol activo, guardería, estado del perfil padre y existencia del niño antes de crear o quitar un vínculo. Mantener RLS como segunda barrera.
4. Sustituir el flujo simulado del detalle `app/kids/[id]` por una lista persistida de padres/tutores y un selector de cuentas existentes. Mostrar un estado claro cuando no haya cuentas elegibles; no crear invitaciones.
5. Verificar los flujos de vinculación y desvinculación, el aislamiento entre guarderías y el acceso real con sesiones de padre, staff y admin; ejecutar `npx tsc --noEmit` y `npm run build`.

## Criterios de aceptación

- [ ] Existe una sola relación por par padre-niño; los duplicados son rechazados por la base de datos.
- [ ] Un staff/admin activo puede vincular únicamente perfiles parent activos y niños de su propia guardería.
- [ ] No se puede crear una relación con una cuenta inexistente, pendiente, de otro rol o de otra guardería.
- [ ] Se pueden asociar varios padres a un niño y varios niños a un padre, con parentesco independiente por relación.
- [ ] El detalle del niño lista sus relaciones persistidas y permite agregar una cuenta existente o quitar una relación.
- [ ] Si no hay cuentas parent elegibles, la interfaz informa que no hay cuentas disponibles y no ofrece invitaciones ni alta de usuarios.
- [ ] Quitar una relación elimina la fila y las políticas dejan de autorizar el acceso derivado de esa relación.
- [ ] Un padre/tutor solo puede leer sus relaciones; no puede leer ni modificar relaciones de otra cuenta.
- [ ] Padres/tutores no obtienen acceso a `medical_notes`, `allergy_tags` u otros datos de gestión de `children`.
- [ ] RLS está habilitado; las políticas de inserción, lectura y borrado restringen las operaciones por identidad, rol activo y guardería.
- [ ] Los fallos de lectura o escritura muestran un error accesible y no se anuncian como operaciones exitosas.
- [ ] `npx tsc --noEmit` y `npm run build` finalizan correctamente con la configuración requerida.

## Decisiones

- **Sí:** vincular cuentas existentes en vez de crear cuentas o invitaciones; evita mezclar este cambio con autenticación y correo.
- **Sí:** conservar una relación muchos-a-muchos con parentesco por vínculo, como propone el esquema de referencia.
- **Sí:** desvincular mediante borrado de la relación; elimina el permiso derivado sin borrar el perfil del padre ni el niño.
- **No:** permitir lectura de datos médicos a padres/tutores; el permiso de vínculo se usa para autorización de publicaciones, no para ampliar la pantalla Kids.
- **No:** confiar únicamente en filtros de la interfaz; las operaciones y lecturas se vuelven a proteger mediante RLS.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| No existen perfiles parent activos o no están asignados a la guardería correcta. | Verificar los perfiles remotos antes de desplegar; informar que no hay cuentas elegibles y detenerse sin crear cuentas. |
| Las políticas de relación permiten cruces entre guarderías o acceso indirecto a datos médicos. | Validar ambos lados de la relación y probar sesiones de cada rol; no conceder a padres SELECT general sobre `children`. |
| El perfil actual ofrece solo una vinculación simulada. | Reemplazar el resultado simulado por persistencia real y no mostrar confirmación hasta que Supabase confirme la operación. |

## Qué **no** incluye esta especificación

- Registro, alta, invitación, activación o correo para padres/tutores.
- Gestión de relaciones fuera de la propia guardería o por parte de padres/tutores.
- Acceso familiar a datos médicos o gestión general de perfiles de niños.
- Cambios en la autenticación definida en SPEC 09.
