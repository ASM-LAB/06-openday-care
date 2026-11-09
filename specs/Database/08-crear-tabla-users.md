# SPEC 08 — Crear tabla users

> **Estado:** Autorizado
> **Depende de:** SPEC 07
> **Fecha:** 2026-11-08
> **Objetivo:** Crear `public.users` como perfil de aplicación vinculado a Supabase Auth y a un único daycare.

## Alcance

**Incluye:**

- Añadir una migración imperativa versionada que cree los enums `user_role` (`staff`, `parent`, `admin`) y `user_status` (`pending`, `active`).
- Crear `public.users` con los campos, defaults, claves foráneas y nulabilidad acordados con `@db-schema`.
- Hacer obligatorio `daycare_id`, de modo que cada perfil pertenezca a exactamente un daycare y un daycare pueda tener varios usuarios.
- Vincular `users.id` a `auth.users(id)` con eliminación en cascada y `daycare_id` a `daycares(id)`.
- Activar RLS en `public.users` sin crear políticas; el acceso por API queda denegado hasta definir el modelo de autorización.
- Mantener `updated_at` con un trigger específico de la tabla que lo establezca en `now()` al insertar y en cada actualización.
- Añadir un fixture reproducible, exclusivo de Supabase local, con un daycare de prueba y un usuario Auth `staff` para comprobar el inicio de sesión.
- Crear el usuario Auth mediante el Admin API local y su perfil asociado mediante un script local; obtener email y contraseña de variables de entorno que no se versionan.
- Mantener el fixture separado de las migraciones de esquema para que no cree el daycare ni la cuenta de prueba en remoto.
- Validar la migración en Supabase local y aplicarla al proyecto remoto vinculado solo después de reconciliar su historial, sin modificar entradas existentes.
- Verificar en local y remoto el esquema, las restricciones, los defaults, el trigger y RLS; verificar también el fixture local y que remoto no reciba datos de prueba.

**Fuera de alcance (para futuras especificaciones):**

- Crear automáticamente el perfil con un trigger sobre `auth.users` o implementar signup, login e invitaciones.
- Leer `role` o `daycare_id` de `raw_user_meta_data` para conceder permisos o asignar tenants.
- Añadir políticas RLS o permisos de lectura/escritura para cualquier rol.
- Añadir email, contraseña u otros campos de autenticación que ya gestiona Supabase Auth.
- Modificar la aplicación Next.js o crear datos de prueba en el proyecto remoto.
- Eliminar, reparar o sustituir entradas de migración ya existentes en el proyecto remoto.

## Modelo de datos

Los enums y la tabla se crean en el esquema `public`:

