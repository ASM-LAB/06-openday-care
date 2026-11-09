# SPEC 09 — Autenticación con Supabase

> **Estado:** Aprobado
> **Depende de:** SPEC 03, SPEC 07
> **Fecha:** 2026-11-09
> **Objetivo:** Implementar inicio y cierre de sesión con email y contraseña mediante Supabase Auth y proteger las rutas de la aplicación con sesiones verificadas en el servidor.

## Alcance

**Incluye:**

- Sustituir el inicio de sesión simulado de `/login` por autenticación real de Supabase Auth con email y contraseña.
- Mantener el diseño actual del login y dejar el campo de email vacío inicialmente, sin credenciales de ejemplo precargadas.
- Permitir iniciar sesión únicamente a cuentas creadas previamente en Supabase; no habilitar registro público.
- Mostrar estados de envío, validación accesible y un mensaje genérico para credenciales rechazadas, sin revelar si el email tiene una cuenta. Mostrar un mensaje accesible distinto ante fallos operativos.
- Tras el login, volver a la ruta interna protegida solicitada originalmente o a `/` si no hay una ruta de retorno válida.
- Exigir una sesión de Supabase para `/`, `/kids` y todas sus subrutas. Mantener `/login` y `/activar-cuenta` públicas.
- Implementar cierre de sesión real en los controles actuales de Feed y Kids, redirigiendo a `/login` al cerrar correctamente y mostrando un error accesible si falla.
- Mostrar en las barras laterales el email de la sesión actual y una etiqueta de rol neutra; no mostrar la identidad ficticia fija de Caro Giménez.
- Mantener `/activar-cuenta` como pantalla pública simulada, sin crear cuentas ni procesar invitaciones reales.
- Configurar el cliente SSR de Supabase con cookies usando las dependencias ya instaladas `@supabase/ssr` y `@supabase/supabase-js`, sin usar una clave `service_role` en la aplicación.
- Definir `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` como variables requeridas, con nombres de ejemplo sin secretos en `.env.example`.
- Refrescar la sesión en `proxy.ts` y verificar al usuario de forma autoritativa en el servidor antes de renderizar las páginas protegidas.

**Fuera de alcance (para futuras especificaciones):**

- Registro público, alta de usuarios, invitaciones reales o activación de cuenta funcional.
- Recuperación o cambio de contraseña; «¿Olvidaste tu contraseña?» permanece sin acción.
- Consultar `public.users`, mostrar el nombre de perfil o autorizar por estado, rol o guardería.
- Cambios de esquema, políticas RLS, permisos de tablas, migraciones o aprovisionamiento de usuarios en Supabase.
- Conectar el contenido estático de Feed o Kids a la base de datos.
- Autorización de APIs o de datos futuros, más allá de la autenticación de las páginas actuales.

## Modelo de datos

Esta especificación no crea ni modifica estructuras de base de datos. Supabase Auth administra el email, la contraseña y la sesión. La aplicación usa la identidad autenticada obtenida del servidor para mostrar el email; no consulta `public.users` ni usa metadatos editables para conceder permisos.

La sesión se mantiene mediante las cookies SSR administradas por `@supabase/ssr`; no se copia el token a `localStorage` ni se guarda ninguna contraseña en la aplicación.

## Plan de implementación

1. Revisar las guías locales de Next.js 16 y la documentación vigente de Supabase SSR; añadir `.env.example` y `lib/supabase/server.ts` para crear el cliente de servidor basado en cookies y las variables de entorno acordadas. Verificar que la aplicación informa claramente si falta configuración y que no contiene claves secretas.
2. Añadir la acción de servidor y el formulario de login conectado a `supabase.auth.signInWithPassword`; mantener el diseño de `app/login/page.tsx`, implementar estados accesibles y redirección únicamente a rutas internas válidas, con `/` como destino alternativo.
3. Añadir `proxy.ts` para refrescar cookies de sesión y redirigir solicitudes no autenticadas; crear `lib/supabase/require-auth.ts` con verificación autoritativa mediante `getUser()` y aplicarla a `app/page.tsx`, `app/kids/page.tsx`, `app/kids/[id]/page.tsx` y `app/kids/agregar/page.tsx`.
4. Implementar la acción de cierre de sesión y conectar los controles de `app/page.tsx` y `app/kids/KidsSidebar.tsx`; mostrar el email real de Auth y un rol neutro en ambas barras laterales, sin cambiar el contenido de `/activar-cuenta`.

## Criterios de aceptación

