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
