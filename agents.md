# PranaVeda --- AI Coding Agent Instructions

> **Working title:** PranaVeda\
> **Product:** A calm, accessible yoga and holistic-wellness platform
> with public yoga content, member-only personal features, calming
> audio, and an AI wellness companion.\
> **Primary stack:** Next.js + TypeScript, Spring Boot + Java,
> PostgreSQL.\
> **Important access rule:** Anyone can browse and view published yoga
> posts, yoga images, and yoga videos without logging in. Authentication
> is required for personal features such as downloading media, saving
> content, wellness profiles and dashboards, streaks, personalized
> plans, and personal history.

This document is the project-wide implementation guide. Follow it before
making architectural decisions or writing code. Build incrementally,
test each milestone, and keep the application runnable throughout
development.

------------------------------------------------------------------------

## 1. Product vision and principles

Build a polished wellness product that feels calm, reassuring,
responsive, and effortless to use---not a generic admin CRUD
application.

### Experience principles

-   Use a quiet visual language: warm off-white backgrounds, muted
    sage/forest greens, natural neutrals, generous spacing, and
    restrained accents.
-   Use subtle transitions and feedback. Avoid excessive animation, loud
    gradients, clutter, or unnecessary popups.
-   Make the experience mobile-first, responsive, keyboard-accessible,
    and comfortable for long reading sessions.
-   Provide useful loading, empty, success, and error states for every
    important flow.
-   Respect reduced-motion preferences and accessibility settings.
-   Never make wellness progress feel punitive. Streaks and reminders
    should encourage, not shame.
-   Public content must remain useful without creating an account.
-   Ask for only the personal information needed for a feature, explain
    why it is requested, and let users edit or delete it.
-   Never present the AI as a doctor or claim that yoga, herbs, or
    Ayurveda can diagnose or cure a disease.

### Primary roles

Use exactly two application roles initially:

-   `ADMIN`: manages and publishes content, manages taxonomy and
    featured material, and views aggregate platform analytics.
-   `USER`: can browse public content and, after signing in, use
    personal features.

Do not add separate manager, instructor, or moderator roles unless
explicitly requested later. A visitor who is not signed in is an
**anonymous visitor**, not a database role.

------------------------------------------------------------------------

## 2. Functional requirements

### 2.1 Public browsing --- no login required

Visitors must be able to:

-   View the home page and published yoga content.
-   Browse yoga asanas, articles, images, and videos.
-   Search, filter, and sort published content.
-   Open yoga detail pages with instructions, benefits, difficulty,
    duration, Sanskrit/common names, and safety precautions.
-   Play publicly available yoga videos.
-   Browse the calm music library and play audio where the content is
    marked public.
-   Read public informational pages such as About, Safety, Privacy, and
    Terms.
-   See a clear but non-intrusive sign-in prompt when attempting a
    member-only action.

Do **not** redirect anonymous visitors to login just to read a post or
watch a published yoga video.

### 2.2 Login-required actions

Require authentication for:

-   Downloading yoga images, videos, or audio.
-   Saving/bookmarking yoga posts, videos, asanas, and audio tracks.
-   A personal wellness profile and wellness dashboard.
-   Tracking personal yoga sessions and practice history.
-   Streaks, challenges, personal goals, and progress reports.
-   Creating and saving personal routines or yoga sequences.
-   Personalized recommendations based on the user's own activity or
    profile.
-   Personal AI conversation history, if history is offered.

When an anonymous visitor selects a member-only action:

1.  Preserve the intended action and current content URL where
    practical.
2.  Explain that signing in is required.
3.  Offer sign-in and registration.
4.  After successful authentication, return the user to the original
    content or continue the intended action.
5.  Re-check authorization on the backend. Hiding a button in the UI is
    not security.

### 2.3 Authentication and account settings

Implement:

-   Registration and login with validated input.
-   Secure logout and session/token invalidation strategy.
-   Password hashing using a strong supported password encoder (never
    store plaintext passwords).
-   Access-token and refresh-token handling using a carefully designed
    secure approach.
-   Prefer an `HttpOnly`, `Secure` (in production), appropriately
    `SameSite` refresh cookie where applicable; never put long-lived
    secrets in `localStorage`.
-   Role-based authorization enforced by Spring Security.
-   Profile editing, password change, and account deletion flow.
-   Clear errors for invalid credentials, expired sessions, duplicate
    email, and validation failures.
-   Rate limiting or throttling for sensitive authentication endpoints
    where infrastructure permits.
-   Email verification and password reset can be added as a planned
    milestone if email delivery is configured.

Do not trust role values submitted by a client. Public registration must
always create a `USER`; only a protected admin process may grant
`ADMIN`.

### 2.4 Yoga content library

Each yoga item may include:

-   Title, slug, summary, full description, common name, Sanskrit name,
    category, tags.
-   Content type: `ASANA`, `ARTICLE`, or `VIDEO` (or a clearly modelled
    equivalent).
-   Featured image/thumbnail and media references.
-   Difficulty level, suggested duration, target areas, and intended
    goals.
-   Step-by-step instructions, breathing notes, modifications, and
    safety precautions.
-   Traditional benefits and evidence notes phrased carefully and
    without unsupported medical claims.