- [ ] El campo email de `/login` empieza vacío; la pantalla mantiene su distribución y estilos actuales.
- [ ] Un usuario existente de Supabase puede iniciar sesión con email y contraseña válidos.
- [ ] El envío muestra estado de progreso y no permite envíos duplicados; email y contraseña son obligatorios y los errores se anuncian de forma accesible.
- [ ] Un rechazo de credenciales muestra un mensaje genérico que no permite distinguir entre email inexistente y contraseña incorrecta; los fallos operativos muestran un mensaje accesible diferente.
- [ ] Al iniciar sesión se abre la ruta protegida interna solicitada originalmente, o `/` cuando no existe un destino válido; un destino externo no puede usarse como redirección.
- [ ] Sin sesión, abrir directamente `/`, `/kids`, `/kids/mateo-fernandez` o `/kids/agregar` redirige a `/login` y conserva el destino interno para después del login.
- [ ] `/login` y `/activar-cuenta` se pueden abrir sin sesión; `/activar-cuenta` no crea usuarios ni procesa invitaciones.
- [ ] Las páginas protegidas verifican el usuario con `getUser()` en el servidor; `proxy.ts` refresca las cookies y no es la única barrera de protección.
- [ ] El cierre de sesión desde Feed y Kids invalida la sesión de Supabase y redirige a `/login`; si falla, se muestra un error accesible y no se comunica un cierre exitoso.
- [ ] Las barras laterales muestran el email de la sesión autenticada y una etiqueta neutra, no «Caro Giménez · Maestra · Soles» como identidad fija.
- [ ] Las variables requeridas son `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; `.env.example` no contiene credenciales reales ni claves secretas.
- [ ] No se habilita registro, recuperación, activación real, lectura de `public.users` ni autorización por rol o guardería.
- [ ] `npx tsc --noEmit` y `npm run build` finalizan correctamente con la configuración de Supabase disponible.

## Decisiones

- **Sí:** usar `@supabase/ssr` y cookies para la sesión, porque el App Router necesita compartir y refrescar la sesión entre el navegador y el servidor.
- **Sí:** usar `proxy.ts` en Next.js 16 para refrescar cookies y aplicar redirecciones tempranas; la guía de autenticación de Next.js trata Proxy como una comprobación optimista, no como la única protección.
- **Sí:** comprobar cada página privada en el servidor con `getUser()`, que verifica al usuario contra Supabase Auth, en lugar de confiar en `getSession()` leído desde cookies.
- **Sí:** utilizar la clave publishable con la URL de Supabase; ninguna clave `service_role` o secreta se incorpora al bundle del cliente.
- **Sí:** permitir solo cuentas preaprovisionadas; el registro abierto requeriría definir cómo asociar de forma confiable cada cuenta a una guardería y un rol.
- **Sí:** proteger todas las rutas funcionales salvo `/login` y `/activar-cuenta`, y devolver al usuario al destino interno que pidió antes de autenticarse.
- **Sí:** mostrar el email de Auth con un rol neutro; esta especificación no consulta un perfil ni concede autorizaciones basadas en un rol.
- **No:** implementar una validación optimista de sesión como única barrera; cada página protegida efectúa además la comprobación del lado del servidor.
- **No:** modificar el esquema o las políticas RLS; las páginas actuales usan contenido estático y esta especificación no accede a tablas.
- **No:** habilitar recuperación de contraseña o activación real; son flujos distintos que requieren decisiones de correo y aprovisionamiento.
- **Referencia técnica:** documentación vigente consultada con Context7: [Supabase SSR en Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) y [autenticación en Next.js](https://nextjs.org/docs/app/guides/authentication).

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El email/contraseña se rechazan con el mismo tipo de respuesta que puede usarse para enumerar cuentas. | Usar un mensaje genérico para errores de credenciales y no distinguir si el email existe. |
| La sesión puede expirar o necesitar renovación durante una visita. | Refrescar cookies en `proxy.ts` y verificar al usuario en las páginas protegidas con `getUser()`. |
| La protección de páginas podría confundirse con autorización de datos. | No consultar tablas en este alcance; exigir políticas RLS y autorización del servidor en cualquier futura función que acceda a datos. |
| Las variables de Supabase pueden faltar en un entorno de despliegue. | Documentar los nombres requeridos en `.env.example` y mostrar un fallo de configuración explícito, sin simular un login exitoso. |

## Qué **no** incluye esta especificación

- Registro público, recuperación de contraseña, alta o activación real de cuentas e invitaciones.
- Perfiles, roles, asignación de guardería, políticas RLS o cambios de base de datos.
- Datos dinámicos de Feed o Kids, o autorización de APIs y datos futuros.
- Claves secretas de Supabase en el cliente o credenciales reales versionadas.
