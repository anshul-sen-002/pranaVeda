# PranaVeda — API contracts

> **Status:** living document. Phase 2 (authentication) is finalized below;
> endpoint groups for content, media, wellness, audio, AI, and admin are added
> as each phase lands (roadmap: `docs/architecture.md` §15).
> Request/response DTO source of truth: `backend/src/main/java`.

## Conventions (all endpoints)

- Base path `/api/v1`; JSON request/response bodies, UTF-8.
- **Authentication:** `Authorization: Bearer <accessToken>` (JWT, TTL from
  `JWT_ACCESS_TTL`, default 15 min) plus the `pv_refresh` cookie
  (`HttpOnly`, `SameSite=Strict`, `Path=/api/v1/auth`, `Secure` in prod) used
  only for refresh/logout.
- **Error envelope** for every non-2xx JSON response:

```json
{ "code": "VALIDATION_FAILED",
  "message": "Request validation failed.",
  "timestamp": "2026-10-09T12:00:00Z",
  "path": "/api/v1/auth/register",
  "correlationId": "8b2f1c9e-...",
  "fieldErrors": [ { "field": "email", "message": "must be a well-formed email address" } ] }
```

`fieldErrors` and `correlationId` are omitted when not applicable. Codes:
`VALIDATION_FAILED` 400 · `UNAUTHENTICATED` 401 · `TOKEN_EXPIRED` 401 ·
`FORBIDDEN` 403 · `NOT_FOUND` 404 · `CONFLICT` 409 · `RATE_LIMITED` 429 ·
`INTERNAL_ERROR` 500. A browser request with a disallowed `Origin` receives a
plain 403 from the CORS filter (no envelope, by design).
Every response carries an `X-Correlation-Id` header.

## Authentication endpoints

### POST `/api/v1/auth/register` — public

Request:

```json
{ "email": "demo@pranaveda.dev", "password": "password123", "displayName": "Demo User" }
```

Validation: email ≤ 320 and well-formed; password 8–72 chars; displayName
2–80 chars. Response **201**:

```json
{ "accessToken": "eyJhbGciOi...", "tokenType": "Bearer", "expiresIn": 900,
  "user": { "id": 1, "email": "demo@pranaveda.dev", "displayName": "Demo User", "role": "USER" } }
```

Plus `Set-Cookie: pv_refresh=<opaque>; HttpOnly; SameSite=Strict; Path=/api/v1/auth; Max-Age=1209600`.
Errors: 400 `VALIDATION_FAILED` (field errors), 409 `CONFLICT` (duplicate
email). Always creates `role: USER` — role is never accepted from the client.

### POST `/api/v1/auth/login` — public

Request `{ "email", "password" }` → **200** with the same body as register.
401 `UNAUTHENTICATED` with an identical message for unknown email and wrong
password (no account enumeration); disabled accounts also 401.

### POST `/api/v1/auth/refresh` — public, cookie-based

Reads the `pv_refresh` cookie. **200** → new access token and a **rotated**
cookie (old value is revoked and linked as `replaced_by`).
Errors: 401 `UNAUTHENTICATED` (missing/invalid/already-rotated token — reuse
of a revoked token revokes the entire token family), 401 `TOKEN_EXPIRED`
(refresh TTL exceeded), 403 for a disallowed `Origin`.

### POST `/api/v1/auth/logout` — public, cookie-based

Idempotent → **204** with `Set-Cookie: pv_refresh=; Max-Age=0`. Revokes the
presented token when it is still active; unknown/missing tokens are ignored.

### GET `/api/v1/auth/me` — Bearer required

**200** `UserSummary`:
`{ "id", "email", "displayName", "role" }` · 401 `UNAUTHENTICATED` /
`TOKEN_EXPIRED`.

## Authorization matrix (route level, enforced server-side)

| Routes | Anonymous | USER | ADMIN |
|---|---|---|---|
| `/api/v1/auth/{register,login,refresh,logout}` | ✓ | ✓ | ✓ |
| `/api/v1/auth/me`, `/api/v1/me/**` | 401 | ✓ — own data only | ✓ — own data only |
| `/api/v1/admin/**` | 401 | 403 | ✓ |
| public content & audio GETs | ✓ | ✓ | ✓ |

Service layers re-resolve ownership from the security context — IDs in paths
or bodies are never trusted as owners.

## Planned groups (added per phase)

`/content`, `/categories`, `/tags` (Phase 3) · `/media` downloads (Phase 4) ·
`/posture/poses` (Phase 4.5) · `/me/{bookmarks,wellness,sessions,streaks,routines,audio-history,posture-sessions}` (Phase 5) · `/audio` (Phase 6) ·
`/ai/chat` (Phase 7) · `/admin/*` (Phases 3–8).
