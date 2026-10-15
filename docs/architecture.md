# PranaVeda — Backend Architecture

> **Status:** Phase 0 design (living document)
> **Scope:** Spring Boot backend for the complete product defined in `agents.md`.
> Frontend (Next.js) and in-browser MediaPipe inference are covered only at the
> API boundary. Detailed schemas will live in `docs/database-schema.md`,
> endpoint DTOs in `docs/api-contracts.md`, and the auth model in `docs/security.md`.

## 1. Goals

Deliver a backend that:

- keeps **published yoga content fully public** (no login to read/stream) while
  protecting every personal feature behind authentication,
- enforces the `agents.md` authorization matrix **server-side at both route and
  service layer**, isolates user data (no IDOR), and never trusts client roles,
- evolves through the phased roadmap without rewrites (clean module boundaries,
  storage/AI abstractions, versioned API and migrations),
- fails fast and safely in production (mandatory env secrets, sanitized errors).

## 2. Architecture decisions

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | Runtime | Java 21 LTS + Spring Boot **4.1.1** (current GA line) | `agents.md`: supported Boot release on a Java LTS; 4.x is current generation |
| 2 | Build | Maven (Maven wrapper added in Phase 1) | Maven 3.9.9 available locally |
| 3 | API style | REST/JSON under `/api/v1` | `agents.md` §4 |
| 4 | Database | PostgreSQL **17 running as a local Windows service** (`postgresql-x64-17`, `localhost:5432`) — no Docker | User develops directly against the local DB and inspects queries with their own tools; managed DB in production |
| 5 | Migrations | Flyway (`spring-boot-starter-flyway` + `flyway-database-postgresql`) | Versioned schema; no auto-DDL in production |
| 6 | ORM | Spring Data JPA + Hibernate | `agents.md` §3.3 |
| 7 | Authentication | Short-lived **JWT access token** (in-memory, `Authorization` header) + rotating **opaque refresh token** (SHA-256-hashed in `refresh_tokens`) delivered as `HttpOnly`/`Secure`/`SameSite` cookie | `agents.md` §2.3 — no long-lived secrets in `localStorage` |
| 8 | Password hashing | BCrypt (strength 12) | Built into Spring Security; documented upgrade path to Argon2id |
| 9 | Validation | Bean Validation on every request DTO | `agents.md` §3.3 |
| 10 | API docs | springdoc-openapi **3.1.x** (Swagger UI) | Major version locked to Spring Boot 4 |
| 11 | Media storage | `StorageService` interface: local filesystem in dev, S3-compatible later | `agents.md` §7 — swap providers without touching business code |
| 12 | AI provider | `AiProvider` interface + `MockAiProvider` fallback until credentials exist | `agents.md` §2.14 — provider-independent |
| 13 | Posture coach | MediaPipe runs **entirely in the browser**; backend serves pose-rule configs and (optionally) compact session summaries only | `agents.md` §13 — no frames ever uploaded |
| 14 | Rate limiting | `RateLimiter` interface, in-memory first, Redis later | `agents.md` §5 |

## 3. System context

```text
                     Browser
   ┌──────────────────────────────────────────────┐
   │ Next.js (public pages, dashboard, admin)     │
   │  ├─ audio player (HTML5, persistent)         │
   │  ├─ MediaPipe pose inference (LOCAL only)    │
   │  └─ API client: access token in memory,      │
   │     refresh token in HttpOnly cookie         │
   └───────────────┬──────────────────────────────┘
                   │ HTTPS  /api/v1
                   ▼
   ┌──────────────────────────────────────────────┐
   │ Spring Boot 4 (com.pranaveda)                │
   │  Security chain → Controllers → Services     │
   │  → Repositories │ GlobalExceptionHandler     │
   └───┬──────────────┬───────────────┬───────────┘
       │              │               │
       ▼              ▼               ▼
 PostgreSQL      StorageService    AiProvider
 (Flyway)        (local → S3)      (mock → real, key server-side)
```

## 4. Layering and request flow

```text
HTTP → Security filter chain (authn, role checks)
     → Controller      — mapping, @Valid, OpenAPI annotations ONLY
     → Service         — business rules, ownership/authorization checks, @Transactional
     → Repository      — Spring Data JPA (Specifications for filters; no string SQL)
     ← DTO out         — entities are never serialized to clients
```

