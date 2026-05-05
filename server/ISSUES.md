# GitHub issue drafts

Each section below is **one issue**, sized for a single solo evening (~2–3
hours unless noted). Copy each section's title into the GitHub issue title and
the body into the issue body. The "Labels" line is a hint for `gh issue create
--label`.

Recommended label set to create up front:
`backend`, `frontend`, `phase-0` … `phase-7`, `auth`, `db`, `infra`, `docs`,
`tests`.

If you use the GitHub CLI:

```bash
gh issue create --title "<title>" --body-file - <<'EOF'
<paste body>
EOF
```

---

## Phase 0 — Project bootstrap

### P0-1: Bootstrap Python project with uv, FastAPI, and Ruff

**Goal**

Stand up a minimal but production-shaped Python project so subsequent issues
have a real place to land code.

**Acceptance criteria**

- [ ] `uv init` produces `pyproject.toml`; deps include `fastapi`,
      `uvicorn[standard]`, `pydantic`, `pydantic-settings`.
- [ ] Dev deps: `ruff`, `pytest`, `httpx`.
- [ ] `app/main.py` exposes a FastAPI app with a single `GET /healthz`
      returning `{"ok": true}`.
- [ ] `ruff.toml` (or `[tool.ruff]` in pyproject) configured: 100-char line
      length, `E,F,I,W,B,UP` rule selection.
- [ ] `tests/test_health.py` hits `/healthz` via `httpx` test client and
      asserts 200 + body.
- [ ] `uv run fastapi dev app/main.py` works; `uv run pytest` passes.
- [ ] README "Local development" steps reproduce the above on a clean clone.

**Notes**

Use FastAPI's CLI (`fastapi dev`), not raw uvicorn — it gives auto-reload and
a nicer banner. Default port 8000.

**Estimate:** ~2h
**Labels:** `backend`, `phase-0`, `infra`

---

### P0-2: GitHub Actions CI for lint + tests

**Goal**

Every PR gets automated lint and test feedback before merge.

**Acceptance criteria**

- [ ] `.github/workflows/ci.yml` runs on `pull_request` and `push: main`.
- [ ] Job uses `astral-sh/setup-uv@v3` and Python 3.12.
- [ ] Steps: `uv sync --frozen`, `uv run ruff check`,
      `uv run ruff format --check`, `uv run pytest`.
- [ ] All checks pass on a clean repo.
- [ ] README links to the CI status badge.

**Estimate:** ~1h
**Depends on:** P0-1
**Labels:** `backend`, `phase-0`, `infra`

---

## Phase 1 — Database foundations

### P1-1: Local Postgres via docker-compose

**Goal**

One-command Postgres for local dev so contributors don't install it system-wide.

**Acceptance criteria**

- [ ] `docker-compose.yml` defines a `db` service: `postgres:16-alpine`,
      port 5432, volume for data persistence.
- [ ] Default credentials documented in `.env.example`
      (`postgres:postgres@localhost:5432/pet`).
- [ ] `docker compose up -d db` brings the DB up; `psql` from host can
      connect.
- [ ] README "Local development" updated.

**Estimate:** ~30min
**Labels:** `backend`, `phase-1`, `db`, `infra`

---

### P1-2: SQLModel engine + session dependency + Alembic baseline

**Goal**

Wire the app to Postgres and lock in the migration tool before any tables
exist.

**Acceptance criteria**

- [ ] Deps added: `sqlmodel`, `psycopg[binary]`, `alembic`.
- [ ] `app/db.py` exports `engine` and a `get_session` dependency.
- [ ] `app/config.py` reads `DATABASE_URL` via `pydantic-settings`.
- [ ] `alembic init alembic`; `env.py` configured to use SQLModel metadata
      and the `DATABASE_URL` setting.
- [ ] One empty baseline migration committed
      (`alembic revision -m "baseline"`).
- [ ] `uv run alembic upgrade head` succeeds against the local DB.

**Notes**

Use the `psycopg` (v3) dialect, not `psycopg2`. The connection URL prefix is
`postgresql+psycopg://`.

**Estimate:** ~2h
**Depends on:** P1-1
**Labels:** `backend`, `phase-1`, `db`

---

### P1-3: /healthz pings the database

**Goal**

A single endpoint that fails when the DB is unreachable, suitable for a
container readiness probe.

**Acceptance criteria**

- [ ] `GET /healthz` executes `SELECT 1` via the session dependency.
- [ ] On success returns `{"ok": true, "db": "ok"}`.
- [ ] On DB failure returns 503 with `{"ok": false, "db": "error"}`.
- [ ] Test covers both success and DB-down (mock the session) cases.

**Estimate:** ~45min
**Depends on:** P1-2
**Labels:** `backend`, `phase-1`, `db`, `tests`

---

## Phase 2 — Auth (Supabase JWT)

