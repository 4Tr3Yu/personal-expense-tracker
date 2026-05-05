# Personal Expense Tracker — Backend

Cloud sync API for the [Personal Expense Tracker](../) (PET) frontend. Stores
encrypted snapshots of each user's local data so they can back up and restore
across devices.

> This folder is **planning documentation** for a backend that will live in its
> own repository. Move these files to that repo when it's created. There is no
> Python source yet — the FE app remains fully functional as a local-only app
> regardless of when (or whether) the backend ships.

## What this service does

- Authenticates users via **Supabase Auth** (JWT, verified server-side).
- Stores **one snapshot per user**: the entire `AppData` blob the FE already
  knows how to encode and import.
- Lets the FE **`PUT`** a new snapshot ("back up now") and **`GET`** the latest
  snapshot ("restore from cloud").
- Detects conflicts via an opaque `version` token so the FE can route through
  its existing merge/replace UI when the cloud copy is newer than local.

It is **deliberately not** a per-row sync engine. The FE is local-first; cloud
is a backup destination, not the source of truth.

## Architecture at a glance

```
┌─────────────────┐    JWT (Supabase)    ┌──────────────────┐
│  Next.js FE     │ ───────────────────▶ │  FastAPI         │
│ (localStorage)  │   GET /me/snapshot   │  - JWT verify    │
│                 │   PUT /me/snapshot   │  - 1 row / user  │
└─────────────────┘                      └────────┬─────────┘
                                                  │
                                          ┌───────▼────────┐
                                          │  PostgreSQL    │
                                          │  snapshots     │
                                          └────────────────┘
```

Auth is fully delegated: Supabase issues JWTs, this service verifies them
against the project's JWKS endpoint and trusts the `sub` claim as the user id.
No password handling here.

## Stack and why

| Choice | Why |
|---|---|
| **Python 3.12** | Modern syntax, well-supported by FastAPI/SQLModel. |
| **FastAPI** | Async-friendly, Pydantic-native, great docs autogeneration. |
| **Pydantic v2** | Schema validation for request/response bodies. |
| **SQLModel** | Pydantic + SQLAlchemy 2.0 in one — gentlest ORM for newcomers. |
| **Alembic** | DB schema migrations (the standard for SQLAlchemy). |
| **PyJWT + cryptography** | Verify Supabase JWTs against their JWKS. No call-out to Supabase per request. |
| **uv** | Modern, fast Python project + dep manager (replaces pip + venv). |
| **Ruff** | Single-tool linting + formatting (replaces black + isort + flake8). |
| **pytest + httpx** | Standard test stack; FastAPI ships an `httpx`-based test client. |
| **PostgreSQL 16** | The de-facto Postgres. JSONB column holds the snapshot payload. |

## Prerequisites

- Python 3.12+ (`brew install python@3.12` on macOS)
- [`uv`](https://docs.astral.sh/uv/) (`brew install uv`)
- Postgres 16 — easiest via Docker, see local dev below
- A Supabase project with email auth enabled (free tier is fine)

## Local development

```bash
# install deps
uv sync

# bring up local Postgres
docker compose up -d db

# copy env template and fill in Supabase project ref + DB url
cp .env.example .env

# run migrations
uv run alembic upgrade head

# run the dev server with auto-reload
uv run fastapi dev app/main.py
```

`http://localhost:8000/docs` shows the auto-generated OpenAPI UI.

### Required env vars

| Var | What |
|---|---|
| `DATABASE_URL` | `postgresql+psycopg://user:pw@localhost:5432/pet` |
| `SUPABASE_PROJECT_URL` | e.g. `https://abcdefgh.supabase.co` |
| `SUPABASE_JWKS_URL` | `${SUPABASE_PROJECT_URL}/auth/v1/.well-known/jwks.json` |
| `SUPABASE_JWT_AUDIENCE` | `authenticated` (default Supabase audience) |
| `MAX_SNAPSHOT_BYTES` | e.g. `1048576` (1 MiB cap) |
| `SENTRY_DSN` | optional, omit to disable |

## API surface (v1)

All endpoints require `Authorization: Bearer <supabase-jwt>` except `/healthz`.

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/healthz` | Liveness probe. Pings DB. |
| `GET`  | `/v1/me` | Echo the authenticated user's id and email. |
| `GET`  | `/v1/me/snapshot` | Return the user's latest snapshot + `version` ETag, or 404. |
| `PUT`  | `/v1/me/snapshot` | Replace the user's snapshot. Honors `If-Match: <version>` for conflict detection (412 on mismatch). |

Snapshot payload is the FE's `AppData` JSON, validated only for size and basic
shape (`expenses`, `incomes`, `categories`, `settings`, `lastModified` keys
present). The server treats the body as opaque user data otherwise — schema
evolution is owned by the FE.

## Project layout

```
app/
  main.py              # FastAPI app + route includes
  config.py            # Settings (Pydantic BaseSettings, reads .env)
  db.py                # Engine, session dependency
  auth.py              # JWT verification dependency
  models.py            # SQLModel tables
  schemas.py           # Pydantic request/response models
  routes/
    health.py
    me.py
    snapshot.py
alembic/
  versions/            # migration files
tests/
  conftest.py          # pytest fixtures (test client, db override)
  test_health.py
  test_auth.py
  test_snapshot.py
docker-compose.yml     # local Postgres
.env.example
pyproject.toml         # uv-managed deps + tool config
README.md
```

## Deployment

Two paths documented; pick one.

### Path A — AWS or GCP free tier (preferred per project owner)

**GCP (recommended of the two):**
- App: **Cloud Run** (always-free tier covers ~2M requests/month — generous for
  a personal app).
- DB: **Cloud SQL for Postgres** has *no* always-free tier; smallest tier is
  ~$10/mo. As a free alternative, run Postgres on a GCE `e2-micro`
  always-free VM, accepting the ops burden (backups, upgrades).

**AWS:**
- App: **App Runner** (no free tier, ~$5/mo idle) or **Lightsail Containers**
  ($7/mo).
- DB: **RDS Postgres `db.t4g.micro`** is free for 12 months only; afterward
  ~$13/mo.

> **Note on Fly.io + Neon (alternative path).** Fly.io's free allowances
> (3 shared-cpu VMs) cover the API at $0/month; **Neon** is serverless
> Postgres with a real always-free tier (0.5 GB storage, scales to zero).
> Together they're materially cheaper than AWS or GCP for a single-user app
> *and* avoid managing a VM. Worth revisiting if free tiers expire or costs
> creep up.

A `Dockerfile` (Python slim base, multi-stage with `uv`) builds a single image
that runs anywhere. See `PLAN.md` Phase 5 and the deploy issues for the
runbook.

### Path B — Self-hosted / VPS

Standard `uv sync && uvicorn app.main:app` behind nginx + Let's Encrypt. Out of
scope for v1.

## Conventions

- **Branching**: short-lived branches off `main`, PR review even when solo (it
  forces a re-read).
- **Commits**: imperative subject ≤ 70 chars, body explains *why*.
- **Tests**: every endpoint gets at least one happy-path + one error-path test.
- **Migrations**: every schema change ships with an Alembic migration.
- **No secrets in the repo**: `.env` is gitignored, `.env.example` is checked in.

## Out of scope for v1

- Per-row sync / real-time multi-tab sync.
- Sharing data between users.
- E2E encryption of snapshots (server sees plaintext JSON for now).
- Webhooks, exports, scheduled reports.
- Admin UI.
