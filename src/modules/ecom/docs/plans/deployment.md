# Deployment Plan — From Local Dev to Production

> Written for someone new to deploying Node.js applications. Covers containerization,
> environment management, database migrations, CI/CD, and production configuration
> for the ecom module's backend.

---

## 1. Current State

| Aspect | Status | What's missing |
|--------|--------|---------------|
| **Build script** | No `build` script exists — only `pnpm dev` (tsx watch) | Production start command, compiled output |
| **Docker** | No Dockerfile, no docker-compose | Containerization for reproducible deploys |
| **CI/CD** | No pipeline | GitHub Actions for test → build → deploy |
| **Env management** | No `.env.example`, no docs for required vars | Developer onboarding, production config |
| **Prisma migrations** | Using `db push` in dev | Migration files exist at `prisma/migrations/`  (checked), need `migrate deploy` |
| **Node version** | No `.nvmrc` or `.node-version` | Pinned runtime version |
| **Prod start** | Only `pnpm dev` is available | Need `pnpm start:prod` |

### The two deployment approaches for this project

| Approach | How it runs | Best for |
|----------|------------|----------|
| **tsx in production** | `tsx src/server.ts` — same as dev, no compile step | Small apps, minimal setup, quick deploys |
| **Compile + node** | `tsc` → `node dist/server.js` | Larger apps, stricter startup perf, stricter isolation |

This doc covers **both**, with a recommendation for the **compiled approach** for production and `tsx` for preview/staging environments.

---

## 2. Environment Configuration

### Required environment variables

| Variable | Where it's used | Example value |
|----------|----------------|---------------|
| `DB_URL_NEON` | Prisma datasource (Neon PostgreSQL) | `postgresql://user:pass@host/db?sslmode=require` |
| `REDIS_URL` | Redis client connection | `redis://localhost:6379` |
| `ACCESS_TOKEN_SECRET` | JWT signing (access token) | 32+ char random string |
| `REFRESH_TOKEN_SECRET` | JWT signing (refresh token) | 32+ char random string |
| `COOKIE_SECRET` | Signed cookies (from security plan) | 32+ char random string |
| `CORS_ORIGIN` | Allowed CORS origin | `https://myapp.com` |
| `LOG_LEVEL` | Pino log level (from logging plan) | `info` (debug in dev) |
| `SENTRY_DSN` | Sentry error tracking (from observability plan) | `https://key@sentry.io/project` |
| `NODE_ENV` | Environment name | `production`, `staging`, `development` |
| `PORT` | HTTP listen port | `3000` |

### Create `.env.example`

```bash
# .env.example — copy to .env and fill in values

# Database
DB_URL_NEON=postgresql://user:pass@host:5432/db?sslmode=require

# Cache
REDIS_URL=redis://localhost:6379

# Auth secrets (generate with: openssl rand -hex 32)
ACCESS_TOKEN_SECRET=change-me-to-a-random-string
REFRESH_TOKEN_SECRET=change-me-to-a-random-string
COOKIE_SECRET=change-me-to-a-random-string

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info

# Observability (optional — leave blank to disable)
SENTRY_DSN=

# Runtime
NODE_ENV=production
PORT=3000
```

### Pin Node.js version

```bash
# .nvmrc
22
```

This tells `nvm`, `fnm`, and Docker which Node version to use. Node 22 is the current LTS.

---

## 3. Docker — Multi-Stage Production Build

### Dockerfile

```dockerfile
# ---- Build stage ----
FROM node:22-alpine AS build

WORKDIR /app

# Copy package manager files
COPY package.json pnpm-lock.yaml ./
COPY prisma/ ./prisma/
COPY prisma.config.ts ./

# Install all dependencies (including devDependencies for tsc)
RUN corepack enable && corepack prepare pnpm@10 --activate
RUN pnpm install --frozen-lockfile

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Generate Prisma client and compile
RUN npx prisma generate
RUN pnpm exec tsc --noEmit false

# ---- Production stage ----
FROM node:22-alpine AS production

WORKDIR /app

# Copy package manager files
COPY package.json pnpm-lock.yaml ./
COPY prisma/ ./prisma/
COPY prisma.config.ts ./

# Install only production dependencies
RUN corepack enable && corepack prepare pnpm@10 --activate
RUN pnpm install --frozen-lockfile --prod

# Copy compiled output from build stage
COPY --from=build /app/dist ./dist

# Generate Prisma client (needs @prisma/client which is in prod deps)
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Run compiled app
CMD ["node", "dist/src/server.js"]
```