-   Author/editor metadata, publication status, created/updated
    timestamps, and published timestamp.
-   Searchable text and SEO title/description.

Support draft, published, and archived states. Anonymous visitors may
access only published content. Draft and archived content must never
leak through public APIs, search results, metadata, or media endpoints.

### 2.5 Search, filtering, sorting, and collections

Support filters such as:

-   Goal: flexibility, relaxation, balance, mobility, posture, sleep
    routine, general fitness.
-   Difficulty: beginner, intermediate, advanced.
-   Duration.
-   Content type.
-   Body area or movement category.
-   Tags and category.
-   Newest and most popular, when popularity is based on a defined
    metric.

Requirements:

-   Server-side pagination for large result sets.
-   Stable sorting with a deterministic tie-breaker.
-   Validate filter and sort parameters on the backend; never
    interpolate raw user input into SQL.
-   Debounce text search in the UI.
-   Keep filters reflected in URL query parameters so results can be
    shared and browser navigation works.
-   Show active filter chips and a one-click reset.
-   Add curated collections such as "Morning Yoga", "Gentle Evening
    Routine", and "Beginner Essentials".

### 2.6 Saved library

Signed-in users can save and unsave published yoga posts, asanas,
videos, and calm audio tracks.

-   Prevent duplicate saved records for the same user and item.
-   Make the save control accessible and provide immediate, reversible
    feedback.
-   Provide a Saved Library page with content-type filters and sorting.
-   Handle deleted or unpublished content gracefully.
-   Users must only read or modify their own saved items.

### 2.7 Downloads

Downloads are a member benefit, but must be implemented securely and
with media licensing in mind.

-   Show download controls only when a user is signed in and the asset
    is downloadable.
-   The backend must verify authentication, content availability, and
    download permission before issuing a short-lived signed URL or
    streaming the file.
-   Do not expose storage credentials or permanent private bucket URLs.
-   Use appropriate `Content-Disposition` and content types for direct
    download responses.
-   Enforce reasonable size/type limits for admin uploads.
-   Do not allow downloading third-party media unless the license
    permits it.
-   Explain when a particular track or video is stream-only.
-   For large media, prefer object storage and short-lived signed URLs
    over proxying every byte through the application server.

Public viewing/streaming and authenticated downloading are separate
permissions. A public video may be streamable without allowing its
original file to be downloaded.

### 2.8 Personal wellness profile

After login, users may optionally record:

-   Date of birth or age (prefer deriving age from date of birth only if
    genuinely needed).
-   Height and weight with units.
-   General goals and experience level.
-   Preferred session duration and practice time.
-   Self-reported sleep quality, energy, mood, or flexibility progress.
-   Optional constraints relevant to safe yoga recommendations.

Guidelines:

-   Keep fields optional unless a feature truly requires them.
-   Do not infer a diagnosis from height, weight, age, or symptoms.
-   Avoid presenting BMI as a complete measure of health. If offered,
    label it as a limited screening metric and explain its limitations.
-   Make sensitive wellness information private to its owner and
    protected by backend authorization.
-   Provide edit, export, and deletion options for personal records.
-   Ask for consent before using personal data to personalize AI
    responses.
-   Never send more personal data to an external AI provider than needed
    for the current question.

### 2.9 Wellness dashboard and progress

The signed-in dashboard can show:

-   Today's recommended routine and a quick "Start session" action.
-   Current streak and 7-day challenge progress.
-   Practice minutes and completed sessions over a selected period.
-   Recently viewed content and saved items.
-   Weekly and monthly consistency charts.
-   User-defined goals and progress toward them.
-   Optional wellness check-ins and trends.

Make charts understandable with labels, legends, accessible summaries,
and useful empty states. Avoid implying that a correlation between
practice and a wellness metric proves causation.

### 2.10 Yoga session mode and routine builder

Session mode should include:

-   A guided sequence with current pose, instructions, timer, and
    next/previous controls.
-   Optional rest intervals, breathing cues, and audio accompaniment.
-   Pause, resume, and finish controls.
-   Session completion recorded only when the user completes or
    explicitly finishes the session.
-   Recovery from accidental refresh where feasible.

Allow users to build, reorder, rename, and save their own routines.
Validate sequence contents and keep routines private by default.

### 2.11 Streaks and challenges

Implement a 7-day yoga challenge with:

-   Clear daily goals and completion status.
-   Calendar history and milestone badges.
-   A documented definition of what counts as a completed practice.
-   Timezone-aware daily boundaries based on the user's chosen or
    configured timezone.
-   Idempotent completion endpoints so retries do not double-count a
    day.
-   A humane missed-day policy; do not manipulate users into daily
    engagement.
-   Weekly summaries and opt-in reminders.

Do not calculate streaks solely in the frontend. The backend is the
source of truth.

### 2.12 Calm music and audio studio

Create a dedicated **Calm Music** experience for audio such as:

-   Meditation music.
-   Rain, ocean waves, forest ambience, birds, and gentle nature sounds.
-   Singing bowls and other relaxation tracks, where properly licensed.
-   Sleep ambience and focus/relaxation soundscapes.
-   Guided breathing or meditation audio.

