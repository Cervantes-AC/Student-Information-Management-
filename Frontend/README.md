# SIMS — Frontend Application

React + TypeScript single-page application (Vite) that consumes the **Student Information Management System (SIMS) REST API** built in the backend activity (`../Backend`). It provides a role-aware dashboard for **Administrators**, **Registrars**, **Instructors**, and **Students** — all data is read from and written to the real backend API; the frontend never touches the database directly.

| | |
|---|---|
| Framework | React 19 + TypeScript (strict) |
| Bundler / tooling | Vite, oxlint |
| Routing | React Router v7 (protected + role-aware) |
| HTTP | Axios — centralized client, Bearer token, error normalization |
| Auth state | React Context (`AuthContext`) + `localStorage` token, validated via `GET /auth/me` |
| Styling | Plain CSS design system (`src/index.css`), responsive |
| Tests | Vitest + Testing Library + MSW (mock service worker) |

---

## 1. Prerequisites

- **Node.js 22+** (developed against v22.20.0)
- **npm 11+**
- The **SIMS backend** from `../Backend` (see below for running it)

## 2. Environment configuration

Copy the template — **do not commit real secrets**:

```bash
cp .env.example .env.local
```

| Variable | Purpose | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the Laravel API (including `/api/v1`) | `http://localhost:8000/api/v1` |

The API client reads the variable at build/dev time (`import.meta.env.VITE_API_BASE_URL`) and falls back to `http://localhost:8000/api/v1` when unset. `.env.test` pins the same value for the Vitest suite. All `.env*.local` files are git-ignored.

## 3. Installation

```bash
cd Frontend
npm install
```

## 4. Running the backend + frontend together

```bash
# Terminal 1 — backend (from ../Backend)
cp .env.example .env          # then adjust DB path etc. per Backend/README.md
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2 — frontend (from Frontend)
npm run dev
```

Open `http://localhost:5173`. Backend API docs are at `http://127.0.0.1:8000/api/docs`.

> CORS: the backend is configured to allow the Vite origin (`http://localhost:5173` in development).

## 5. Demo accounts (seeded)

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@sims.test` | `password` |
| Registrar | `registrar@sims.test` | `password` |
| Instructor | `instructor@sims.test` | `password` |
| Instructor (2nd) | `instructor2@sims.test` | `password` |
| Student | `student@sims.test` | `password` |

## 6. Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server (HMR) |
| `npm run build` | Type-check (`tsc -b`) and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run oxlint over `src` |

## 7. Architecture note

```
Browser
  └─ src/
     ├─ api/        axios client (base URL, Bearer header, 401/403/404/409/422/500
     │              normalization → ApiError), typed endpoint functions
     ├─ auth/       AuthContext (login/logout/me, token store) + RequireAuth /
     │              RequireRole route guards
     ├─ hooks/      useCollection — server-side search/filter/sort/pagination
     │              with 350 ms debounce, stale-request guard, refresh()
     ├─ router.tsx  route table (public / authenticated / role-gated) + providers
     ├─ pages/      one screen per module (Students, Programs, Enrollments, …)
     ├─ components/ reusable UI (DataTable, PaginationBar, ListToolbar, Modal,
     │              ConfirmDialog, Toast, Badge, form fields, states, layout)
     ├─ types/      API models matched to the backend envelope
     ├─ utils/      formatting helpers (grades, dates, statuses, initials)
     └─ test/       Vitest + MSW suite (setup, handlers, helpers, specs)
```

Key decisions:

- **API client** — a single axios instance injects `Authorization: Bearer <token>` on every request and transforms 4xx/5xx + network failures into a typed `ApiError` carrying `status`, `message`, and field `errors`. A `401` also clears the token and broadcasts an `auth:unauthorized` event so the app returns to the login screen.
- **Auth state** — the token lives in `localStorage` (survives refresh), but the session is verified with `GET /auth/me` on startup before granting access to protected routes. The backend remains the authority; hiding buttons/routes is UI convenience only.
- **Server state** — `useCollection` keeps one search/filter/sort/page state per screen and re-fetches debounced; lists refresh after every successful create/update/delete. No duplicate record caches.
- **Roles** — the route table groups screens by `RequireRole`, and rows/actions are hidden per role, but every restricted call still relies on the backend returning 401/403/409/422.
- **Error handling** — every screen renders loading skeletons, empty states, error states, a 403 access-denied state and a 404 state; network failures show "can't reach the server" instead of spinning forever; form 422 errors map to the exact field in the modal.

## 8. Testing

The suite (`src/test/`) uses **MSW** to intercept the real base URL and verify the whole routed app:

| Test file | Covers |
|---|---|
| `auth.test.tsx` | login success → dashboard, invalid credentials feedback, anonymous redirect to /login, expired token → back to login |
| `students.test.tsx` | staff list, **search term reaching the API + server-filtered rows**, role guard (student blocked from staff screen) |
| `forms.test.tsx` | 422 field errors mapped into the program modal |
| `format.test.ts` | grade/date/status/ordinal/initials helpers |

```bash
npm test        # 14 tests, all green
npm run build   # tsc -b + vite build must pass
```

## 9. Documentation (this project)

- [`docs/API_INTEGRATION_MAP.md`](docs/API_INTEGRATION_MAP.md) — every screen → endpoint → method → roles
- [`docs/AI_DEVELOPMENT_LOG.md`](docs/AI_DEVELOPMENT_LOG.md) — AI-assisted tasks and human verification
- Backend docs: `../Backend/README.md`, OpenAPI at `../Backend/public/openapi.yaml` (Swagger UI `/api/docs`), Postman collection in `../Backend/postman/`