### .dockerignore

```
node_modules
dist
.git
.gitignore
.env
.env.*
*.md
.vscode
.VSCodeCounter
src/modules/ecom/docs
```

### Build and run

```bash
# Build image
docker build -t kitchen-sink-api .

# Run with env vars
docker run -p 3000:3000 \
  -e DB_URL_NEON=postgresql://... \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  -e ACCESS_TOKEN_SECRET=... \
  -e REFRESH_TOKEN_SECRET=... \
  -e COOKIE_SECRET=... \
  -e CORS_ORIGIN=http://localhost:5173 \
  -e NODE_ENV=production \
  kitchen-sink-api
```

---

## 4. Docker Compose — Local Preview + Staging

For local development against production-like infrastructure, or for a staging environment:

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: kitchensink
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      DB_URL_NEON: postgresql://app:app@postgres:5432/kitchensink?sslmode=disable
      REDIS_URL: redis://redis:6379
      ACCESS_TOKEN_SECRET: dev-access-token-secret
      REFRESH_TOKEN_SECRET: dev-refresh-token-secret
      COOKIE_SECRET: dev-cookie-secret
      CORS_ORIGIN: http://localhost:5173
      NODE_ENV: staging
      LOG_LEVEL: debug
      PORT: 3000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

volumes:
  pgdata:
```

### Run migration on startup

Add an entrypoint script to run migrations before the app starts:

```dockerfile
# In Dockerfile, or as a separate init container

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/src/server.js"]
```

```bash
#!/bin/sh
# docker-entrypoint.sh — runs migrations, then starts the app
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting application..."
exec "$@"
```

### Using docker compose

```bash
# Start everything
docker compose up -d

# View logs
docker compose logs -f api

# Run migrations manually
docker compose exec api npx prisma migrate deploy

# Stop everything
docker compose down
```

---

## 5. Build & Production Start Scripts

Add these to `package.json`:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "check": "pnpm exec tsc --noEmit",
    "build": "tsc --noEmit false",
    "start": "node dist/src/server.js",
    "start:dev": "tsx src/server.ts",
    "db:generate": "npx prisma generate",
    "db:migrate": "npx prisma migrate deploy",
    "db:push": "npx prisma db push",
    "db:studio": "npx prisma studio",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "docker:build": "docker build -t kitchen-sink-api .",
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down"
  }
}
```

### Why `tsc --noEmit false`?

The current `tsconfig.json` doesn't have `noEmit`, so `pnpm exec tsc` already compiles by default. The `--noEmit false` flag ensures it emits even if a developer accidentally set `noEmit: true` in their local config. Alternatively, use a dedicated `tsconfig.build.json`:

```json
// tsconfig.build.json
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*"],
  "exclude": ["src/**/*.test.ts", "src/**/*.spec.ts", "src/modules/ecom/docs/**"]
}
```

Then `"build": "tsc --project tsconfig.build.json"`.

### Production start

```bash
# 1. Build
pnpm build

# 2. Run migrations
pnpm db:migrate

# 3. Start
NODE_ENV=production pnpm start
```

Or with a process manager (optional — Docker handles this):

```bash
# Install pm2 globally or as a dependency
pnpm add -D pm2

# ecosystem.config.cjs
module.exports = {
  apps: [{
    name: "kitchen-sink",
    script: "dist/src/server.js",
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "production",
    },
  }],
}

# Start
pnpm exec pm2 start ecosystem.config.cjs
```

**Recommendation:** Skip pm2 and use Docker's restart policies instead. Docker handles process management better than pm2 in containerized environments.

---

## 6. Prisma Migrations Strategy

### Current state vs production state

| | Dev | Production |
|--|-----|-----------|
| **Schema changes** | `prisma db push` | `prisma migrate deploy` |
| **Migration files** | Not created automatically | Created via `prisma migrate dev`, checked into git |
| **Rollback** | Not needed (push is idempotent) | `prisma migrate resolve` or manual SQL |

### The migration workflow

```bash
# 1. Developer makes schema changes
# 2. Developer creates a migration
npx prisma migrate dev --name add-order-status-enum

# 3. Migration file is generated and checked into git
git add prisma/migrations/
git commit -m "feat: add order status enum migration"

# 4. CI/CD runs migrations on deploy
npx prisma migrate deploy

# 5. If migration fails, roll back (manual SQL in Neon console)
```

### CI/CD migration step