Each track may have title, description, category, duration, cover image,
audio asset, tags, creator/license details, publication status, and
streaming/download permissions.

Audio player requirements:

-   Play/pause, seek, elapsed/remaining time, volume, mute, and track
    duration.
-   Loop-one and optional queue/playlist support.
-   Sleep timer with configurable options.
-   A persistent mini-player during internal navigation where
    technically feasible.
-   A queue or "play next" interaction if playlists are implemented.
-   Accessible controls, keyboard support, and clear playback state.
-   Respect browser autoplay restrictions; never force audio to play on
    page load.
-   Handle loading, buffering, failed playback, unavailable assets, and
    network interruption.
-   Do not start multiple audio instances when navigating between pages.
-   Avoid playing yoga video audio and background music simultaneously
    unless the user explicitly chooses that behavior.
-   Allow users to favorite tracks and view listening history after
    login.
-   Public users can stream public audio; downloads require login and a
    downloadable license.
-   Use original, public-domain, or appropriately licensed music and
    ambience. Record attribution/license details in the admin workflow.

### 2.13 Mindfulness and breathing

Add guided breathing exercises with a calm visual breathing indicator,
configurable duration, optional audio, and reduced-motion support.
Include meditation sessions and nature ambience. Make it clear that
users can stop any exercise at any time.

### 2.14 AI wellness companion

The assistant can answer educational questions about:

-   Yoga poses, sequences, modifications, and precautions.
-   General Ayurveda concepts and traditional herb knowledge.
-   How to use the website and find relevant content.
-   Calm audio and meditation recommendations.
-   General wellness habits and user-selected goals.

Implementation expectations:

-   Keep AI provider credentials on the server, in environment variables
    or a secrets manager.
-   Build a provider-independent service interface so the model/provider
    can be replaced.
-   Ground yoga recommendations in the platform's published content and
    approved reference material when possible.
-   For factual herb/Ayurveda answers, distinguish traditional use from
    scientific evidence, mention uncertainty, and cite sources when
    available.
-   Include relevant contraindications and interaction warnings for
    herbs. Do not give personalized herb dosages, recommend stopping
    prescribed treatment, or claim to diagnose or cure illness.
-   For severe or urgent symptoms, advise seeking qualified medical care
    rather than continuing a wellness chat.
-   Never tell a user to perform a pose that conflicts with known safety
    constraints in their profile.
-   Ask clarifying questions if the request lacks essential context;
    otherwise give concise, useful answers.
-   Treat user prompts and retrieved documents as untrusted input. Do
    not let them override system safety rules.
-   Limit request size, apply rate limits, handle provider timeouts, and
    provide graceful fallbacks.
-   Do not store AI conversation history by default unless it is a
    deliberate, disclosed feature. If enabled, allow users to delete it.
-   Avoid sending profile data to the model unless the user has opted
    into personalization and the data is relevant.

### 2.15 Admin content studio

Admins can:

-   Create, edit, preview, publish, unpublish, and archive content.
-   Upload thumbnails, yoga images, videos, and audio.
-   Manage categories, tags, and curated collections.
-   Set content visibility, streaming permissions, and download
    permissions.
-   Add captions/transcripts and alternative text.
-   Enter source references, attribution, and media licenses.
-   Preview the public detail page before publishing.
-   View aggregate usage metrics such as popular content and completion
    counts, without exposing private user wellness data unnecessarily.

Validate all uploads server-side: MIME type, file extension, size, and
storage key. Use generated storage keys rather than trusting
user-supplied filenames. Never permit executable uploads to be served as
application code.

------------------------------------------------------------------------

## 3. Recommended technical architecture

### 3.1 Repository layout

Use a monorepo unless the existing repository has a clear reason not to:

``` text
pranaveda/
├── agents.md
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml
├── docs/
│   ├── architecture.md
│   ├── api-contracts.md
│   ├── database-schema.md
│   ├── security.md
│   └── deployment.md
├── frontend/
│   ├── package.json
│   ├── next.config.ts
│   └── src/
│       ├── app/
│       ├── components/
│       ├── features/
│       ├── hooks/
│       ├── lib/
│       ├── types/
│       └── styles/
└── backend/
    ├── pom.xml
    └── src/
        ├── main/java/
        ├── main/resources/
        └── test/java/
```

Adjust to the repository's existing structure rather than creating
nested duplicate projects. Keep the actual project root documented.

### 3.2 Frontend

Use:

-   Next.js App Router and TypeScript.
-   Server Components by default; use Client Components only when
    interactivity or browser APIs require them.
-   A consistent, accessible component system. Prefer reusable
    primitives and avoid duplicating button, modal, form, card, and
    loading-state implementations.
-   A validated API client with typed request/response models.
-   A clear feature-oriented structure for auth, yoga library, saved
    items, wellness, audio, admin, and AI chat.
-   URL query parameters for shareable library filters.
-   Server-side rendering for public SEO-friendly content where
    appropriate.
-   Appropriate metadata, canonical URLs, sitemap, and robots
    configuration.
-   Error boundaries and route-level loading states.
-   No secret keys in `NEXT_PUBLIC_*` variables.
-   No trust in frontend-only role checks.