- **Controllers stay thin**; all authorization-sensitive rules live in services
  *and* the Spring Security configuration (defense in depth).
- **Ownership comes from the security context**, never from path/body IDs on
  `/me/**` routes — this is what prevents user-data IDOR.
- **Publication visibility** (anonymous → `PUBLISHED` only) is a service-level
  rule shared by public endpoints, search, metadata, and media checks.
- `spring.jpa.open-in-view=false` — transactions end in the service layer.
- DTO↔entity mapping is manual per module; introduce MapStruct only if mapping
  volume actually justifies a dependency.

## 5. Package structure

```text
com.pranaveda
├── PranaVedaApplication.java
├── config/            # Security filter chain, CORS, OpenAPI, async
├── common/
│   ├── error/         # ErrorCode, ApiError, GlobalExceptionHandler,
│   │                  # NotFound / Conflict / Forbidden domain exceptions
│   ├── dto/           # PageResponse<T>, ErrorResponse
│   └── util/          # SlugUtil, TimeUtil (UTC helpers)
├── auth/              # register, login, refresh, logout, /auth/me
├── user/              # User entity, roles, account/profile services
├── content/           # content_items (ASANA/ARTICLE/VIDEO), publication
│                      # states, search/filter/sort services
├── category/          # categories, tags, curated collections
├── media/             # media_assets metadata, StorageService, uploads,
│                      # streaming vs download permissions, signed URLs
├── bookmark/          # saved library (unique user+content)
├── wellness/          # wellness profile, check-ins, dashboard queries
├── session/           # practice sessions / session mode records
├── streak/            # streaks + 7-day challenge (timezone-aware, idempotent)
├── routine/           # personal routines and sequence items
├── audio/             # audio tracks, streaming/download rules, history
├── recommendation/    # personalized suggestions (opt-in profile data only)
├── ai/                # AiProvider interface, mock impl, chat service, safety
├── posture/           # pose-rule configs + session summaries (agents.md §13)
├── admin/             # ADMIN-only controllers/analytics (thin; delegate to
│                      # the same domain services - no duplicated rules)
└── security/          # JwtService, auth filters, UserDetailsService,
                       # CurrentUser helper for service-layer ownership checks
```

Rules:

- One module = entity + repository + service + DTOs + its controllers.
- Controllers: HTTP mapping, `@Valid`, OpenAPI annotations, service calls —
  **no business logic**.
- Services: business rules, **ownership checks**, `@Transactional`, and the
  public-visibility rule for unpublished content.
- Repositories: Spring Data interfaces; Specifications for composite filters;
  never concatenate user input into queries.
- `admin` controllers only expose ADMIN routes; they call the same services
  the public/member routes use.

## 6. Security architecture

**Authentication (Phase 2):**

1. `POST /api/v1/auth/login` verifies a BCrypt hash and issues:
   - *access token* — JWT (HS256, secret from env, TTL ~15 min), returned in
     the body and kept **in memory** in the frontend only;
   - *refresh token* — opaque 256-bit random value, **stored SHA-256-hashed**
     in `refresh_tokens` (TTL ~14 days), delivered as an
     `HttpOnly; Secure(prod); SameSite` cookie, **rotated on every refresh**,
     individually revocable (logout deletes it).
2. Requests carry `Authorization: Bearer <access>`; a stateless filter checks
   signature/expiry and populates the `SecurityContext` (user id + role).
3. Refresh-token reuse detection: presenting an already-rotated token revokes
   the whole token family for that user.
4. Public registration always creates `USER`; `ADMIN` is granted only through
   the controlled bootstrap procedure (never from a request payload).

**Authorization:**

- Exactly two roles: `USER`, `ADMIN` (`users.role` column; client-supplied role
  values are ignored).
- Route rules follow the `agents.md` matrix, e.g. `/api/v1/admin/** →
  hasRole("ADMIN")`, `/api/v1/me/** → authenticated()`, published content and
  public audio/video GETs → `permitAll`.
- **Service-layer re-check:** every `/me/**` service resolves the owner from
  the security context — IDs in paths/bodies are never trusted as owners, so
  a misconfigured route rule alone cannot leak another user's data.