```yaml
# In GitHub Actions (see Section 9)
- name: Run database migrations
  run: npx prisma migrate deploy
  env:
    DB_URL_NEON: ${{ secrets.DB_URL_NEON }}
```

### Migration safety

- **Always** take a database snapshot before deploying migrations in production
- **Always** run `prisma migrate deploy` (not `prisma db push`) in production
- **Never** edit migration files that have already been applied
- **Test** migrations against a staging database first

---

## 7. Disks & Storage

This application is **stateless** — it stores nothing on the filesystem at runtime:

| Data | Where it lives | Persistence |
|------|---------------|-------------|
| **Orders, products, users** | Neon PostgreSQL (managed) | External — survives container restart |
| **Sessions, cache** | Redis (managed or container) | Ephemeral — can be lost on restart without persistence |
| **Logs** | stdout (captured by Docker/cloud provider) | Not stored on disk |
| **Generated Prisma client** | Included in Docker image | Read-only at runtime |

### If self-hosting Redis

```yaml
# docker-compose.yml — add persistent volume
services:
  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

volumes:
  redis-data:
```

---

## 8. Deployment Targets

### Option A — Single-host VPS (DigitalOcean, Hetzner, Linode)

**Stack:** Docker Compose with Postgres + Redis + API on one VM

| Pros | Cons |
|------|------|
| Full control, cheap (~$12-24/mo) | You manage OS updates, backups, SSL |
| Simple architecture | Scaling requires manual work |

**Setup:**

```bash
# SSH into VM
ssh root@your-vm-ip

# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone repo
git clone https://github.com/your-org/kitchen-sink.git
cd kitchen-sink

# Copy env file
cp .env.example .env
nano .env  # fill in secrets

# Start everything
docker compose up -d

# Set up SSL (Caddy)
docker run -d -p 80:80 -p 443:443 \
  -v caddy-data:/data \
  caddy:2 \
  caddy reverse-proxy --from api.yourdomain.com --to host.docker.internal:3000
```

### Option B — Platform-as-a-Service (Render, Railway, Fly.io)

**Stack:** Managed Postgres + Managed Redis + Docker deploy

| Pros | Cons |
|------|------|
| Zero server management | More expensive at scale |
| Built-in SSL, monitoring | Less control over infra |
| Automatic deploys from git | Vendor lock-in |

**Railway example:**

```bash
# 1. Push to GitHub
# 2. Create project on Railway
# 3. Add Postgres plugin → get connection string
# 4. Add Redis plugin → get connection string
# 5. Set env vars in dashboard
# 6. Set start command: node dist/src/server.js
# 7. Add build command: pnpm install && npx prisma generate && pnpm build
# 8. Deploy — Railway auto-detects Dockerfile or uses build/start commands
```

**Fly.io example:**

```toml
# fly.toml
app = "kitchen-sink"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  LOG_LEVEL = "info"
  PORT = "3000"

[[services]]
  port = 3000
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls"]
```

### Option C — Kubernetes (for teams that already use K8s)

**Stack:** K8s cluster + Helm chart or raw manifests

Overkill for a single-backend app unless you're already running K8s. If you are:

```yaml
# deployment.yaml (minimal)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kitchen-sink-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: kitchen-sink
  template:
    metadata:
      labels:
        app: kitchen-sink
    spec:
      containers:
      - name: api
        image: your-registry/kitchen-sink:latest
        ports:
        - containerPort: 3000
        envFrom:
        - secretRef:
            name: app-secrets
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
```

---

## 9. CI/CD Pipeline (GitHub Actions)

### workflow: test-build-deploy

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: "22"
  PNPM_VERSION: "10"

jobs:
  test:
    name: Type check & Test
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 5s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 5s
          --health-timeout 3s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: npx prisma generate

      - run: pnpm check

      - run: pnpm test
        env:
          DB_URL_NEON: postgresql://test:test@localhost:5432/test?sslmode=disable
          REDIS_URL: redis://localhost:6379

  build:
    name: Build Docker image
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to container registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:latest
            ghcr.io/${{ github.repository }}:${{ github.sha }}

  deploy:
    name: Deploy to production
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to Railway
        run: |
          curl -X POST https://backboard.railway.app/graphql/v2 \
            -H "Authorization: Bearer ${{ secrets.RAILWAY_TOKEN }}" \
            -H "Content-Type: application/json" \
            --data '{
              "query": "mutation { deploymentCreate(input: { projectId: \"${{ secrets.RAILWAY_PROJECT_ID }}\" }) { id } }"
            }'