Suggested routes:

``` text
/
 /yoga
 /yoga/[slug]
 /articles/[slug]
 /videos/[slug]
 /calm-music
 /calm-music/[slug]
 /about
 /safety
 /privacy
 /terms
 /login
 /register
 /dashboard                 # login required
 /dashboard/wellness        # login required
 /dashboard/saved           # login required
 /dashboard/history         # login required
 /dashboard/routines        # login required
 /dashboard/challenges      # login required
 /admin                     # ADMIN only
 /admin/content
 /admin/media
 /admin/categories
 /admin/analytics
```

Routes are a proposal; avoid unnecessary duplicate routes if one
well-designed content detail route can serve multiple content types.

### 3.3 Backend

Use:

-   Java with a supported Spring Boot release compatible with the
    selected Java LTS version.
-   Spring Web for REST APIs.
-   Spring Security for authentication and authorization.
-   Spring Data JPA and Hibernate for relational persistence.
-   PostgreSQL as the primary database.
-   Flyway or Liquibase for versioned database migrations; do not rely
    on automatic schema creation in production.
-   Bean Validation for request validation.
-   Springdoc OpenAPI for API documentation.
-   Structured logging and centralized exception handling.
-   Unit and integration tests, including security tests.
-   A service layer for business logic and a repository layer for
    persistence.

Use a modular package structure, for example:

``` text
com.pranaveda
├── config
├── security
├── auth
├── user
├── content
├── category
├── media
├── bookmark
├── wellness
├── session
├── streak
├── routine
├── audio
├── recommendation
├── ai
├── admin
└── common
```

Keep controllers thin. Put authorization-sensitive business rules in the
backend service layer as well as Spring Security configuration. Use DTOs
rather than exposing JPA entities directly.

### 3.4 PostgreSQL and data modelling

Create normalized, indexed tables for the core entities. Exact schema
should be documented before implementation. Likely entities include:

-   `users`
-   `roles` or a constrained role field
-   `refresh_tokens` if using a refresh-token model
-   `content_items`
-   `categories`
-   `tags`
-   join tables for content/category and content/tag relations
-   `media_assets`
-   `bookmarks`
-   `wellness_profiles`
-   `wellness_check_ins`
-   `practice_sessions`
-   `daily_streak_records` or equivalent
-   `challenges` and `challenge_participations`
-   `routines` and `routine_items`
-   `audio_tracks`
-   `audio_listening_history`
-   `ai_conversations` and messages only if history is enabled

Avoid redundant copies of data where relationships are appropriate. Add
unique constraints for email, content slug, bookmarks, and daily
completion records. Add indexes for published content queries,
filtering, foreign keys, and user history. Use UTC timestamps in storage
and apply user timezone rules when deriving daily streak dates.

Store media metadata and object-storage keys in PostgreSQL, not large
image/video/audio binary payloads. Use database transactions for
operations that must update multiple related records consistently.

------------------------------------------------------------------------

## 4. API conventions and authorization

Use a versioned REST prefix such as `/api/v1`. Document every endpoint
in OpenAPI. Return consistent error payloads with a machine-readable
code, a safe human-readable message, and field validation errors when
applicable.

Example endpoint groups:

``` text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

GET    /api/v1/content
GET    /api/v1/content/{slug}
GET    /api/v1/categories
GET    /api/v1/tags

GET    /api/v1/me/bookmarks
POST   /api/v1/me/bookmarks
DELETE /api/v1/me/bookmarks/{contentId}

GET    /api/v1/me/wellness-profile
PUT    /api/v1/me/wellness-profile
GET    /api/v1/me/dashboard
GET    /api/v1/me/practice-sessions
POST   /api/v1/me/practice-sessions
GET    /api/v1/me/streaks
POST   /api/v1/me/challenges/{challengeId}/complete-day

GET    /api/v1/audio
GET    /api/v1/audio/{slug}
POST   /api/v1/me/audio-history
GET    /api/v1/me/audio-history

POST   /api/v1/ai/chat

POST   /api/v1/admin/content
PUT    /api/v1/admin/content/{id}
POST   /api/v1/admin/content/{id}/publish
POST   /api/v1/admin/media/upload
GET    /api/v1/admin/analytics
```

This list is illustrative, not permission to implement every endpoint
before its feature is designed. Finalize request and response DTOs in
`docs/api-contracts.md`.

### Authorization matrix

  Capability                          Anonymous visitor   USER                 ADMIN
  --------------------------------- ------------------- ------ ---------------------
  View published yoga content                       Yes    Yes                   Yes
  Stream public videos/audio                        Yes    Yes                   Yes
  Search/filter public content                      Yes    Yes                   Yes
  Download eligible media                            No    Yes                   Yes
  Save/bookmark content                              No    Yes                   Yes
  View/edit own wellness profile                     No    Yes   As own profile only
  View own dashboard/history                         No    Yes   As own profile only
  Create personal routines                           No    Yes                   Yes
  Manage/publish platform content                    No     No                   Yes
  Manage media and taxonomy                          No     No                   Yes
  View aggregate admin analytics                     No     No                   Yes