- ADMIN manages content/media/analytics but gets **no** read access to other
  users' wellness records (`agents.md` §4).

**CSRF stance:** the only cookie-authenticated state-changing endpoint will be
`POST /auth/refresh`; it gets CSRF protection (or `SameSite=Strict` + origin
checks). Bearer-token API calls are CSRF-immune. Full rationale lands in
`docs/security.md` (Phase 2).

**Rate limiting:** a pluggable `RateLimiter` wraps login, register, refresh,
downloads, and AI chat; in-memory implementation first, Redis later without
business-code changes.

**Password hashing:** BCrypt strength 12 today; upgrading to Argon2id later
requires only re-hashing on next login (documented in `docs/security.md`).

## 7. Data model

Conventions:

- `BIGINT GENERATED ALWAYS AS IDENTITY` PKs; unique `slug` on content/audio.
- `created_at` / `updated_at` as `timestamptz` in **UTC**; `published_at`
  stored separately.
- Enums stored as strings (+ CHECK constraints where they add value).
- Streaks: store UTC instants plus a timezone on the profile; the "local day"
  is always derived **server-side**.
- Unique constraints: `users.email`, `content_items.slug`,
  `bookmarks(user_id, content_id)`, daily completion `(user_id, local_day)`.
- Indexes: partial index on `status = 'PUBLISHED'`, filter columns
  (difficulty, duration, type), trigram/GIN for search
  (`V1__extensions.sql`), all foreign keys.

Planned tables (authoritative detail lands in `docs/database-schema.md`):

| Domain | Tables |
|--------|--------|
| Identity | `users`, `refresh_tokens` |
| Content | `content_items`, `categories`, `tags`, `content_tags`, `content_categories`, `collections`, `collection_items` |
| Media | `media_assets`, content↔media links, per-asset access policy |
| Member | `bookmarks`, `wellness_profiles`, `wellness_check_ins` |
| Practice | `practice_sessions`, `daily_completions`, `challenge_participations` |
| Routines | `routines`, `routine_items` |
| Audio | `audio_tracks`, `audio_listening_history`, `favorites` |
| Posture (§13) | `pose_definitions` (versioned config), `posture_session_summaries` |
| AI (opt-in) | `ai_conversations`, `ai_messages` — only if history is enabled |

## 8. API conventions

- Prefix `/api/v1`; OpenAPI JSON at `/v3/api-docs`, Swagger UI at
  `/swagger-ui.html` (dev only in practice).
- Uniform error envelope, never leaking internals:

```json
{ "code": "VALIDATION_FAILED",
  "message": "Request validation failed.",
  "timestamp": "2026-10-09T10:00:00Z",
  "path": "/api/v1/auth/register",
  "fieldErrors": [ { "field": "email", "message": "must be a well-formed email address" } ] }
```

- Error codes: `VALIDATION_FAILED`, `UNAUTHENTICATED`, `TOKEN_EXPIRED`,
  `FORBIDDEN`, `NOT_FOUND`, `CONFLICT` (duplicate email/slug/bookmark),
  `RATE_LIMITED`, `PAYLOAD_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`,
  `INTERNAL_ERROR` (logged with correlation id, body sanitized).
- Pagination: `?page=0&size=20&sort=createdAt,desc` →
  `{ content, page, size, totalElements, totalPages }`; every sort gets an
  `id` tie-breaker appended so ordering is deterministic.
- Filter/sort values are bound to enums/whitelists — raw user input never
  reaches a query string.
- Endpoint groups: `/auth/*`, `/content`, `/categories`, `/tags`, `/audio`,
  `/me/*` (bookmarks, wellness, sessions, streaks, routines, audio history,
  posture sessions), `/ai/chat`, `/admin/*` (content, media, taxonomy,
  analytics), `/posture/poses`.

## 9. Configuration and environment

**Files (created in this milestone):**

| File | Purpose | Committed? |
|------|---------|-----------|
| `backend/src/main/resources/application.properties` | shared config (placeholders only, no secrets), optional `.env` import | yes |
| `backend/src/main/resources/application-dev.properties` | local PostgreSQL, SQL echo, dev CORS | yes |
| `backend/.env` | local values (DB credentials, keys) | **no** — gitignored |
| `backend/.env.example` | placeholder template | yes |

