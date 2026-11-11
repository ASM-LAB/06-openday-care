# SPEC 12 — Backend persistente de publicaciones

> **Estado:** Borrador
> **Depende de:** SPEC 06, SPEC 09, SPEC 10, SPEC 11
> **Fecha:** 2026-11-11
> **Objetivo:** Persistir publicaciones del staff y sus imágenes privadas en Supabase con autorización por guardería y destinatario.

## Alcance

**Incluye:**

- Crear el modelo persistente de publicaciones y metadatos de imágenes, reutilizando perfiles, guarderías, salas y relaciones familia-niño existentes.
- Admitir publicación inmediata dirigida a una sala o a toda la guardería; `room_id = null` representa toda la guardería.
- Admitir las siete categorías actuales del compositor: Comida, Siesta, Actividad, Logro, Ánimo, Foto y Anuncio.
- Permitir escritura a perfiles activos `staff` y `admin` de la propia guardería; el autor puede modificar y borrar sus publicaciones y un admin puede gestionar cualquiera de su guardería.
- Permitir lectura a perfiles activos de la misma guardería según destinatario: staff/admin pueden leer todas; padres/tutores pueden leer las generales y las dirigidas a salas de niños con los que mantienen un vínculo vigente.
- Guardar hasta cinco imágenes opcionales por publicación en un bucket privado, con máximo de 10 MB por archivo y MIME JPG, PNG o WebP.
- Proteger tablas, objetos y metadatos con grants mínimos, RLS y políticas de Storage; no usar URLs públicas.
- Ofrecer contratos de lectura y escritura de servidor para el feed, creación, edición, borrado y carga de imágenes.

**Fuera de alcance (para futuras especificaciones):**

- Cambios de interfaz del feed y el compositor; se cubren en SPEC 13.
- Cuentas, autenticación o relaciones familiares; se cubren en SPEC 09 y SPEC 11.
- Título, borradores, programación, notificaciones, comentarios, reacciones o respuestas.
- Imágenes distintas de JPG, PNG y WebP; archivos de más de 10 MB o más de cinco fotos por publicación.

## Modelo de datos

La migración debe inspeccionar el esquema remoto antes de crear o alterar tablas o tipos. Se reutilizan los nombres `public.posts`, `public.post_photos` y `public.post_type` del esquema de referencia, conciliándolos con el estado real de Supabase.

```ts
type PostType =
  | "meal"
  | "nap"
  | "activity"
  | "achievement"
  | "mood"
  | "photo"
  | "announcement";

type Post = {
  id: string; // uuid
  daycare_id: string; // uuid, guardería del autor y del destinatario
  author_id: string; // uuid, FK a public.users.id
  room_id: string | null; // uuid, null significa toda la guardería
  type: PostType;
  body: string;
  published_at: string; // timestamptz, se asigna al publicar
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
};

type PostPhoto = {
  id: string; // uuid
  post_id: string; // uuid, FK a public.posts.id
  storage_path: string; // ruta del objeto en el bucket privado
  position: number; // orden visible, de 1 a 5
  created_at: string; // timestamptz
};
```

`body` es texto obligatorio no vacío. No se agrega título. Las categorías visibles se traducen desde `post_type`: `meal` → Comida, `nap` → Siesta, `activity` → Actividad, `achievement` → Logro, `mood` → Ánimo, `photo` → Foto y `announcement` → Anuncio. Si el tipo remoto existe sin `mood`, la migración lo añade de forma compatible; no se asume que la tabla o el enum aún no existan.

`posts.daycare_id` identifica el tenant. El autor y la sala deben pertenecer a esa guardería; `room_id` es nullable para publicaciones generales. Las claves foráneas, restricciones de pertenencia y los índices requeridos por feed, RLS y relaciones se definen explícitamente. `post_photos.storage_path` guarda la ruta del objeto, nunca una URL firmada o pública.

El bucket privado se llama `post-photos`. Solo admite `image/jpeg`, `image/png` y `image/webp`, con un máximo de 10 MB por objeto. El límite de cinco fotos por publicación se valida en el servidor al crear y editar. Los objetos se nombran con identificadores generados, no con nombres de archivo confiados al cliente.

Las políticas de `posts`, `post_photos` y `storage.objects` deben usar la misma regla de audiencia. Padres/tutores solo leen objetos de publicaciones que pueden leer en ese momento. La entrega de imágenes usa solicitudes autenticadas con autorización evaluada en cada acceso; no se emiten URLs públicas ni URLs firmadas de larga duración.

## Plan de implementación