An administrator should not automatically gain unrestricted access to
every user's private wellness records. Keep administrative content
management separate from personal data access.

------------------------------------------------------------------------

## 5. Security, privacy, and reliability

-   Enforce authorization on every protected backend endpoint and every
    media-download request.
-   Ensure users cannot access another user's profile, bookmarks,
    history, routines, or check-ins by changing an ID.
-   Use secure CORS rules for known frontend origins; do not use
    permissive wildcard credentialed CORS in production.
-   Protect cookie-based authentication against CSRF where relevant and
    configure `SameSite` intentionally.
-   Validate and normalize all input; escape output in the correct
    context.
-   Rate-limit login, registration, password reset, downloads, and AI
    endpoints where possible.
-   Use safe error responses; never expose stack traces, SQL details,
    secrets, or internal provider prompts.
-   Keep credentials in environment variables or a secrets manager.
    Commit only `.env.example` with placeholders.
-   Add upload limits, content-type validation, and malware scanning if
    the deployment environment supports it.
-   Apply database migrations in a controlled deployment process and
    configure backups for production.
-   Avoid logging passwords, tokens, private health data, AI secrets, or
    raw sensitive request bodies.
-   Provide privacy, retention, export, and deletion behavior
    appropriate to the collected information.
-   Use HTTPS in production.
-   Use a restrictive Content Security Policy and appropriate security
    headers where feasible.

------------------------------------------------------------------------

## 6. UI design system

### Visual direction

-   Backgrounds: warm ivory, soft neutral surfaces, and occasional muted
    sage sections.
-   Primary actions: deep forest/sage green with sufficient contrast.
-   Typography: readable sans-serif for interface text; optionally a
    restrained editorial typeface for large headings.
-   Cards: clean surfaces, subtle borders/shadows, comfortable corner
    radii.
-   Imagery: genuine yoga/nature photography with consistent crops and
    descriptive alt text.
-   Layout: generous whitespace, clear hierarchy, and restrained
    decoration.
-   Motion: short, subtle transitions; disable or reduce nonessential
    animation when requested by the operating system.

Do not hardcode colors inconsistently across components. Define design
tokens and reuse them.

### Core UI components

Build reusable components for:

-   Header/navigation and mobile navigation.
-   Footer.
-   Search and filter toolbar.
-   Yoga/content cards and detail layout.
-   Video player wrapper.
-   Calm audio player and persistent mini-player.
-   Bookmark and download controls.
-   Login/register forms.
-   Accessible modal/dialog and confirmation dialog.
-   Dashboard statistic cards and charts.
-   Streak calendar and challenge progress.
-   Wellness profile forms.
-   AI chat panel with clear loading/error states.
-   Admin data tables, editors, media uploader, and publication
    controls.
-   Skeleton loaders, empty states, error states, and toast/inline
    feedback.

Use real labels, keyboard focus indicators, semantic HTML, and
accessible names. Do not use color alone to communicate status.

### Responsive behavior

Test at small mobile, large mobile, tablet, laptop, and wide desktop
widths. On mobile, ensure media players, filters, navigation, and
dashboard charts remain usable without horizontal overflow.

------------------------------------------------------------------------

## 7. Media storage and delivery

Define a storage abstraction so the app can use an S3-compatible object
store in development and a compatible provider in production without
rewriting business logic.

-   Keep bucket credentials server-side.
-   Store object keys, MIME types, sizes, duration, license information,
    and access policy in the database.
-   Generate unique object keys; do not use original filenames as
    storage paths.
-   Prefer CDN delivery for public assets and short-lived signed URLs
    for protected assets.
-   Handle video/audio range requests if the chosen delivery method
    supports streaming seeking.
-   Add thumbnail/poster support and captions/transcripts where
    applicable.
-   Add media duration and file size metadata to improve user
    experience.
-   Ensure deleting or archiving content does not leave unauthorized
    public media links.
-   Document the local development storage setup and the production
    environment variables.

Do not assume a particular cloud provider until the repository and
deployment target are confirmed.

------------------------------------------------------------------------

## 8. Testing strategy

Write tests as features are implemented, not at the very end.

### Backend tests

-   Unit-test service logic and validation.
-   Integration-test repository queries and migrations against
    PostgreSQL or a compatible test environment.
-   Test anonymous access to published content.
-   Test that anonymous access to drafts and archived content is denied.
-   Test that anonymous users cannot bookmark, download, or access
    personal dashboards.
-   Test that one user cannot read or mutate another user's data.
-   Test role escalation attempts and all admin endpoints.
-   Test token expiry, refresh, logout, and invalid credentials.
-   Test pagination, filters, sorting, and malformed query parameters.
-   Test duplicate bookmarks and repeated challenge/session completion
    requests.
-   Test timezone and daylight-saving edge cases for streak
    calculations.
-   Test upload validation, signed URL expiry, and download permissions.
-   Test AI provider timeouts, rate limits, invalid output, and safety
    fallback behavior.

### Frontend tests

-   Test public browsing without login.
-   Test login/register validation and redirect behavior.
-   Test the login prompt for a protected action and return to the
    original page.
-   Test search/filter/sort and URL state.
-   Test bookmark and download states.
-   Test audio playback controls, sleep timer, navigation persistence,
    and playback failures.