### P2-1: Document Supabase project setup

**Goal**

Capture the one-time clicks in Supabase a future-you (or a contributor) needs
to do before the BE will work.

**Acceptance criteria**

- [ ] README section "Supabase setup" lists: create project, enable email
      auth, copy project URL, copy JWKS URL, copy `JWT_SECRET` location for
      reference.
- [ ] `.env.example` updated with `SUPABASE_PROJECT_URL`,
      `SUPABASE_JWKS_URL`, `SUPABASE_JWT_AUDIENCE` (default `authenticated`).
- [ ] Note that the BE never needs the service-role key.

**Estimate:** ~30min
**Labels:** `backend`, `phase-2`, `auth`, `docs`

---

### P2-2: JWT verification dependency

**Goal**

A `Depends(...)` that resolves to the authenticated user id, or raises 401.

**Acceptance criteria**

- [ ] Deps added: `pyjwt[crypto]`, `httpx` (already present).
- [ ] `app/auth.py` exposes `current_user_id: str` dependency.
- [ ] JWKS fetched once per process (or cached with TTL) — not per request.
- [ ] Verifies `iss`, `aud`, signature, and expiry; raises
      `HTTPException(401)` otherwise.
- [ ] Returns the `sub` claim (Supabase user UUID) plus `email` if present.
- [ ] Tests using a self-signed JWT signed with a fixture key pair, JWKS
      mocked.

**Notes**

Don't call out to Supabase's `/auth/v1/user` endpoint per request — that adds
latency and a Supabase dependency in the hot path. Local JWT verification is
the standard pattern.

**Estimate:** ~2.5h
**Depends on:** P0-1
**Labels:** `backend`, `phase-2`, `auth`, `tests`

---

### P2-3: GET /v1/me protected endpoint

**Goal**

A simple authed endpoint to validate the JWT plumbing end-to-end.

**Acceptance criteria**

- [ ] `GET /v1/me` requires the auth dependency.
- [ ] Returns `{"id": "<uuid>", "email": "<email>"}` on success.
- [ ] Returns 401 with no/invalid token.
- [ ] Tests: valid, missing, expired, wrong-audience tokens.

**Estimate:** ~1h
**Depends on:** P2-2
**Labels:** `backend`, `phase-2`, `auth`, `tests`

---

## Phase 3 — Snapshot endpoints

### P3-1: snapshots table migration

**Goal**

Schema for one snapshot row per user.

**Acceptance criteria**

- [ ] New Alembic migration creates `snapshots`:
  - `user_id UUID PRIMARY KEY`
  - `payload JSONB NOT NULL`
  - `client_last_modified TIMESTAMPTZ NOT NULL`
  - `version BIGINT NOT NULL DEFAULT 1`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- [ ] SQLModel `Snapshot` model matches.
- [ ] `uv run alembic upgrade head` and `downgrade -1` both succeed.

**Estimate:** ~45min
**Depends on:** P1-2
**Labels:** `backend`, `phase-3`, `db`

---

### P3-2: Pydantic schemas + payload size guard

**Goal**

Define request/response shapes and reject snapshots that are obviously too big.

**Acceptance criteria**

- [ ] `app/schemas.py` defines `SnapshotIn` (payload, client_last_modified)
      and `SnapshotOut` (payload, client_last_modified, version,
      updated_at).
- [ ] `MAX_SNAPSHOT_BYTES` config setting (default 1 MiB).
- [ ] FastAPI's `max_request_body_size` (or middleware) enforces it; oversize
      requests return 413.
- [ ] Payload structure is *not* deeply validated — only that it's a JSON
      object containing keys `expenses`, `incomes`, `categories`, `settings`,
      `lastModified`.

**Estimate:** ~1h
**Depends on:** P3-1
**Labels:** `backend`, `phase-3`

---

### P3-3: PUT /v1/me/snapshot

**Goal**

Upsert the authenticated user's snapshot.

**Acceptance criteria**

- [ ] `PUT /v1/me/snapshot` accepts a `SnapshotIn`.
- [ ] Inserts on first call, updates `payload`, `client_last_modified`,
      `updated_at`, and bumps `version` on subsequent calls.
- [ ] Response is `SnapshotOut` with the new `version`.
- [ ] Response includes `ETag: W/"<version>"` header.
- [ ] Tests: first write creates row; second write bumps version; oversize
      payload returns 413; unauthenticated returns 401.

**Estimate:** ~2h
**Depends on:** P3-2, P2-3
**Labels:** `backend`, `phase-3`, `tests`

---

### P3-4: GET /v1/me/snapshot

**Goal**

Return the latest snapshot or 404.

**Acceptance criteria**

- [ ] `GET /v1/me/snapshot` returns the user's row as `SnapshotOut`.
- [ ] Includes `ETag: W/"<version>"` header.
- [ ] Returns 404 with `{"detail": "no snapshot"}` when none exists.
- [ ] Tests: present, absent, unauthenticated.