1. Inspeccionar en Supabase remoto tablas, enums, permisos, RLS, Storage y relaciones existentes. Consultar la documentación vigente y el changelog de Supabase antes de definir cambios. No modificar datos hasta confirmar el estado remoto y las dependencias SPEC 10 y SPEC 11.
2. Crear una migración versionada mediante el flujo de migraciones del proyecto para `posts`, `post_photos`, las restricciones, los índices, los grants mínimos y las políticas RLS. Aplicar y verificar los cambios en el proyecto remoto mediante Supabase MCP; no configurar una instancia local.
3. Crear el bucket privado `post-photos` y configurar sus límites, MIME permitidos y políticas de lectura, carga y borrado coherentes con las políticas de publicaciones. Verificar tanto solicitudes autenticadas permitidas como denegadas.
4. Añadir los tipos y las operaciones de servidor de publicaciones bajo `lib/posts/` y un módulo de acciones de servidor en `app/`. Validar identidad, rol activo, guardería, sala, tipo, texto, cantidad y tamaño de archivos antes de persistir.
5. Implementar compensación de cargas: si falla la creación o edición, borrar los objetos cargados durante esa operación y no anunciar éxito; si falla el borrado de objetos, conservar una operación recuperable y comunicar el error.
6. Verificar políticas con cuentas/sesiones staff, admin y parent, revisar los advisories de seguridad aplicables y ejecutar `npx tsc --noEmit` y `npm run build`.

## Criterios de aceptación

- [ ] Los registros persisten y sobreviven recargas; no hay escritura de publicaciones en estado React como fuente de verdad.
- [ ] Una publicación guarda guardería, autor, sala opcional, categoría, texto y marcas de tiempo; no guarda título ni URL firmada.
- [ ] `room_id = null` identifica una publicación de toda la guardería; una sala de otra guardería no puede asignarse.
- [ ] Un perfil activo staff/admin puede crear en su guardería; un usuario parent, pendiente, sin perfil o de otra guardería no puede escribir.
- [ ] Staff/admin activos leen publicaciones de su guardería; un padre activo lee las generales y las de salas donde mantiene un vínculo vigente.
- [ ] El autor puede actualizar o borrar sus publicaciones; un admin de la misma guardería puede gestionar cualquiera; otro staff no puede modificar la publicación ajena.
- [ ] Padres/tutores no pueden modificar publicaciones ni metadatos de fotos.
- [ ] La base de datos admite y valida las siete categorías actuales, incluido `mood` para Ánimo.
- [ ] Se acepta una publicación sin imágenes y hasta cinco imágenes JPG/PNG/WebP de 10 MB o menos cada una; archivos no permitidos o excedentes se rechazan en servidor.
- [ ] Los objetos no son públicos; una cuenta sin permiso no puede leerlos directamente ni tras cambiar el identificador de ruta.
- [ ] Al quitar un vínculo familia-niño, una solicitud de lectura posterior deja de autorizar publicaciones y fotos de la sala derivadas de ese vínculo.
- [ ] Si falla la carga o escritura, no se informa una publicación exitosa ni quedan objetos huérfanos tras la compensación exitosa.
- [ ] Al borrar correctamente una publicación, se eliminan sus metadatos y objetos asociados; si falla la limpieza, se informa el error y puede reintentarse.
- [ ] RLS está habilitado en todas las tablas expuestas; las políticas de actualización restringen tanto la fila de origen como los valores resultantes.
- [ ] `npx tsc --noEmit` y `npm run build` finalizan correctamente con la configuración requerida.

## Decisiones

- **Sí:** usar `room_id` nullable para distinguir sala de guardería completa y evitar destinatarios individuales, que no forman parte del alcance aprobado.
- **Sí:** guardar la ruta privada del objeto en `post_photos`, no una URL temporal que expire o una URL pública.
- **Sí:** reutilizar las siete categorías actuales y añadir `mood` al modelo persistente para no perder Ánimo.
- **Sí:** guardar `daycare_id` en la publicación para expresar el tenant y autorizar de forma explícita los listados y operaciones.
- **No:** permitir borradores o programación; enviar el formulario publica inmediatamente.
- **No:** conceder acceso solo por ocultar botones en la interfaz; la autorización también se exige en servidor, RLS y Storage.
- **No:** usar claves `service_role` o secretas en el navegador.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El esquema remoto puede diferir de la referencia o ya contener objetos homónimos. | Inspeccionar tablas, enums, políticas y Storage antes de migrar; adaptar la migración al estado real y evitar duplicados. |
| Una política de Storage podría filtrar fotos después de retirar un vínculo familiar. | Comprobar autorización en cada descarga autenticada y probar revocación con una sesión parent. |
| Base de datos y Storage no comparten una transacción. | Hacer operaciones idempotentes, compensar cargas parciales y no comunicar éxito hasta completar cada operación. |
| La edición o el borrado podrían dejar objetos sin metadatos o metadatos sin objeto. | Ordenar las operaciones, conservar errores recuperables y probar fallos parciales de Storage. |

## Qué **no** incluye esta especificación

- UI del feed, del compositor, de edición o de confirmación de borrado; se cubre en SPEC 13.
- Reacciones, comentarios, avisos, programación, borradores o títulos.
- Registro, invitaciones o relaciones entre padres y niños; se cubren en SPEC 09 y SPEC 11.
- Bucket público, archivos no imagen o procesamiento de imágenes.