-   Test responsive navigation, keyboard controls, and reduced-motion
    behavior.
-   Test dashboard empty, loading, and populated states.
-   Test admin publishing and upload flows.

### Quality gates

Before considering a milestone complete:

1.  Run formatting and lint checks.
2.  Run type checking.
3.  Run relevant unit and integration tests.
4.  Run a production build.
5.  Fix errors rather than suppressing them without justification.
6.  Update documentation and `.env.example` when configuration changes.
7.  Verify the app starts from the documented clean setup.

------------------------------------------------------------------------

## 9. Development and deployment

Provide a documented local setup with:

-   Supported Java version and Maven wrapper.
-   Supported Node.js version and package manager.
-   PostgreSQL configuration.
-   Local media storage or an S3-compatible development service.
-   Optional AI provider configuration.
-   `.env.example` files for frontend and backend.
-   Docker Compose for dependencies where useful.
-   Database migrations and a safe, optional seed-data process.
-   A health endpoint that does not leak configuration or secrets.
-   API documentation and example development accounts only when safe
    and clearly marked as local-only.

Do not hardcode production credentials or commit real user data. Do not
create a default production admin with a known password. Provide a
secure first-admin bootstrap procedure using environment configuration
or a controlled command.

Deployment documentation must cover environment variables, CORS,
database migrations, storage permissions, HTTPS, logging, backups, and
rollback strategy. Keep the app compatible with the actual hosting
platform rather than assuming a specific provider.

------------------------------------------------------------------------

## 10. Implementation roadmap

Follow this order. Do not attempt to generate the whole application in
one giant pass.

### Phase 0 --- Inspect and plan

1.  Inspect the repository and existing code before modifying anything.
2.  Confirm the root layout, installed versions, and available tools.
3.  Create `docs/architecture.md`, `docs/database-schema.md`,
    `docs/api-contracts.md`, and `docs/security.md`.
4.  Decide token/session strategy, storage abstraction, media access
    rules, and AI provider interface.
5.  Present a short implementation plan and note any unresolved choices.
    Use reasonable, documented defaults rather than blocking on
    nonessential questions.

**Exit criteria:** Architecture, roles, access rules, data model, and
milestones are documented.

### Phase 1 --- Project foundation

1.  Scaffold frontend and backend.
2.  Configure formatting, linting, environment variables, PostgreSQL,
    migrations, and health checks.
3.  Add a consistent API error model and frontend API client.
4.  Set up local development instructions and basic CI checks.

**Exit criteria:** Both applications start cleanly, connect to the
database, and have a documented setup.

### Phase 2 --- Authentication and authorization

1.  Implement registration, login, logout, refresh/session behavior, and
    current-user endpoint.
2.  Implement `USER` and `ADMIN` authorization.
3.  Build login/register pages and protected-action prompts.
4.  Test direct API access and user-data isolation.

**Exit criteria:** Public browsing remains public, protected operations
are protected, and authorization tests pass.

### Phase 3 --- Public yoga library and admin publishing

1.  Implement content/category/tag schema and migrations.
2.  Build admin create/edit/preview/publish/archive flows.
3.  Build public home, listing, detail, search, filters, and pagination.
4.  Add metadata and SEO support.
5.  Add public video streaming and media permission rules.

**Exit criteria:** Admin can publish content; anonymous visitors can
browse published items but cannot see drafts.

### Phase 4 --- Media and downloads

1.  Implement media metadata and storage abstraction.
2.  Add secure admin uploads for images, video, and audio.
3.  Implement public streaming and authenticated download authorization.
4.  Test content type, file size, license, URL expiry, and access
    restrictions.

**Exit criteria:** Media access follows the permission matrix and
secrets remain server-side.

### Phase 5 --- Member features and dashboard

1.  Implement bookmarks and Saved Library.
2.  Implement wellness profile and privacy controls.
3.  Implement practice sessions, dashboard summaries, and charts.
4.  Implement streaks and the 7-day challenge.
5.  Implement personal routines and session mode.

**Exit criteria:** Member data is private, session records are reliable,
and streaks are calculated on the backend.

### Phase 6 --- Calm music and mindfulness

1.  Build the Calm Music library and audio detail pages.
2.  Implement player controls, queue/loop where planned, sleep timer,
    and persistent mini-player.
3.  Add favorites and listening history.
4.  Add breathing exercises and meditation audio.
5.  Test navigation, browser autoplay rules, interruption, and mobile
    playback.

**Exit criteria:** Audio works across routes and devices without
duplicate players or unwanted autoplay.

### Phase 7 --- AI wellness companion

1.  Implement a provider-independent backend AI service.
2.  Curate approved reference material and connect relevant published
    content.
3.  Add chat UI, content recommendations, source references, and clear
    uncertainty handling.
4.  Implement privacy controls, request limits, timeouts, and safety
    fallbacks.
5.  Test medical-boundary prompts, unsafe herb requests, prompt
    injection, and provider failure.

**Exit criteria:** AI is useful, grounded where possible,
privacy-conscious, and does not claim to diagnose or prescribe.

### Phase 8 --- Polish and release