**Profile activation:** two `.properties` files only. `dev` is the default;
production reuses the SAME files and sets every value via host environment
variables (no prod-only file, no secrets in code).

**Environment contract** (keep `.env.example` in sync):

| Variable | Used by | Dev value | Required in prod |
|----------|---------|-----------|------------------|
| `SPRING_PROFILES_ACTIVE` | backend | `dev` | yes → `prod` |
| `SERVER_PORT` | backend | `8080` | no |
| `DB_URL` | backend | `jdbc:postgresql://localhost:5432/pranaveda` | yes |
| `DB_USERNAME` | backend | your local superuser | yes |
| `DB_PASSWORD` | backend | your local password | yes |
| `CORS_ALLOWED_ORIGINS` | backend | `http://localhost:3000` | yes — exact HTTPS origins |
| `JWT_ACCESS_SECRET` | backend (Phase 2+) | dev placeholder | yes — ≥32 random bytes |
| `JWT_ACCESS_TTL` / `JWT_REFRESH_TTL` | backend (Phase 2+) | `15m` / `14d` | no |

**Precedence:** OS environment variables >
`application-{profile}.properties` > `application.properties` > imported
`.env`. Production **fails fast** on any unresolved `${VAR}` without a
default — an incomplete deployment never starts silently.

**Local database workflow:** development runs against your local PostgreSQL 17
service (`postgresql-x64-17`, port 5432) so you can open the database in your
own tooling (psql, DBeaver, pgAdmin, DataGrip) and inspect exactly what the
app does. In `dev`, every SQL statement is echoed to the console
(`spring.jpa.show-sql=true`, formatted) — useful for checking generated
queries. Flyway records each applied migration in `flyway_schema_history`;
the application only ever *reads* your existing cluster and creates/alters
objects inside the `pranaveda` database.

## 10. Media storage abstraction

```java
public interface StorageService {
    StoredObject put(String key, InputStream in, String contentType, long size);
    void delete(String key);
    URL signedReadUrl(String key, Duration ttl);   // download-protected assets
    URL publicUrl(String key);                     // public / CDN assets
}
```

- Object keys are **generated server-side** (never derived from user
  filenames); original filename, MIME type, size, and license metadata live
  in `media_assets`.
- Phase 4 ships `LocalFileStorage` writing under `storage-data/`
  (gitignored); an S3-compatible implementation plugs in later **without
  touching business code**.
- Download authorization is evaluated in the service layer *before* any URL
  is minted; signed URLs are short-lived. Storage credentials never leave the
  server (`agents.md` §7).

## 11. AI provider abstraction

```java
public interface AiProvider {
    AiReply chat(AiRequest request);   // timeouts, size limits, retries applied by wrapper
}
```

- `MockAiProvider` returns a safe canned answer until real credentials exist
  (Phase 7); changing providers later means one new implementation of this
  interface — no business-code changes.
- Provider API keys live **only** in server-side environment/secrets, never in
  `NEXT_PUBLIC_*` variables or source (`agents.md` §2.14).
- Safety rules are PranaVeda-owned code/system instructions in `ai/`, not
  provider-dependent: no diagnosis or cure claims, no personalized herb
  dosages, urgent-symptom escalation to medical care, prompt/retrieved-text
  treated as untrusted input, hard request-size and rate limits.
- Grounding: recommendations can reference the platform's published content
  IDs; responses may cite them. Conversation history is **opt-in** — when
  disabled, nothing is persisted; when enabled, users can delete it.

## 12. Posture coach backend surface (`agents.md` §13)

- MediaPipe Pose Landmarker inference runs **entirely in the browser**.
  Frames, video, and raw landmark streams are never uploaded, stored, or
  logged — only the two endpoints below ever touch this feature server-side.
- `GET /api/v1/posture/poses` (public) — the instructor-reviewed pose-rule
  configs for the initial poses: Mountain (Tadasana), Tree (Vrikshasana),
  Warrior II (Virabhadrasana II). Each config carries required landmarks,
  recommended camera view, alignment ranges, allowed variations, confidence
  thresholds, smoothing/persistence parameters, and safety notes. Stored as
  version-controlled JSON under `src/main/resources/posture/` so rule changes
  are code-reviewed and releasable; served read-only with a config version.
