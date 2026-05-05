# Backend plan

Phased build for the PET cloud sync backend. Each phase is roughly **one
solo evening** of focused work; some span two for the unfamiliar parts. Each
phase has 2–5 issues defined in [`ISSUES.md`](./ISSUES.md).

## Goal

Let users back up the FE's local `AppData` to a server they own, and restore
it on another device, with conflict detection. Keep the FE local-first — the
backend is opt-in and additive, never required.

## Architecture decisions (and why)

### Snapshot per user, not per-row sync
The whole `AppData` blob lives in one JSONB column keyed by user id. Writes
replace it; reads return it. **Why:** the FE already encodes/decodes the
blob and has a battle-tested merge UI from the share-link feature — reusing
it means weeks of CRDT/merge work avoided. Tradeoff: two devices editing
simultaneously will race on `PUT`; the conflict UI handles that case.

### Supabase Auth, JWT-only on the server
The backend never touches passwords or sends emails. It verifies Supabase
JWTs against the project's JWKS and trusts `sub` as the user id. **Why:**
auth is the highest-risk thing to build wrong; outsourcing it is the right
call for a personal project.

### SQLModel over SQLAlchemy core
Models are written once and serve both as ORM tables and Pydantic schemas.
**Why:** less boilerplate for a Python newcomer, and the gap between
SQLModel and pure SQLAlchemy is small if the project ever outgrows it.

### Single `snapshots` table, one row per user
PK is `user_id`. Each `PUT` replaces the row in place. A monotonic `version`
counter (or `xmin::text` if we get clever) backs the ETag for `If-Match`.
**Why:** the simplest model that makes conflict detection possible. History
is out of scope for v1.

## Phases

### Phase 0 — Project bootstrap *(1 evening)*
Get a hello-world FastAPI service running locally with the long-term tooling
in place so we don't refactor later.

- Initialize project with `uv` and check in `pyproject.toml`.
- Wire FastAPI, Ruff, pytest. Single `/healthz` route returning `{"ok": true}`.
- GitHub Actions CI: `ruff check`, `ruff format --check`, `pytest`.
- README quick-start works on a clean machine.

### Phase 1 — Database foundations *(1 evening)*
Make the service talk to Postgres so subsequent phases don't fight infra.

- `docker-compose.yml` with Postgres 16 for local dev.
- SQLModel + connection string from env. Session dependency.
- Alembic initialized; one no-op migration committed to lock the baseline.
- `/healthz` becomes meaningful: pings DB before returning ok.

### Phase 2 — Auth (Supabase JWT) *(1–2 evenings)*
Stand up the dependency that gates every protected endpoint.

- Supabase project setup documented in README.
- JWT verification with PyJWT against the project's JWKS, with caching.
- `GET /v1/me` returns `{ id, email }` from the verified token.
- Tests: valid token, expired token, missing token, wrong audience.

### Phase 3 — Snapshot endpoints *(1–2 evenings)*
The actual product surface.

- `snapshots` table migration (PK `user_id`, JSONB payload, `version`,
  timestamps).
- Pydantic schemas with payload size limit.
- `PUT /v1/me/snapshot` upserts; returns new `version`.
- `GET /v1/me/snapshot` returns the row or 404.
- Happy-path + error-path tests for both endpoints.

### Phase 4 — Conflict detection & rate limiting *(1 evening)*
Make multi-device safe; keep abuse impossible.

- `If-Match: <version>` precondition on `PUT`. 412 on mismatch with the
  current `version` in the response so the FE can route through its existing
  conflict UI.
- Per-user rate limit on `PUT` (e.g. 12/min) using `slowapi`.
- Tests for both behaviors.

### Phase 5 — Deployment *(2 evenings)*
Get something at a real URL with HTTPS.

- `Dockerfile` (multi-stage, `uv` for install, runs as non-root).
- Hosting decision recorded with the actual numbers (GCP Cloud Run vs AWS
  Lightsail vs Fly.io+Neon). Owner picks.
- Provision managed Postgres on the chosen platform.
- Deploy, set env vars, smoke-test all four endpoints from prod.
- Custom domain + HTTPS.

### Phase 6 — Operational hardening *(1 evening)*
Things you'll wish you had the first time something breaks.

- Structured JSON logging via stdlib `logging` + a formatter.
- Sentry integration (free tier) for unhandled errors.
- Backup runbook: `pg_dump` to off-host storage, restore steps.

### Phase 7 — Frontend integration *(1–2 evenings, in the FE repo)*
Wire the FE to the new backend without breaking the local-only experience.

- Supabase JS client + sign-in UI on `/settings`. Anonymous users see the
  existing share-link flow; signed-in users also see "Back up to cloud" and
  "Restore from cloud."
- "Back up" calls `PUT /v1/me/snapshot` with the current `AppData` and the
  cached `version` (omit on first push).
- "Restore from cloud" calls `GET /v1/me/snapshot`. If the server payload's
  `lastModified` differs from local, route through the existing conflict
  dialog (merge / replace / cancel) before applying.
- Token refresh handled by the Supabase client; a 401 clears the cached
  session.

## Open questions / risks

- **Snapshot size growth.** A long-lived account could exceed our
  `MAX_SNAPSHOT_BYTES` cap. We'll surface a clear error and consider
  compression (gzip the JSONB on the server) only if it actually bites.
- **Email-based account migration.** Tying data to `user.id` (UUID) means a
  user who signs up with the wrong email and re-registers loses their cloud
  copy. Mitigation: an explicit "export" flow always remains as a safety
  net. Documented, not solved in code.
- **Cost drift.** AWS/GCP free-tier durations expire; the README's Fly.io+Neon
  note is the eject hatch. Re-evaluate at the 12-month mark.

## Out of scope (v1)

- Per-row sync, real-time updates, websockets.
- Sharing data with another user.
- End-to-end encryption (server sees plaintext payload — tradeoff accepted
  for v1; revisit if we ever store anything more sensitive than personal
  expenses).
- Admin UI, exports beyond what the FE already does, scheduled reports.
- Mobile native apps — the FE is a PWA, that's the multi-device story.

## How to use this document

1. Read this file end-to-end. Push back on anything that feels wrong before
   work starts.
2. Open `ISSUES.md`. Each section there is a complete GitHub issue body —
   copy-paste each into the new BE repo's issue tracker.
3. Work issues in phase order. Don't skip phases; phase N+1 assumes N's
   foundation.
