# Tasks

## 1. Verificar y preparar el acceso familiar en Supabase

- [ ] 1.1 Inspeccionar mediante Supabase MCP las tablas, tipos, grants, políticas RLS, objetos de Storage y perfiles existentes; comparar el resultado con `spec/database/11-vinculos-familia-nino.md`, `12-backend-publicaciones.md` y `13-feed-publicaciones.md`, y verificar cuentas parent activas con guardería asignada. Registrar el estado observado sin modificar datos y detenerse para revisar el diseño si faltan perfiles o el modelo real cambia el acceso acordado.
- [ ] 1.2 Crear o ajustar, solo después de aprobar la inspección, el esquema mínimo de vínculos familiares y parentesco; verificar restricciones únicas, claves foráneas, índices, grants y políticas con sesiones staff, admin y parent, incluyendo intentos entre guarderías y lectura de datos médicos.

## 2. Implementar y verificar los vínculos familia-niño

- [ ] 2.1 Añadir operaciones de servidor para listar cuentas parent elegibles y crear o eliminar vínculos, validando perfil activo, rol, guardería y niño en servidor; verificar rechazos para cuentas pendientes, roles incorrectos, duplicados y relaciones entre guarderías.
- [ ] 2.2 Reemplazar la vinculación simulada en el detalle de niños por relaciones persistidas, selección de cuentas existentes y parentesco; verificar estados vacíos, errores accesibles, persistencia tras recargar y que no exista flujo de invitación.
- [ ] 2.3 Verificar con una sesión parent que solo pueda consultar sus propios vínculos y que el vínculo no permita leer notas médicas, alergias ni otros campos de gestión de niños.

## 3. Implementar autorización por rol y paneles separados

- [ ] 3.1 Centralizar la carga y validación server-side del perfil activo y redirigir desde el login al panel canónico según `staff`, `admin` o `parent`; verificar que el rol/destino del cliente no permita escalar permisos y que perfiles faltantes, inactivos o no admitidos sean rechazados.
- [ ] 3.2 Separar las rutas y navegación de staff y familia, conservar gestión de niños en el panel de staff y añadir el shell familiar sin acciones de escritura; verificar acceso directo a rutas y acciones con sesiones de cada rol.
- [ ] 3.3 Añadir o actualizar pruebas de autorización y documentar los destinos y roles admitidos; verificar que el recorrido de login único funcione para staff, admin y parent sin redirecciones abiertas ni bucles.

## 4. Conectar publicaciones persistentes y el feed familiar

- [ ] 4.1 Crear o ajustar el backend de publicaciones y fotos privadas, grants, RLS y políticas de Storage según el esquema remoto inspeccionado; verificar autoría, permisos de admin, audiencia por guardería/sala y acceso de medios, incluida revocación tras desvincular.
- [ ] 4.2 Conectar el feed y compositor de staff a datos persistentes para publicar a toda la guardería o a una sala, conservar permisos de edición/borrado y retirar publicaciones de demostración; verificar persistencia tras recarga, validaciones, errores y controles por rol.
- [ ] 4.3 Añadir el feed familiar de solo lectura con anuncios generales y publicaciones de salas vinculadas, estados vacío/error accesibles y medios autorizados; verificar que no muestre publicaciones de otras salas ni controles de publicación.
- [ ] 4.4 Verificar paginación, audiencia y retirada de acceso con sesiones reales de staff, admin y parent; ejecutar `npx tsc --noEmit` y `npm run build`.
