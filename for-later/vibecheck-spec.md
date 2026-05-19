# VibeCheck — Application Specification

A stack-agnostic functional spec for recreating VibeCheck. Choose any backend, frontend, database, and hosting stack when implementing.

---

## 1. Concept

VibeCheck is a **weather-aware social outfit discovery platform**. Users post outfits tagged with season, gender category, temperature, and hashtags. Other users browse outfits as a swipeable card stack (Tinder-style), like or skip them, follow creators, and filter recommendations by local weather. Admins moderate users, outfits, and reports.

Core value: surfacing outfits relevant to the viewer's current weather and personal style preferences.

---

## 2. User Roles

- **Guest** — can view landing/about/login/register pages only.
- **Regular** — full social/discovery features.
- **Admin** — moderation tools over users, outfits, tags, and reports.

---

## 3. Data Model

### User

- `id`, `username` (unique, 4–30 chars), `email` (unique, 3–254 chars), `password_hash`
- `date_created`, `image_file` (profile picture reference), `description` (≤2200 chars)
- `default_latitude`, `default_longitude`, `default_city`, `default_country`
- `preferred_temperature_scale` — `CELSIUS` | `FAHRENHEIT`
- `role` — `REGULAR` | `ADMIN`

### Outfit

- `id`, `name`, `description` (≤320 chars), `date_created`
- `gender` — `masculine` | `feminine` | `unisex`
- `season` — `winter` | `spring` | `summer` | `fall`
- `temperature` (float, in user's preferred scale)
- `user_id` (FK → User, creator)

### Image

- `id`, `image_file` (filename in object storage), `date_created`, `outfit_id` (FK → Outfit)
- One outfit has many images.

### Tag

- `id`, `name` (unique). Parsed from outfit description hashtags. Auto-created on outfit creation.

### Filter (per user; saved discovery preferences)

- `id`, `name`, `is_default` (bool), `user_id`
- `sort_by` — `random` | `top` | `recent`
- `gender` — comma-separated list of allowed values
- `season` — comma-separated list of allowed values
- `use_location` (bool) — if true, derive temperature range from current weather
- `min_temperature`, `max_temperature` (float)

### Relationships (join tables)

- **User_followers** — (follower_id, followed_id), self-referential many-to-many.
- **Outfit_likes** — (user_id, outfit_id).
- **Outfit_swipes** — (user_id, outfit_id) — records views without like.
- **Outfit_tag** — (outfit_id, tag_id).
- **Filter_tag** — (filter_id, tag_id).

### Cascade behavior

- Deleting a user deletes their outfits and filters.
- Deleting an outfit deletes its images and tag links.

---

## 4. Authentication

- Session-based auth (HTTP-only cookie). All API calls from frontend send credentials.
- Passwords stored hashed (bcrypt or equivalent).
- Login accepts username OR email + password.
- Password reset: email a time-limited signed token; user submits new password with token.
- Endpoint to check login status returns the current user payload (used by frontend on app boot).

---

## 5. API Endpoints

REST-style JSON API. CORS enabled with credentials. All `/admin/*` routes require ADMIN role; most non-auth routes require login.

### Users

| Method | Path                                            | Purpose                                           |
| ------ | ----------------------------------------------- | ------------------------------------------------- |
| POST   | `/users/register`                               | Create account, auto-login, create default filter |
| POST   | `/users/login`                                  | Login by username or email                        |
| POST   | `/users/logout`                                 | End session                                       |
| GET    | `/users/loginStatus`                            | Return current user or unauthenticated            |
| GET    | `/users/getUser?username=X`                     | Public profile                                    |
| GET    | `/users/searchUsers/:term`                      | Autocomplete username search                      |
| DELETE | `/users/deleteAccount`                          | Delete self + all data                            |
| POST   | `/users/updateProfileImage`                     | Upload avatar (base64 or multipart)               |
| POST   | `/users/passwordResetRequest`                   | Send reset email                                  |
| GET    | `/users/checkForValidPasswordResetToken/:token` | Validate token                                    |
| POST   | `/users/setNewPassword/:token`                  | Set password via token                            |
| POST   | `/users/changePassword`                         | Change password (requires current)                |
| PUT    | `/users/changeUsername`                         | Update username                                   |
| PUT    | `/users/changeEmail`                            | Update email                                      |
| PUT    | `/users/follow`                                 | Follow user                                       |
| PUT    | `/users/unfollow`                               | Unfollow user                                     |
| PUT    | `/users/removeFollower/:username`               | Remove a follower                                 |
| POST   | `/users/setDefaultLocation`                     | Save lat/lon/city/country                         |
| POST   | `/users/report`                                 | Report a user                                     |
| POST   | `/users/reportProblem`                          | Report app issue                                  |

### Outfits

| Method | Path                                                                | Purpose                                                                                                                                                     |
| ------ | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/outfits/create`                                                   | Create outfit (enforces daily limit of 3)                                                                                                                   |
| PUT    | `/outfits/update`                                                   | Edit metadata                                                                                                                                               |
| DELETE | `/outfits/delete/:id`                                               | Delete outfit                                                                                                                                               |
| GET    | `/outfits/getOutfit/:id`                                            | Full outfit details                                                                                                                                         |
| GET    | `/outfits/getSwipableOutfits`                                       | Paginated discovery stack. Query: `gender`, `season`, `minTemperature`, `maxTemperature`, `tags`, `sort_by`. Excludes own outfits and already-swiped items. |
| GET    | `/outfits/getUserOutfits?username=X&listType=outfits\|likes&page=Y` | User's outfits or likes (9 per page)                                                                                                                        |
| PUT    | `/outfits/like`                                                     | Like outfit (also records swipe)                                                                                                                            |
| PUT    | `/outfits/unlike`                                                   | Unlike (supports bulk)                                                                                                                                      |
| PUT    | `/outfits/swipe`                                                    | Record swipe without like                                                                                                                                   |
| PUT    | `/outfits/updateFilter`                                             | Save user's filter preferences                                                                                                                              |
| POST   | `/outfits/report`                                                   | Report outfit                                                                                                                                               |

### Images

- `POST /images/uploadBase64` — accepts base64 image, resizes, stores in object storage, returns filename reference.

### Weather

- `GET /weather/getWeatherData?latitude=X&longitude=Y` — proxy to weather provider; returns current + forecast.
- `POST /weather/setPreferredTemperatureScale` — `CELSIUS` or `FAHRENHEIT`.

### Admin

| Method | Path                         | Purpose                    |
| ------ | ---------------------------- | -------------------------- |
| GET    | `/admin/getAllUsers`         | List users                 |
| GET    | `/admin/getUser/:id`         | User detail                |
| DELETE | `/admin/deleteUser/:id`      | Delete user                |
| GET    | `/admin/getAllOutfits`       | List outfits               |
| GET    | `/admin/getOutfit/:id`       | Outfit detail              |
| DELETE | `/admin/deleteOutfit/:id`    | Delete outfit              |
| GET    | `/admin/getTags`             | All tags with usage counts |
| GET    | `/admin/getAllOutfitReports` | Outfit reports             |
| GET    | `/admin/getAllUserReports`   | User reports               |
| GET    | `/admin/getProblems`         | App problem reports        |

---

## 6. Frontend Pages & Routes

### Public

- `/` — landing page
- `/about` — about page
- `/login` — login form (includes password-reset request modal)
- `/register` — signup form
- `/reset_password/:token` — set new password

### Authenticated (auth guard)

- `/app/cards/outfits` — primary discovery view: swipeable card stack with filter sidebar/modal
- `/app/outfits/:id` — outfit detail (images carousel, metadata, creator, like/report)
- `/app/profiles/:username/outfits` — user's outfits (paginated, infinite scroll)
- `/app/profiles/:username/likes` — user's liked outfits
- `/app/settings` — settings hub
  - `/app/profile/username` — change username
  - `/app/profile/email` — change email
  - `/app/profile/password` — change password
  - `/app/account/delete` — delete account

### Admin (admin guard)

- `/admin` — dashboard
- `/admin/users`, `/admin/users/:id`
- `/admin/outfits`
- `/admin/outfit_reports`, `/admin/user_reports`
- `/admin/tags`
- `/admin/problems`

---

## 7. Key User Flows

### Registration

1. Submit username, email, password.
2. Server creates user + a default Filter (random sort, all genders/seasons, location-based temps).
3. Auto-login, redirect to discovery view.

### Discovery / Swiping

1. On entering discovery view, frontend:
   - Reads browser geolocation (fallback to user's saved default location).
   - Fetches current weather; derives season + temperature range.
   - Loads user's saved filter and merges with weather-derived temps if `use_location`.
   - Fetches swipable outfits.
2. User swipes:
   - Right / right-arrow / like button → record like + swipe.
   - Left / left-arrow → record swipe only.
   - Up-arrow / space → open outfit detail.
3. When stack runs low, fetch next page.

### Create Outfit

1. Open modal; select up to N images (cropped/resized client-side).
2. Each image uploaded via `/images/uploadBase64` → returns filename.
3. Submit outfit with name, description (hashtags parsed → tags), gender, season, temperature, image filenames.
4. Daily limit: 3 outfits per user per day.

### Social

- View any public profile: username, description, follower/following counts, outfit count, follow button.
- Follow/unfollow; remove followers from your own followers list.
- Tabs on profile: their outfits vs. their likes, both paginated 9 per page.

### Account Management

- Change username, email, password (password change requires current password).
- Upload/crop profile picture.
- Set default location and temperature scale.
- Delete account (cascades all owned data).

### Password Reset

- Request → email sent with signed token link.
- Token validated server-side before allowing password set.

### Admin

- List/inspect/delete users and outfits.
- Triage reports (user reports, outfit reports, app problems).
- Manage tags with usage counts.

---

## 8. External Integrations

- **Weather provider** (e.g., OpenWeather): current conditions + forecast by lat/lon. Server-side proxy hides API key.
- **Object storage** (e.g., S3, Cloudflare R2): stores profile pictures and outfit images. Public read via CDN URL; uploads authenticated.
- **Email/SMTP** (e.g., Gmail SMTP, SendGrid): sends password reset emails.
- **Browser geolocation**: client-side `navigator.geolocation` for current lat/lon.

---

## 9. Configuration / Environment

Required environment variables (names are illustrative):

- Database connection URL
- Session secret / signing secret (for cookies and reset tokens)
- Weather API key
- Object storage credentials + bucket name + public base URL
- SMTP host, port, username, password, from-address
- Frontend: backend base URL, public image CDN URL

Environment tiers used historically: local (SQLite + local file storage), staging, production.

---

## 10. Business Rules & Limits

- Max **3 outfit creations per user per day**.
- Outfit query cap: 1000 results per fetch.
- Max 10 hashtags per outfit.
- Max 50 swipes per session before fetching new page.
- Pagination: 9 items per page on profile lists.
- Field limits:
  - Username 4–30, Email 3–254, Password 8–128.
  - Outfit description ≤320, User description ≤2200.
- Image processing: outfit images resized to ~768×1280; avatars to ~200×200.
- Discovery excludes: outfits created by current user; outfits already swiped (when filter enables this).

---

## 11. Frontend UX Notes

- Mobile-first card layout (~380px card width).
- Touch gestures for swiping; keyboard shortcuts mirror gestures.
- Infinite scroll on profile outfit/likes lists.
- Modals for create/update/delete/report flows and follower lists.
- Weather widget visible on discovery view (icon + temp in user's preferred scale).
- Multi-language support (i18n) and a language selector.
- Loading spinners on async actions.

---

## 12. Non-Goals / Not Implemented

- No background jobs or scheduled tasks; all operations are synchronous request/response.
- No realtime/websocket features.
- No payments, no DMs, no comments thread.
- No server-rendered HTML — backend is a JSON API; frontend is a SPA.

---

## 13. Tooling & Capabilities Needed

Whatever stack you pick, the implementation needs equivalents for the following capabilities. These are stack-agnostic — pick the idiomatic library/tool in your chosen ecosystem.

### Backend capabilities

- **Web framework** with routing, middleware, JSON request/response, CORS with credentials.
- **ORM or query builder** with migrations (schema versioning + up/down).
- **Database**: relational (PostgreSQL recommended for prod; SQLite acceptable for local dev).
- **Password hashing**: bcrypt, argon2, or scrypt.
- **Session management**: signed HTTP-only cookies, server-side session store (in-memory for dev, Redis or DB-backed for prod).
- **Signed token generator** for password reset (time-limited, tamper-proof — e.g., JWT or HMAC-signed payload).
- **Email/SMTP client** with template support.
- **HTTP client** for outbound weather API calls.
- **S3-compatible storage SDK** for image uploads (works with AWS S3, Cloudflare R2, MinIO).
- **Image processing library** for resize/crop (e.g., Pillow, sharp, ImageMagick bindings).
- **Input validation** library (schema-based: pydantic, zod, joi, etc.).
- **Environment variable loader** with `.env` file support.
- **Logging** with leveled output and structured (JSON) format for prod.
- **Rate limiting** middleware (for login, registration, password reset endpoints).

### Frontend capabilities

- **SPA framework** with router, guards, and module/component model.
- **HTTP client** with interceptor support for attaching credentials and handling 401s globally.
- **State store** (can be simple service-singletons; no need for Redux-scale state).
- **Form handling** with validation (reactive forms or equivalent).
- **CSS framework** for layout (Bootstrap, Tailwind, or similar) + custom theming variables.
- **Touch/gesture library** for swipeable cards (Hammer.js or equivalent).
- **Image cropper** for profile/outfit uploads.
- **Range slider** component for temperature filter.
- **Infinite scroll** helper for paginated lists.
- **i18n library** for multi-language support.
- **Browser APIs used**: `navigator.geolocation`, `FileReader` (for base64 upload).

### Dev tooling (recommended regardless of stack)

- **Package manager** appropriate to the stack.
- **Linter + formatter** (ESLint/Prettier, Ruff/Black, gofmt, etc.) wired into pre-commit.
- **Type checking** if the language supports it (TypeScript, mypy, etc.).
- **Hot reload / dev server** for both backend and frontend.
- **Git pre-commit hooks** (e.g., husky, pre-commit) for lint + format.
- **`.editorconfig`** for consistent whitespace.
- **README** with setup steps and env var template (`.env.example`).
- **Makefile / npm scripts / justfile** for common commands: `dev`, `build`, `migrate`, `seed`, `test`, `lint`.

### Testing (only if you want it — original codebases minimally tested)

- Unit test runner for backend (mocking HTTP/storage/email).
- Component/E2E framework for frontend (Playwright, Cypress).
- Seed/factory utilities for test data.

### Local development environment

- **Containerization** via Docker + docker-compose for: database, Redis (if used), MinIO or LocalStack (S3-compatible local storage), Mailhog or similar (local SMTP capture). Lets contributors run `docker compose up` without external accounts.
- **Database seed script** with at least one admin user, a few regular users, sample outfits, sample tags.
- **Fixture images** for seeded outfits.

### Deployment / hosting

- **Backend host**: any platform with persistent state and outbound HTTP (Fly.io, Render, Railway, AWS ECS, Cloud Run). Needs env-var injection and DB connection.
- **Frontend host**: any static-site host (Cloudflare Pages, Vercel, Netlify, S3+CloudFront).
- **Object storage**: S3, R2, GCS, or compatible — must support public-read for image URLs.
- **Managed Postgres** (Neon, Supabase, RDS, Fly Postgres).
- **Managed email** (SES, Postmark, SendGrid, Resend) for prod password reset emails.
- **CI/CD**: build, lint, test, deploy on push to main. GitHub Actions or equivalent.
- **Secrets management**: platform's env-var UI or a dedicated vault. Never commit secrets.
- **Domain + TLS**: HTTPS required for cookie-based auth (SameSite/Secure cookies).
- **Health check endpoint**: `GET /` returns a simple OK string, used by the platform's health probe.

### Observability (recommended for prod)

- **Error tracking** (Sentry, Rollbar, or similar) on both backend and frontend.
- **Application logs** shipped to a queryable store.
- **Uptime monitoring** hitting the health endpoint.

### Security checklist

- HTTPS everywhere (HSTS in prod).
- Cookies: `HttpOnly`, `Secure`, `SameSite=Lax` (or `None` if frontend and backend are on different domains, in which case also configure CORS `allowCredentials`).
- CSRF protection for state-changing requests if using cookie auth from a different origin.
- Server-side validation of every input — never trust client-side limits.
- Server-side authorization checks on every protected endpoint (don't rely on frontend guards alone).
- Server-enforced daily outfit limit (not client-enforced).
- Server-side admin role check on `/admin/*` routes.
- Password reset tokens: single-use, short TTL (e.g., 30 min), invalidated after use.
- Image uploads: validate MIME and re-encode through image library to strip EXIF/payloads; cap file size.
- Rate-limit auth endpoints to mitigate brute-force.
- Never log passwords, tokens, or session cookies.

---

## 14. Suggested Build Order (when recreating)

1. Repo scaffold: backend + frontend skeletons, `.env.example`, lint/format, docker-compose for DB + local S3 + local SMTP.
2. Data model + migrations.
3. Auth (register, login, session, logout, login status, password hashing, rate limits).
4. Profile read/update + avatar upload + object storage wiring + image resize pipeline.
5. Outfit CRUD + image upload + hashtag parsing + tag creation.
6. Weather proxy endpoint + filter model + discovery endpoint with all query params.
7. Likes / swipes / follows.
8. Password reset email flow (with email capture in local dev).
9. Admin endpoints + role guard.
10. Reports (user/outfit/problem) + admin moderation views.
11. Frontend: auth pages → discovery card stack → profile pages → settings → admin.
12. i18n, error tracking, deployment pipeline, production secrets.
