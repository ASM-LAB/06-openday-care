<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Repository notes

- This is an npm project; app routes and the root layout are in `app/` (`app/page.tsx`, `app/layout.tsx`).
- For current framework documentation, use Context7; installed version-specific guides are under `node_modules/next/dist/docs/`.
- `next.config.ts` enables Cache Components and partial prefetching; account for those settings when changing rendering or navigation behavior.
- Use `npm run dev` to develop, `npm run lint` for ESLint, and `npm run build` for a production build. Lint currently reports legacy errors in `references/pantallas/support.js`. There is no test script; run `npx tsc --noEmit` for a standalone typecheck.
- Put Playwright screenshots and related artifacts in `.playwright-mcp/` (ignored by Git).

## Specs Driven Development - Skills
- @spec skill para definir especificaciones
- @spec-impl skill para implantar especificaciones
- `spec-verifier` (`.opencode/agents/spec-verifier.md`) para verificar los criterios de aceptación, corregir incumplimientos dentro del alcance y actualizar las casillas con evidencia.
- Cualquier archivo de especificación relacionado con la base de datos debe crearse y mantenerse en `spec/database/`.

## Supabase y Postgres - Skills
- Las skills de proyecto instaladas (registradas en `skills-lock.json`) son `supabase` y `supabase-postgres-best-practices`.
- Usa `supabase` para cualquier tarea de Supabase: Database, Auth, Storage, Edge Functions, Realtime, Supabase CLI/MCP, clientes, seguridad o diagnóstico. Antes de implementar, consulta la documentación vigente de Supabase y revisa el changelog para cambios incompatibles; verifica los cambios con una prueba pertinente.
- Antes de cambiar el esquema, inspecciona primero las tablas existentes y determina si el proyecto usa esquemas declarativos (`supabase/schemas/` o `schema_paths`) o migraciones imperativas. Prefiere desarrollo y pruebas locales; trata las operaciones MCP remotas como cambios directos al proyecto. Consulta `--help` antes de usar comandos de la CLI.
- Seguridad: activa RLS en tablas de esquemas expuestos y define políticas según el modelo real de acceso; no expongas claves `service_role`/secretas al cliente ni uses `user_metadata` para autorización. Revisa también permisos de Data API, vistas, funciones privilegiadas y Storage cuando correspondan.
- Usa `supabase-postgres-best-practices` antes de escribir o cambiar SQL, esquemas, columnas, migraciones, políticas RLS, índices, funciones, triggers u otros objetos de Postgres, y al diagnosticar rendimiento, bloqueos o acceso indebido. Consulta sus reglas específicas para el caso.
- `../07-DB-Schema` es solo una referencia del esquema previsto; no implica que esas tablas estén implementadas en este proyecto.

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
