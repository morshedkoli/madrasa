<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Next.js 16 Breaking Changes (applies to this project)
- **Middleware renamed to Proxy**: Use `src/proxy.ts` instead of `src/middleware.ts`, export `proxy` function
- **Async cookies/headers**: `cookies()` and `headers()` MUST be awaited
- **Async params/searchParams**: `params` and `searchParams` in pages/layouts MUST be awaited
- **Turbopack default**: No `--turbopack` flag needed; use `--webpack` to opt out
- **Node.js 20.9+ required**
- **`connection()` from `next/server`** replaces `unstable_noStore()`
- **`revalidateTag()` requires 2nd argument** (cache profile)
- **All parallel route slots need `default.js`**
- **Route handlers**: Use `RouteContext<'/path'>` type helper
<!-- END:nextjs-agent-rules -->

# Madrasha Management System
## Architecture
- Next.js 16 App Router with TypeScript
- Supabase Auth + PostgreSQL
- Three portals: Admin (`/admin`), Teacher (`/teacher`), Accountant (`/accounts`)
- Shared components in `src/components/shared/`
- UI components in `src/components/ui/`

## Build commands
- `npm run dev` - development server
- `npm run build` - production build
- `npm run lint` - linting (ESLint directly, as `next lint` was removed)

## Database
- Migration SQL in `supabase/migrations/00001_schema.sql`
- Run in Supabase SQL Editor
- Demo credentials configured in login page