**Estimate:** ~1h
**Depends on:** P3-3
**Labels:** `backend`, `phase-3`, `tests`

---

## Phase 4 — Conflict detection & rate limiting

### P4-1: If-Match precondition on PUT (412 on mismatch)

**Goal**

Detect "your local copy is stale" so the FE can show the conflict dialog.

**Acceptance criteria**

- [ ] `PUT /v1/me/snapshot` reads `If-Match` header.
- [ ] If header absent and a row exists, returns 428 (Precondition Required).
- [ ] If header value doesn't match the current `version`, returns 412
      (Precondition Failed) with the *current* `SnapshotOut` in the body so
      the FE can render conflict info.
- [ ] If header matches, behaves as in P3-3.
- [ ] Tests: missing If-Match, stale If-Match, fresh If-Match, no-row
      first-write (no If-Match needed).

**Notes**

`428` lets the FE distinguish "first push, no precondition needed" from "lost
update detected" cleanly.

**Estimate:** ~2h
**Depends on:** P3-3
**Labels:** `backend`, `phase-4`, `tests`

---

### P4-2: Per-user rate limit on snapshot PUT

**Goal**

Cheap protection against runaway clients.

**Acceptance criteria**

- [ ] Add `slowapi` (or roll a small token-bucket against an in-memory dict
      keyed by user id — fine for one instance).
- [ ] `PUT /v1/me/snapshot` limited to 12 requests/minute per user; returns
      429 on excess.
- [ ] Limit is configurable via env var.
- [ ] Test that the 13th request in a minute returns 429.

**Estimate:** ~1.5h
**Depends on:** P3-3
**Labels:** `backend`, `phase-4`, `infra`, `tests`

---

## Phase 5 — Deployment

### P5-1: Dockerfile

**Goal**

A small, reproducible image that runs the API.

**Acceptance criteria**

- [ ] Multi-stage Dockerfile: builder uses `uv`, final stage uses
      `python:3.12-slim` and copies only the venv + app.
- [ ] Runs as a non-root user.
- [ ] Healthcheck instruction targets `/healthz`.
- [ ] `.dockerignore` excludes `.venv`, `.git`, `tests`, `__pycache__`.
- [ ] `docker build` followed by `docker run -p 8000:8000` serves the API
      against a local Postgres (host networking or compose).

**Estimate:** ~1.5h
**Depends on:** P1-3
**Labels:** `backend`, `phase-5`, `infra`

---

### P5-2: Hosting decision doc

**Goal**

Pick where this runs, with eyes open on cost.

**Acceptance criteria**

- [ ] `docs/hosting.md` (in BE repo) compares for *this* service:
  - GCP Cloud Run + Cloud SQL (or GCE micro for DB)
  - AWS App Runner / Lightsail + RDS
  - Fly.io + Neon
- [ ] Each option lists: monthly cost at idle and at light use, time-to-deploy
      estimate, ops burden, escape hatch.
- [ ] Decision recorded at the bottom with the reasoning.
- [ ] README "Deployment" updated to match the chosen path.

**Estimate:** ~1.5h
**Depends on:** P5-1
**Labels:** `backend`, `phase-5`, `infra`, `docs`

---

### P5-3: Provision managed Postgres on chosen host

**Goal**

Real database with a real backup story.

**Acceptance criteria**

- [ ] Postgres instance provisioned per the P5-2 decision.
- [ ] Connection string stored in the host's secret manager (Cloud Run
      secrets / Lightsail params / Fly secrets).
- [ ] Confirmed `psql` access from a developer machine via SSL.
- [ ] Automated daily backups enabled (most managed offerings include this;
      verify and document retention).
- [ ] Run `alembic upgrade head` against the new DB and verify schema.

**Estimate:** ~1h (mostly clicking)
**Depends on:** P5-2
**Labels:** `backend`, `phase-5`, `db`, `infra`

---

### P5-4: Deploy app + smoke test

**Goal**

The API answers at a real URL, end-to-end.

**Acceptance criteria**

- [ ] App deployed to chosen host with required env vars set.
- [ ] HTTPS works on the platform-issued domain.
- [ ] All four endpoints respond correctly from the public URL using a real
      Supabase JWT (manual smoke test, results pasted in the issue):
  - `GET /healthz`
  - `GET /v1/me`
  - `PUT /v1/me/snapshot` (first write)
  - `GET /v1/me/snapshot`
- [ ] Custom domain (if owned) wired via the host's DNS instructions; cert
      auto-renewal verified.

**Estimate:** ~2h
**Depends on:** P5-3, P4-1
**Labels:** `backend`, `phase-5`, `infra`

---

## Phase 6 — Operational hardening

### P6-1: Structured JSON logging