```

### What this pipeline does

| Job | Trigger | What it runs |
|-----|---------|-------------|
| **test** | Every push + PR | TypeScript type check + Vitest (unit + integration) |
| **build** | Push to main only | Docker build + push to GitHub Container Registry |
| **deploy** | Push to main only | Trigger deploy on Railway (or SSH deploy, or kubectl apply) |

### Secrets to configure in GitHub

| Secret | Value |
|--------|-------|
| `DB_URL_NEON` | Production database URL |
| `REDIS_URL` | Production Redis URL |
| `RAILWAY_TOKEN` | Railway deploy token (if using Railway) |
| `RAILWAY_PROJECT_ID` | Railway project ID |

---

## 10. Production Checklist

### Before going live

- [ ] `.env.example` created and checked into git
- [ ] `.nvmrc` created with Node 22
- [ ] Dockerfile created and builds successfully
- [ ] docker-compose.yml created for local/staging
- [ ] Prisma migrations committed to git (`prisma/migrations/`)
- [ ] Migration tested against a staging database
- [ ] Build script added to `package.json`
- [ ] Production start script added to `package.json`
- [ ] GitHub Actions CI configured
- [ ] Database created on Neon (or managed Postgres provider)
- [ ] Redis instance created (Upstash, Redis Cloud, or self-hosted)
- [ ] `SENTRY_DSN` configured (from observability plan)
- [ ] `COOKIE_SECRET`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` generated
- [ ] SSL/TLS configured (if not using a platform with automatic SSL)
- [ ] Health endpoint tested (`/api/health` + `/api/ready`)
- [ ] Rate limiting configured (from security plan)
- [ ] Cookie security flags configured (`httpOnly`, `secure`, `sameSite`)

### First deployment runbook

```bash
# 1. Push to main (triggers CI)

# 2. CI runs tests → builds image → deploys

# 3. Verify deployment
curl https://api.yourdomain.com/api/health
# → {"status":"ok","uptime":42.0}

curl https://api.yourdomain.com/api/ready
# → {"status":"ok","checks":{"database":"ok","redis":"ok"}}

# 4. Run a quick smoke test
curl -X POST https://api.yourdomain.com/api/ecom/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"test1234"}'
# → {"success":true,"data":{...}}

# 5. Check Sentry dashboard
# → No errors reported

# 6. Check logs
docker logs -f kitchen-sink-api-1
# → Structured JSON log lines, no errors
```

### Rollback procedure

```bash
# If the deploy is broken:

# Option A — Revert the git commit and push
git revert HEAD
git push origin main
# CI will build and deploy the previous version

# Option B — Roll back Docker image
docker compose down
docker compose -f docker-compose.yml up -d  # previous stable image

# Option C — Database rollback (if migration caused the issue)
npx prisma migrate resolve --rolled-back "migration_name"
# Then manually restore from backup
```

---

## 11. Monitoring After Deployment

Once deployed, you should check these regularly:

| What | How | Frequency |
|------|-----|-----------|
| **Error rate** | Sentry dashboard | Daily |
| **Response times** | Sentry performance | Weekly |
| **Disk usage** | Docker / cloud provider | Monthly |
| **Migration health** | Prisma Studio or SQL client | After each deploy |
| **Log volume** | Log aggregation (if configured) | Monthly |

### The first week in production

| Day | Check |
|-----|-------|
| **Day 1** | Deploy, run smoke tests, confirm Sentry receives events |
| **Day 2** | Check error rate is 0%, check latency p95 < 500ms |
| **Day 3** | Verify rate limiting is working (test with curl --rate) |
| **Day 4** | Confirm health checks pass on the orchestrator dashboard |
| **Day 7** | Review first week of logs — any patterns? Any silent failures? |

---

## 12. Additional Resources

- [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Compose documentation](https://docs.docker.com/compose/)
- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Prisma migration documentation](https://www.prisma.io/docs/orm/prisma-migrate)
- [Neon serverless PostgreSQL](https://neon.tech/docs)
- [Railway Node.js deployment](https://docs.railway.app/guides/nodejs)
- [Fly.io Docker deployment](https://fly.io/docs/languages-and-frameworks/dockerfile/)
- [Render Node.js deployment](https://render.com/docs/deploy-node-express-app)

---

*Start with the Dockerfile + docker-compose.yml for local reproducibility. Add CI/CD after you've verified the Docker build works locally.*
