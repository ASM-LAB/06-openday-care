# SPEC 10 — Gestión persistente de niños

> **Estado:** aprobado
> **Depende de:** SPEC 02, SPEC 04, SPEC 09
> **Fecha:** 2026-11-09
> **Objetivo:** Conectar el alta, edición, archivo, listado y detalle de niños a Supabase con salas y acceso limitado por guardería.

## Alcance

**Incluye:**

- Crear `public.rooms` y `public.children` según el esquema de referencia, con RLS habilitado y marcas de tiempo actualizables.
- Reutilizar `public.daycares` y `public.users`, que ya existen; no volver a crearlas ni modificar el flujo de autenticación.
- Insertar exactamente las salas Soles, Nubes y Prados para la única guardería existente. Si Supabase remoto no contiene exactamente una guardería, detener la operación sin insertar salas.
- Restringir la consulta y gestión a perfiles activos `staff` o `admin` de la guardería asociada a su cuenta Auth. Los perfiles se asignan manualmente a cuentas Auth existentes; una cuenta sin perfil válido no accede a las pantallas ni a los datos.
- Conectar `/kids/agregar` para crear niños con nombre, fecha de nacimiento, sala, fecha de ingreso, alergias, notas médicas y consentimiento de fotos.
- Mostrar en el selector las salas cargadas desde Supabase. La fecha de ingreso empieza con la fecha actual y el consentimiento de fotos empieza activado.
- Normalizar las alergias como etiquetas inglesas `peanut`, `lactose` y `gluten`, con etiquetas visibles «Maní», «Lactosa» y «Gluten».
- Reemplazar los ocho perfiles ficticios y los registros de `sessionStorage` por niños persistidos en Supabase. No insertar niños iniciales.
- Mostrar en `/kids` los niños activos de la guardería, agrupados por sala, con su edad calculada desde la fecha de nacimiento y una etiqueta para la primera alergia si existe.
- Ofrecer un filtro para consultar niños archivados y permitir reactivarlos. Los archivados no aparecen en el listado predeterminado.
- Conectar `/kids/[id]` al registro correspondiente por UUID y mostrar todos sus campos, incluido consentimiento y estado. Los identificadores inexistentes o no accesibles muestran 404.
- Hacer que «Editar» en el detalle abra `/kids/[id]/editar`, con el formulario rellenado y los mismos campos que el alta.
- Archivar mediante `status = 'archived'` y reactivar mediante `status = 'active'`. No borrar físicamente niños.
- Mostrar errores accesibles ante fallos de lectura o escritura; el formulario conserva sus valores y no comunica éxito si Supabase rechaza la operación.
- Mantener las pantallas adaptadas al comportamiento visual existente, incluido el formulario estrecho; retirar el aviso que indica que los datos son solo de prueba.

**Fuera de alcance (para futuras especificaciones):**

- Crear o modificar `public.daycares` y `public.users`, registrar usuarios, asignar perfiles automáticamente o cambiar el login de SPEC 09.
- Crear niños de demostración, importar los ocho perfiles fijos actuales o conservar datos en `sessionStorage`.
- Vincular padres, crear invitaciones, gestionar relaciones familiares o mostrar información dinámica de padres.
- Borrado físico, búsqueda funcional, filtros distintos de activo/archivado, fotos de perfil o carga de archivos.
- Administración de salas desde la aplicación, soporte para más de una guardería en esta instalación o alta de una guardería nueva.
- Cambiar Feed, publicaciones, destinatarios estáticos u otras funciones de la aplicación.

## Modelo de datos

Se reutilizan las tablas y tipos existentes `public.daycares`, `public.users`, `public.user_role` (`staff`, `parent`, `admin`) y `public.user_status` (`pending`, `active`). Los perfiles de staff/admin se asignan manualmente a cuentas Auth existentes y a la guardería existente. No se crea un mecanismo de autoasignación.

```ts
type Room = {
  id: string; // uuid
  daycare_id: string; // FK a public.daycares.id
  name: "Soles" | "Nubes" | "Prados";
  created_at: string; // timestamptz
};

type Child = {
  id: string; // uuid
  room_id: string; // FK a public.rooms.id
  full_name: string;
  birth_date: string; // date, YYYY-MM-DD
  enrolled_at: string; // date, YYYY-MM-DD
  medical_notes: string | null;
  allergy_tags: Array<"peanut" | "lactose" | "gluten">;
  photo_consent: boolean; // default true
  status: "active" | "archived"; // child_status, default active
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
};
```