1.  Refine visual consistency, responsiveness, accessibility, empty
    states, and motion.
2.  Add analytics that respect privacy and collect only what is needed.
3.  Complete security and regression tests.
4.  Verify production build and clean installation.
5.  Document deployment, backups, admin bootstrap, and troubleshooting.
6.  Review every route and endpoint against the access matrix.

**Exit criteria:** A new developer can follow the documentation to run
the project; core user journeys work end-to-end; no known critical
authorization or privacy issues remain.

------------------------------------------------------------------------

## 11. Working rules for the coding agent

-   Read this file and inspect existing code before starting a task.
-   Work in small, coherent milestones. Do not replace working
    architecture without a concrete reason.
-   Do not fabricate successful test results, deployment results, API
    behavior, or environment values.
-   Never leave a feature represented only by a button or mock UI when
    it is expected to work end-to-end.
-   Avoid placeholder data in production paths. Seed data is acceptable
    for local development and must be clearly identified.
-   Use typed DTOs and consistent API response/error contracts.
-   Add database migrations whenever the schema changes.
-   Keep secrets, authorization decisions, and business-critical
    calculations on the server.
-   Do not duplicate business rules in frontend and backend when the
    backend must be authoritative.
-   Document meaningful trade-offs and assumptions.
-   Do not install unnecessary libraries; prefer stable, maintained
    dependencies.
-   When a feature is blocked by missing credentials or external
    services, implement a clean interface, document the configuration,
    and provide a safe local fallback where possible.
-   Never claim a task is complete until its acceptance criteria and
    relevant tests have been checked.
-   At the end of each milestone, report: what was built, key files
    changed, how to run it, tests executed and their actual results, and
    any known limitations.
-   Keep the README, architecture notes, API documentation, and
    environment examples synchronized with the code.

------------------------------------------------------------------------

## 12. Definition of done

The platform is not complete until all of the following are true:

-   Anonymous visitors can view published yoga posts, images, and videos
    without login.
-   Anonymous visitors can browse and stream eligible calm music without
    login.
-   Login is required for downloads, bookmarks, personal wellness data,
    dashboard, streaks, history, and saved routines.
-   Admin publishing and media management work end-to-end.
-   Backend authorization prevents users from accessing each other's
    personal data.
-   Yoga content search, filters, sorting, and pagination work.
-   Streaks and session tracking are calculated reliably on the server.
-   The audio player, sleep timer, and navigation behavior work without
    duplicate playback.
-   The AI assistant has privacy controls, safety boundaries, error
    handling, and documented configuration.
-   Database migrations, tests, environment examples, and
    setup/deployment documentation are included.
-   The responsive UI is accessible, visually consistent, and usable on
    mobile and desktop.
-   No secrets or real personal data are committed to source control.

**Build the product for trust first, then polish.** The core promise is
that anyone can explore yoga freely, while signing in unlocks a private,
personalized wellness journey.

---

## 13. Camera-based AI Yoga Posture Coach (MediaPipe)

Implement a camera-assisted posture guidance feature using **MediaPipe Pose Landmarker for Web**. This feature must be integrated into the existing product roadmap, not built as an unrelated demo.

### Cost and licensing requirements

- Use the official `@mediapipe/tasks-vision` package for browser-based pose estimation.
- MediaPipe's open-source code is available under the Apache 2.0 license, but verify the license and terms for every selected pretrained model, model asset, and redistributed dependency before release.
- Prefer local browser inference. Do not introduce a paid pose-estimation API or require a GPU server for the initial implementation.
- The library itself does not charge a per-frame API fee for local inference. Normal costs may still apply for hosting the website, delivering model assets, and supporting the rest of the application.
- Review current upstream documentation and licensing before upgrading dependencies or distributing the product commercially. Preserve required license and attribution notices.
- MediaPipe documentation notes that usage/performance metrics may be sent to Google. Explain relevant data practices in the privacy notice and obtain any consent required by applicable law. Do not claim that the whole dependency has zero telemetry.

### User experience and access

- Add a **Check my posture** or **Yoga Coach** action to supported yoga/asana detail pages.
- A user must explicitly start the camera and grant browser permission. Provide a clear stop-camera control and explain what is processed locally.
- Do not request camera access automatically on page load.
- Do not upload, record, or persist camera frames by default.
- Public visitors may try the live posture guide without creating an account, unless a later product decision explicitly changes this rule. Login is required to save the resulting session summary to the user's personal dashboard.
- Provide a fallback for browsers/devices without camera access or adequate performance: clear instructions, a reference image/video, and static pose guidance.
- Explain camera positioning and lighting. Ask users to position the full body within the frame and show a recommended front or side view for the selected asana.
- Handle camera denial, unavailable devices, lost camera tracks, model loading failures, low-confidence landmarks, and unsupported browsers without crashing the page.
- Stop camera tracks and release resources when the user stops the feature, leaves the page, or the component unmounts.

### Frontend implementation