**Goal**

Logs greppable in a hosted log viewer.

**Acceptance criteria**

- [ ] `logging` configured to emit JSON lines: `ts`, `level`, `msg`, `req_id`,
      `user_id` (when authed), `path`, `method`, `status`, `duration_ms`.
- [ ] Request middleware tags each request with a `req_id` (UUID4) and logs
      one line per request.
- [ ] Tests for the formatter (unit-level — no need to test middleware end to
      end).

**Estimate:** ~1h
**Depends on:** P5-4
**Labels:** `backend`, `phase-6`, `infra`

---

### P6-2: Sentry integration

**Goal**

Get notified when the service throws.

**Acceptance criteria**

- [ ] `sentry-sdk[fastapi]` added.
- [ ] Initialized only when `SENTRY_DSN` is set (so local + CI stay quiet).
- [ ] Sample rate documented in README.
- [ ] Intentional `/dev/boom` test endpoint (gated to non-prod) confirms an
      event lands in Sentry.

**Estimate:** ~1h
**Depends on:** P5-4
**Labels:** `backend`, `phase-6`, `infra`

---

### P6-3: Backup runbook

**Goal**

A page you can follow at 2am to restore data.

**Acceptance criteria**

- [ ] `docs/runbook-backup.md` documents:
  - How to take an ad-hoc `pg_dump` of the prod DB.
  - Where managed backups live and how to list them.
  - Step-by-step restore into a fresh DB.
  - Monthly checklist: verify last-backup age, run a restore-into-staging
    drill quarterly.

**Estimate:** ~1.5h
**Depends on:** P5-3
**Labels:** `backend`, `phase-6`, `db`, `docs`

---

## Phase 7 — Frontend integration *(in the FE repo)*

### P7-1: Supabase client + sign-in UI on /settings

**Goal**

Anonymous users keep working as today; signed-in users see cloud actions.

**Acceptance criteria**

- [ ] `@supabase/supabase-js` added to the FE repo.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` wired
      via env.
- [ ] `/settings` shows a "Sign in" button (magic link) when signed out, and
      the user's email + a "Sign out" button when signed in.
- [ ] No change to other pages — anonymous users see the existing local-only
      experience.

**Estimate:** ~2h
**Labels:** `frontend`, `phase-7`, `auth`

---

### P7-2: "Back up to cloud" action

**Goal**

Push the current `AppData` to the server on demand.

**Acceptance criteria**

- [ ] Settings page shows a "Back up to cloud" button when signed in.
- [ ] Click sends `PUT /v1/me/snapshot` with the JWT and the cached
      `version` (omit on first push).
- [ ] On 200, store the new `version` and last-pushed timestamp in
      localStorage; show a toast/inline "Backed up just now."
- [ ] On 412, surface a "Cloud copy is newer — restore first" message and
      open the existing conflict dialog with the cloud snapshot.
- [ ] On 401, sign the user out and prompt to sign in again.

**Estimate:** ~2h
**Depends on:** P7-1, P3-3, P4-1
**Labels:** `frontend`, `phase-7`

---

### P7-3: "Restore from cloud" action

**Goal**

Pull the cloud snapshot through the existing conflict UI.

**Acceptance criteria**

- [ ] Settings page shows a "Restore from cloud" button when signed in.
- [ ] Click `GET /v1/me/snapshot`; on 404 show "No cloud backup yet."
- [ ] If response's `lastModified` differs from local, route through the
      existing `/import` conflict dialog with the cloud payload.
- [ ] If they match (or local is empty), apply directly with confirmation.
- [ ] After applying, cache the response's `version`.

**Estimate:** ~2h
**Depends on:** P7-2, P3-4
**Labels:** `frontend`, `phase-7`

---

### P7-4: Token refresh + sign-out hygiene

**Goal**

Long-lived sessions just work, and signing out is total.

**Acceptance criteria**

- [ ] Supabase client configured for auto-refresh; the FE always uses a fresh
      token when calling the BE.
- [ ] On any 401 from the BE, the FE clears the cached `version` /
      last-pushed timestamp and prompts re-sign-in.
- [ ] Sign-out clears Supabase session AND any cloud-related localStorage
      keys (without touching the user's `AppData`).

**Estimate:** ~1h
**Depends on:** P7-1
**Labels:** `frontend`, `phase-7`, `auth`

---

## Quick paste recipe

```bash
# from the new BE repo's root, after creating the labels listed at the top:
gh issue create --title "P0-1: Bootstrap Python project with uv, FastAPI, and Ruff" \
  --label backend,phase-0,infra --body-file - <<'EOF'
<paste P0-1 body here, from "Goal" through "Estimate"/Labels lines>
EOF
```

Or write a small shell loop that walks this file and calls `gh issue create`
per section. (Out of scope for the first commit — fine to just paste.)