```sql
CREATE TYPE public.user_role AS ENUM ('staff', 'parent', 'admin');
CREATE TYPE public.user_status AS ENUM ('pending', 'active');

CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  daycare_id uuid NOT NULL REFERENCES public.daycares (id),
  role public.user_role NOT NULL,
  status public.user_status NOT NULL DEFAULT 'active',
  full_name text NOT NULL,
  avatar_url text,
  notify_on_post boolean NOT NULL DEFAULT true,
  daily_summary_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

La migración también crea una función y un trigger limitados a mantener `updated_at`. No crea trigger de alta Auth ni políticas RLS. No incluye `email` ni `password_hash`.

El fixture local añade un daycare llamado `Daycare de prueba` en `supabase/seed.sql`. Un script `scripts/seed-local-staff.mjs` crea una identidad Auth local con el Admin API y añade su perfil `staff` con nombre `Staff de prueba`, asociado a ese daycare. El script solo acepta `LOCAL_SUPABASE_URL` con host `localhost` o `127.0.0.1`, y toma `LOCAL_SUPABASE_SERVICE_ROLE_KEY`, `LOCAL_STAFF_EMAIL` y `LOCAL_STAFF_PASSWORD` del entorno. No guarda ni imprime credenciales. El perfil se comprueba como administrador; no se prueba lectura por la API autenticada porque RLS queda sin políticas.

## Plan de implementación

1. Comprobar que el repositorio sigue usando migraciones imperativas, revisar la versión y los comandos disponibles de Supabase CLI, y examinar la estructura local y el historial remoto sin modificarlos.
2. Generar una migración con `supabase migration new create_users`; añadir los enums, `public.users`, restricciones, RLS y el trigger de `updated_at`. Confirmar que los nombres y dependencias coinciden con `public.daycares` y `auth.users`.
3. Añadir el fixture local: insertar idempotentemente el daycare en `supabase/seed.sql` y crear `scripts/seed-local-staff.mjs` para aprovisionar la identidad Auth y el perfil usando solo credenciales locales no versionadas. El script debe rechazar cualquier URL no local.
4. Aplicar y validar las migraciones y el seed SQL localmente; ejecutar el script de aprovisionamiento y comprobar el login Auth, el rol `staff`, el daycare asociado, RLS habilitado y cero políticas. Confirmar que antes del seed la migración no inserta filas.
5. Aplicar únicamente la migración de esquema al proyecto remoto con `supabase db push --remote` después de reconciliar el historial; no ejecutar ni aplicar el fixture local en remoto. Verificar el esquema y la versión aplicada. Si el historial no puede reconciliarse fielmente, detenerse sin aplicar cambios remotos e informar el bloqueo.

## Criterios de aceptación

- [ ] Existe una migración generada por `supabase migration new` que añade únicamente los enums, la función/trigger de `updated_at` y `public.users` definidos en esta especificación; la migración no inserta datos.
- [ ] `public.users.id` es PK UUID y FK a `auth.users(id)` con `ON DELETE CASCADE`.
- [ ] `daycare_id` es obligatorio y FK a `public.daycares(id)`; no existe una restricción que limite a un usuario por daycare.
- [ ] `user_role` contiene `staff`, `parent` y `admin`; `user_status` contiene `pending` y `active`.
- [ ] `status` tiene default `active`; `notify_on_post` y `daily_summary_enabled` tienen default `true`.
- [ ] `created_at` y `updated_at` son `timestamptz NOT NULL` con default `now()`; un UPDATE actualiza automáticamente `updated_at`.
- [ ] RLS está habilitado en `public.users` y no hay políticas definidas.
- [ ] La migración local pasa y `public.users` no contiene filas inmediatamente después de aplicarla y antes del fixture.
- [ ] `supabase/seed.sql` crea un único daycare local de prueba de forma repetible.
- [ ] `scripts/seed-local-staff.mjs` crea un usuario Auth local y su perfil `staff` asociado al daycare; el inicio de sesión con las credenciales locales configuradas tiene éxito.
- [ ] El script rechaza hosts no locales y no contiene ni registra contraseñas o claves de servicio; obtiene `LOCAL_SUPABASE_URL`, `LOCAL_SUPABASE_SERVICE_ROLE_KEY`, `LOCAL_STAFF_EMAIL` y `LOCAL_STAFF_PASSWORD` del entorno.
- [ ] La migración remota aparece aplicada y el esquema remoto coincide, siempre que el historial se haya podido reconciliar sin alterar entradas anteriores; remoto no recibe el daycare ni el usuario de prueba.
- [ ] Si el historial remoto no puede reconciliarse fielmente, no se aplica ninguna migración remota y se informa el bloqueo.
- [ ] No se crean triggers sobre `auth.users`, políticas RLS, datos de prueba en remoto ni cambios en archivos de la aplicación.

## Decisiones

- **Sí:** crear ambos enums definidos por la referencia, porque son tipos requeridos por las columnas `role` y `status`.
- **Sí:** exigir `daycare_id`; cada perfil pertenece a exactamente un daycare. La FK no es única, por lo que el daycare puede tener varios usuarios.
- **Sí:** enlazar el UUID del perfil con `auth.users(id)` y borrar el perfil en cascada al borrar la cuenta Auth, según la referencia.
- **No:** crear el perfil desde metadatos de signup. El flujo de alta y la asignación confiable de rol/daycare se definirán aparte; los metadatos editables por el usuario no son una fuente segura de autorización.
- **Sí:** activar RLS sin políticas, denegando el acceso de API hasta que otra especificación defina autorización por rol y daycare.
- **Sí:** inicializar `updated_at` con `now()` y mantenerlo mediante un trigger; la columna está en el esquema de referencia y debe reflejar actualizaciones.
- **Sí:** añadir un usuario `staff` y un daycare de prueba únicamente en Supabase local para probar el login real, sin insertar cuentas demo ni datos de prueba en remoto.
- **Sí:** usar el Auth Admin API local para crear la identidad y asociar su perfil con un script local, sin insertar directamente en `auth.users` ni confiar en metadata editable.
- **Sí:** usar `supabase/seed.sql` y el script de aprovisionamiento como excepción explícita y limitada a fixtures locales a la regla general del repositorio que exige registrar DML en migraciones. Las migraciones siguen reservadas al esquema y son las únicas que se aplican en remoto.
- **No:** permitir que el usuario staff lea su perfil por API en esta especificación; RLS permanece sin políticas y se prueba el inicio de sesión, no autorización de datos.
- **No:** duplicar email o contraseña en `public.users`; Supabase Auth ya los administra.
- **Sí:** preservar el historial remoto existente y detener el despliegue si no puede reconciliarse, sin ejecutar reparaciones destructivas.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Una política ausente hace que los usuarios no puedan consultar ni modificar perfiles a través de la API. | Es una denegación deliberada hasta aprobar un modelo de autorización en otra especificación. |
| Un signup sin un flujo confiable que asigne `daycare_id` no puede crear un perfil válido. | El trigger de alta y el onboarding quedan fuera de alcance; una especificación posterior deberá definirlos antes de habilitar ese flujo. |
| El script de prueba podría apuntar accidentalmente a un proyecto remoto o exponer credenciales. | Rechazar URLs no locales y leer claves/contraseñas solo del entorno; no imprimirlas ni versionarlas. |
| El historial remoto puede diferir del local. | Revisarlo antes del push y detenerse si reconciliarlo requiere inventar, borrar o reparar versiones existentes. |

## Qué **no** incluye esta especificación

- Trigger de creación del perfil en `auth.users`, signup o invitaciones.
- Políticas RLS o permisos de API.
- Cuenta Auth de prueba o daycare de prueba en el proyecto remoto.
- Email y contraseña de usuarios reales, credenciales versionadas o cambios de aplicación.
- Reparación o sustitución de migraciones remotas existentes.
