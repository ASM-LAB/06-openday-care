# OpenDayCare

Aplicación web construida con Next.js 16, React y TypeScript. La autenticación y los datos de la aplicación se conectan a un proyecto **remoto de Supabase**.

## Requisitos

- Node.js 22 o superior.
- npm.
- Acceso a las credenciales del proyecto de Supabase usado por el entorno.

## Preparar y levantar el proyecto

1. Instala las dependencias desde la raíz del repositorio:

   ```bash
   npm ci
   ```

2. Crea un archivo `.env.local` en la raíz y añade la URL y la clave publicable del proyecto de Supabase:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   Obtén ambos valores en el panel del proyecto de Supabase. No uses una clave `service_role` ni una clave secreta: las variables `NEXT_PUBLIC_` pueden incluirse en el código que recibe el navegador. `.env.local` está excluido de Git; no subas credenciales al repositorio.

3. Arranca el servidor de desarrollo:

   ```bash
   npm run dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000). Para detener el servidor, usa `Ctrl+C` en la terminal.

Si falta alguna variable de Supabase, la aplicación mostrará un error de configuración. Configura el entorno y vuelve a arrancar el servidor.

## Supabase

- La aplicación se conecta directamente al proyecto remoto indicado en `.env.local`; **no hace falta ni se debe levantar un stack local de Supabase** para ejecutar Next.js.
- La autenticación es por email y contraseña. Se debe usar una cuenta ya creada en Supabase Auth; la aplicación no ofrece registro público ni crea usuarios automáticamente.
- Para usar Kids, además de una cuenta de Auth se necesita un perfil activo con rol `staff` o `admin`, vinculado a una guardería y con las salas y datos requeridos en la base de datos.
- El esquema versionado está en `supabase/migrations/`. Tener esos archivos en el repositorio no aplica los cambios por sí solo. Si el proyecto remoto todavía no está preparado, coordina su configuración con quien administre Supabase antes de probar la aplicación.
- Para cambios de esquema, primero inspecciona el estado remoto y sigue el flujo del proyecto mediante Supabase MCP. No uses Supabase CLI para aplicar cambios al proyecto remoto, ni ejecutes `supabase start`, `supabase db reset` o los fixtures locales como si fueran configuración del entorno compartido. `scripts/seed-local-staff.mjs` es solo para un entorno local y rechaza URLs que no sean `localhost`.
- La clave publicable no sustituye las políticas de seguridad de la base de datos. No compartas claves secretas ni contraseñas; nunca las guardes en variables `NEXT_PUBLIC_`.

## Comandos útiles

```bash
npm run dev       # servidor de desarrollo
npm run build     # compilación de producción
npm start         # ejecutar la compilación de producción
npm run lint      # analizar el código con ESLint
npx tsc --noEmit  # comprobar tipos de TypeScript
```

Para probar una compilación de producción, configura también las variables de Supabase en el entorno y ejecuta `npm run build` seguido de `npm start`.