- Run MediaPipe inference in the Next.js browser client, not in a Server Component. Load the package and model only when the user opens the coach feature.
- Follow the official MediaPipe Pose Landmarker web documentation for package setup, model assets, `LIVE_STREAM` or video processing, and result handling.
- Prefer a Web Worker for inference when practical so processing does not block the UI thread. Measure performance on representative mobile and laptop hardware.
- Use `requestVideoFrameCallback` where supported or a throttled animation-frame loop as a fallback. Avoid processing the same frame repeatedly.
- Render the live camera video and landmark skeleton overlay in a properly aligned canvas layer. Correctly account for mirroring and responsive resizing.
- Display model loading, camera setup, pose-detected, low-confidence, feedback, paused, and stopped states.
- Keep the UI calm, accessible, and consistent with the product design system. Support keyboard controls, visible focus, reduced motion, and responsive layouts.
- Do not store raw camera frames or landmarks in browser storage. Keep temporary frame data in memory only.

### Pose analysis engine

Pose estimation detects approximate body landmarks; it does **not** determine by itself whether an asana is correct. Implement a separate, testable, pose-specific analysis module.

- Start with three reviewed poses: Mountain Pose (Tadasana), Tree Pose (Vrikshasana), and Warrior II (Virabhadrasana II).
- Define a separate configuration for each pose, including required landmarks, recommended camera view, expected alignment ranges, allowed variations, confidence thresholds, and safety notes.
- Use landmark visibility/presence confidence and temporal stability checks before issuing a correction.
- Compute joint angles and relative positions from landmarks with guards against missing points, near-zero vector lengths, and invalid numeric values.
- Use smoothing and persistence thresholds to reduce flickering feedback. Do not issue a correction from one noisy frame.
- Do not treat 2D image coordinates as real anatomical measurements. Use world landmarks where appropriate, while documenting their limitations.
- If the camera angle is unsuitable, important landmarks are occluded, or confidence is too low, show a positioning/help message rather than a posture score.
- Support legitimate variations and beginner modifications; never assume a single reference skeleton suits every body.
- Make rules and thresholds configurable and covered by unit tests. Do not embed all pose logic directly inside React components.
- Keep the analysis deterministic and separate from any language model. An LLM may phrase an already-approved feedback cue, but must not invent joint measurements or decide posture correctness from unstructured guesses.
- Have qualified yoga instructors review pose rules and safety cues before presenting them as coaching guidance.

### Feedback and scoring

- Provide short, actionable, non-alarming cues, such as “Move back so your feet are visible” or a pose-specific alignment reminder validated by an instructor.
- A posture score is optional and must be described as an estimate of alignment against the app's defined criteria, not a medical assessment or guarantee of correct/safe practice.
- If essential landmarks are missing, do not calculate or display a misleading score.
- If scoring is implemented, document each criterion, its weight, the scoring formula, and the minimum confidence required.
- Do not claim the feature prevents injuries, diagnoses conditions, or guarantees an injury-free practice.
- Provide a way to stop the session immediately and advise users not to force a movement that causes pain.

### Backend and persistence

- The browser should perform frame-by-frame inference. Do not stream camera frames to Spring Boot.
- Send only a compact session summary to the backend if the signed-in user chooses to save it. Possible fields include pose ID, duration, completion status, timestamp, selected variation, and a small set of non-sensitive summary metrics.
- Treat client-supplied metrics as untrusted input; validate their shape and allowed ranges. Never use them for medical decisions.
- Protect saved session summaries with the same user-ownership authorization as other wellness data.
- Store pose definitions and instructor-reviewed rules in version-controlled configuration or a documented database model. Avoid storing sensitive raw camera data.
- Make session persistence optional and provide clear privacy information.

### Validation and testing

- Unit-test angle calculations, missing/occluded landmarks, low confidence, invalid coordinates, smoothing, threshold boundaries, and each pose's rules.
- Test permission denied, no camera, camera in use by another app, camera disconnect, model-load failure, route navigation during a session, and repeated start/stop.
- Test mirrored previews, different aspect ratios, mobile orientation changes, varied lighting, different clothing, partial occlusion, and body shapes.
- Compare feedback with qualified yoga-instructor assessments on a carefully collected and consented test set before making accuracy claims.
- Measure inference latency, dropped frames, memory usage, and responsiveness on mid-range devices.
- Do not collect identifiable video for testing without informed consent, a defined retention policy, and appropriate safeguards.
- Include this feature in security, privacy, accessibility, and end-to-end regression testing.

### Acceptance criteria

The feature is ready for its first release when:

1. A user can deliberately enable and stop the camera.
2. The app can load MediaPipe and draw body landmarks over the live video.
3. The interface clearly handles missing/low-confidence landmarks and camera positioning.
4. At least the three initial poses have separate, testable analysis rules reviewed by a qualified yoga instructor.
5. Feedback is stable across multiple frames and avoids unsupported certainty.
6. No camera frames are uploaded or persisted by default.
7. A signed-in user can optionally save a session summary, and cannot access another user's summaries.
8. Camera resources are released correctly and the rest of the website remains responsive.
9. The feature's dependency/model licensing, privacy notes, limitations, and setup instructions are documented.

Add this feature to the roadmap after the public yoga library and media foundations are in place, and before or alongside the later wellness-dashboard polish. Do not block the core site on advanced posture scoring: deliver the landmark-overlay prototype first, then introduce reviewed rules and coaching in measured increments.

