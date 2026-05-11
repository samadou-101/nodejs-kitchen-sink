# AGENTS.md

## Commands

- `pnpm dev` - Start dev server (tsx watch on `src/server.ts`)
- `npx prisma generate` - Regenerate Prisma client (outputs to `src/generated/prisma`)
- `npx prisma db push` - Push schema changes to database

## Environment

Required in `.env`:
- `DB_URL_NEON` - PostgreSQL connection (Neon)
- `REDIS_URL` - Redis connection
- `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET` - JWT secrets

## Architecture

- **Entry point**: `src/server.ts` → `src/app.ts`
- **Routes**: `/api/auth/*` (auth), `/api/ecom/*` (ecommerce)
- **DB client**: Use `@db` alias (`src/lib/prisma.ts`) - not the generated client directly
- **Prisma**: Generated to `src/generated/prisma`; regenerate after schema changes
- **Path aliases**: `@/*` → `src/*`, `@db` → `src/lib/prisma.ts`, `@config` → `src/config`

## Code Patterns

- Zod for request validation (see `src/modules/ecom/validation/`)
- RBAC authorization in `src/modules/ecom/auth/`
- Session auth via cookies, tokens stored in Redis

## Notes

- Uses `tsx` for development (not ts-node)
- `prisma.config.ts` requires `DB_URL_NEON` env var at runtime
- Generated Prisma types in `src/generated/prisma/models/`