`rooms.daycare_id` referencia `public.daycares.id`; `children.room_id` referencia `public.rooms.id`. Cada combinación `(daycare_id, name)` de sala es única. `children.status` usa el enum `child_status` con valores `active` y `archived`. `allergy_tags` es un arreglo PostgreSQL `text[]`; la UI traduce los tres códigos definidos. El alta exige nombre, fecha de nacimiento, sala y fecha de ingreso; notas y alergias son opcionales. La fecha de nacimiento debe ser real y no futura.

Las políticas RLS de salas permiten lectura a perfiles activos `staff`/`admin` de la guardería propia; la aplicación no administra salas. Las políticas RLS de niños permiten lectura, inserción y actualización solo a esos perfiles y solo para niños cuyas salas pertenecen a su guardería. La actualización exige comprobación tanto de la fila existente como del valor resultante. No se concede borrado físico desde la aplicación. Padres, perfiles pendientes y usuarios sin perfil no acceden a estas filas.

## Plan de implementación

1. Inspeccionar en Supabase remoto las tablas, políticas, enums y registros existentes de `daycares` y `users`. Confirmar que existe exactamente una guardería y que hay al menos una cuenta Auth asignada a ella con perfil activo `staff` o `admin`; no cambiar datos durante esta inspección.
2. Añadir una migración a `supabase/migrations/` para crear `child_status`, `rooms` y `children`, sus claves foráneas, unicidad, defaults, actualización de `updated_at` y políticas RLS. Insertar de forma idempotente Soles, Nubes y Prados para la guardería confirmada. Aplicar los cambios y verificarlos en el proyecto remoto mediante Supabase MCP, según las reglas del repositorio.
3. Añadir acceso de servidor a salas y niños usando el cliente SSR de Supabase y la sesión actual. Aplicar controles de perfil activo y rol en las rutas y acciones; dejar que RLS vuelva a verificar guardería y operación. Verificar que las consultas directas con la clave publishable no pueden exceder las políticas.
4. Conectar `/kids/agregar` y añadir `/kids/[id]/editar` reutilizando el formulario. Implementar validación, selección de salas y alergias normalizadas, guardado, edición, archivo y reactivación; conservar los valores y mostrar errores ante fallos.
5. Conectar `/kids` y `/kids/[id]` a los datos remotos. Sustituir perfiles fijos y `sessionStorage`, hacer dinámicos el agrupamiento, contador, edad, alergias y detalle, e implementar los estados vacío, archivado, error y 404.
6. Verificar las rutas, roles y operaciones en Supabase remoto; ejecutar `npx tsc --noEmit` y `npm run build` con la configuración requerida, y comprobar el diseño del listado, alta, edición y detalle.

## Criterios de aceptación

- [x] La migración crea `rooms`, `children` y `child_status` con las claves, campos, defaults, restricciones y marcas de tiempo descritos.
- [x] La migración falla sin insertar salas si no existe exactamente una guardería; con una guardería, quedan exactamente Soles, Nubes y Prados y repetir el sembrado no duplica filas.
- [x] No se crean niños iniciales ni se recrean `daycares` o `users`.
- [ ] Un perfil activo `staff` o `admin` puede leer y mantener únicamente niños de su guardería; un padre, perfil pendiente o usuario sin perfil no puede acceder a los datos ni ejecutar la gestión.
- [x] RLS está habilitado en `rooms` y `children`; las políticas de actualización verifican tanto `USING` como `WITH CHECK`, y la aplicación no permite borrado físico.
- [ ] `/kids/agregar` carga las tres salas desde Supabase y muestra todos los campos acordados; el nombre, las fechas y la sala se validan antes de guardar.
- [ ] La fecha de nacimiento inválida o futura impide guardar, muestra un error accesible y conserva los valores; el ingreso inicia con la fecha actual y el consentimiento con valor afirmativo.
- [ ] Las alergias se guardan como códigos ingleses `peanut`, `lactose` y/o `gluten` y se muestran como «Maní», «Lactosa» y/o «Gluten».
- [ ] Guardar un niño válido lo persiste en Supabase y vuelve a `/kids`; el niño aparece en la sala elegida después de recargar la página.
- [ ] `/kids` muestra únicamente niños activos de la guardería, agrupados por sala, con edades calculadas correctamente y sin los ocho perfiles ficticios ni registros de `sessionStorage`.
- [ ] El estado vacío se muestra cuando no existen niños activos; los fallos de consulta muestran un error y no se presentan como una lista vacía exitosa.
- [ ] Cada tarjeta abre el detalle del UUID del niño correspondiente; un UUID inexistente o fuera del acceso del usuario produce 404.
- [ ] El detalle muestra nombre, nacimiento, sala, ingreso, alergias, notas, consentimiento y estado actuales de la base de datos.
- [ ] «Editar» abre `/kids/[id]/editar` con los valores actuales; guardar actualiza el registro y el detalle refleja los cambios después de recargar.
- [ ] Archivar excluye al niño del listado activo sin borrar la fila; el filtro de archivados permite verlo y reactivarlo.
- [ ] Ante fallos de escritura, el formulario conserva los valores, muestra un error accesible y permanece abierto.
- [ ] El formulario no muestra el aviso de datos solo de prueba; las pantallas adaptables no presentan desbordamiento horizontal en ventana estrecha.
- [x] `npx tsc --noEmit` y `npm run build` finalizan correctamente con la configuración de Supabase disponible.