- `POST /api/v1/me/posture-sessions` (authenticated, **optional**) — a compact
  summary only: pose id + config version, duration, selected variation,
  completion flag, a few aggregate metrics, timestamp. Bean Validation with
  strict numeric ranges; treated as **untrusted input** and never used for
  medical decisions.
- `GET /api/v1/me/posture-sessions` (authenticated) — owner-only listing;
  ownership resolved from the security context (same rule as all `/me/**`).
- Anonymous visitors can run the coach fully in the browser; login is needed
  only to persist a summary (`agents.md` §13 access rule).

## 13. Error handling and observability

- A single `@RestControllerAdvice` `GlobalExceptionHandler` maps:
  - Bean Validation failures → 400 `VALIDATION_FAILED` with field errors;
  - domain exceptions (`NotFoundException`, `ConflictException`,
    `ForbiddenOperationException`, `TooManyRequestsException`) → their
    envelope codes;
  - anything uncaught → 500 `INTERNAL_ERROR` (stack logged with a correlation
    id; the response body stays sanitized — no stack traces, SQL, or secrets).
- Correlation id (request-scoped MDC) is attached to responses and logs so a
  user-visible error can be traced server-side.
- Structured logging; **never** log passwords, tokens, refresh cookies,
  wellness payloads, raw AI prompts, or full sensitive bodies.
- Actuator exposes `health` (no configuration details) and `info` only;
  `/actuator/health` doubles as the deployment liveness/readiness probe.

## 14. Testing strategy

- **Unit tests** — service rules: streak/timezone math, publication
  visibility, filter/sort whitelists, pagination tie-breakers, AI safety
  wrapper, posture-summary validation. (Pose-angle analysis itself is tested
  on the frontend, `agents.md` §13.)
- **Repository/migration tests** — `@DataJpaTest` against a dedicated
  PostgreSQL test database (`pranaveda_test`), so tests exercise the same
  engine as production: Testcontainers in CI where Docker is available, or
  the local PostgreSQL instance as the documented fallback — matching the
  no-Docker local workflow.
- **Web/security tests** — MockMvc + `spring-security-test`:
  anonymous denied on every `/me/**` and `/admin/**`; user A cannot read or
  mutate user B's data; role-escalation attempts fail; draft/archived content
  never appears in public endpoints, search, or metadata.
- **Contract/error tests** — error envelope shape, validation messages,
  pagination determinism.
- Quality gates per `agents.md` §8 before any milestone is called done:
  formatting, `mvn verify`, production build, docs/`.env.example` updated.

## 15. Roadmap mapping (backend deliverables per phase)

| Phase | Backend deliverables |
|-------|----------------------|
| **1 — Foundation (current)** | skeleton, dev/prod profiles + `.env` contract, local-PostgreSQL wiring, Flyway chain, health endpoint, OpenAPI, error envelope, this document |
| **2 — Auth** | register/login/refresh/logout/`me`, roles + authorization matrix, `refresh_tokens` rotation, security tests, `RateLimiter` |
| **3 — Public library + admin publishing** | content/category/tag/collection schema and APIs, search/filter/sort/pagination, publication-state rules, SEO metadata |
| **4 — Media & downloads** | `media_assets`, `StorageService` (local → S3), secure admin uploads, public streaming vs authenticated download authorization, signed URLs |
| **4.5 — Posture coach start** | public `GET /posture/poses` rule configs (landmark-overlay prototype after media foundations, `agents.md` §13) |
| **5 — Member features** | bookmarks, wellness profile + privacy controls, practice sessions, streaks/7-day challenge (timezone-aware, idempotent), routines, optional posture session summaries |
| **6 — Calm music** | audio track APIs, streaming/download permissions, favorites/listening history |
| **7 — AI companion** | `AiProvider` + mock, chat endpoint, grounding, safety/limits/timeouts, privacy controls |
| **8 — Polish & release** | aggregate admin analytics, regression pass over every route/endpoint against the authorization matrix, deployment docs |

Ordering follows `agents.md` §10 with §13 slotted after media foundations and
before/alongside dashboard polish; the posture coach never blocks core phases.