## Decisiones

- **Sí:** mantener en una especificación la base de datos, el acceso y las pantallas conectadas, tal como se acordó, aunque abarque varios componentes.
- **Sí:** reutilizar `public.daycares` y `public.users`; sus migraciones ya existen y `public.users` vincula el UUID de Auth con `daycare_id` y `role`.
- **Sí:** exigir perfiles activos `staff`/`admin` asignados manualmente. Una asignación automática durante el login permitiría conceder guardería o rol sin una fuente confiable.
- **Sí:** sembrar exactamente tres salas para la única guardería existente y no crear una guardería nueva ni niños ficticios.
- **Sí:** sustituir los perfiles estáticos y `sessionStorage` por datos de Supabase para evitar mezclar registros de demostración y persistidos.
- **Sí:** archivar con `child_status` en lugar de borrar; la acción es reversible y mantiene la integridad de referencias futuras.
- **Sí:** limitar alergias a tres códigos normalizados con etiquetas españolas; evita almacenar traducciones de UI como valores de dominio.
- **Sí:** mostrar los niños activos inicialmente y dejar los archivados disponibles mediante filtro para no mezclarlos con la matrícula vigente.
- **No:** permitir que padres consulten o modifiquen estos datos desde las pantallas de gestión; la vinculación padre-niño y su autorización corresponden a otra especificación.
- **No:** consultar o escribir datos con una clave `service_role` desde el cliente; las operaciones usan la sesión SSR y quedan protegidas por RLS.
- **No:** modificar los comportamientos de autenticación definidos en SPEC 09; esta especificación añade autorización de dominio para las pantallas de gestión.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| La tabla `daycares` remota no tiene exactamente una guardería o no hay perfiles activos de staff/admin asociados. | Verificarlo antes de aplicar la migración o probar las pantallas; detenerse sin inventar guardería o permisos. |
| Una política RLS permite cambiar un niño a una sala de otra guardería. | Validar la sala de origen y destino con `USING` y `WITH CHECK`, y verificar acceso mediante la sesión autenticada. |
| Las notas médicas y alergias son información sensible. | No devolverlas a usuarios sin rol autorizado; habilitar RLS en tablas expuestas y no usar credenciales privilegiadas en el navegador. |
| Hay rutas o publicaciones que todavía mencionan perfiles estáticos. | Mantener esos flujos fuera de alcance y verificar que las pantallas Kids enlazan solo por UUID sin cambiar Feed. |

## Qué **no** incluye esta especificación

- Registro de usuarios, activación de cuentas, creación automática de perfiles ni cambios a la autenticación.
- Crear guarderías, administrar salas desde UI, importar perfiles ficticios o crear niños iniciales.
- Perfiles de padres, invitaciones, relaciones familiares o acceso de padres a información de niños.
- Borrado físico, búsqueda funcional, fotos de niños, carga de archivos o edición de publicaciones.
- Una instalación multi-guardería o cambios en Feed y sus destinatarios estáticos.
