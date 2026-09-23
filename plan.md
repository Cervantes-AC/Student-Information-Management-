# SIMS — Student Information Management System

**Development Plan & Progress Tracker**
*Last updated: 2026-09-23*

This document defines what will be built (based on `Backend.md` and `Frontend.md` at the project root) and tracks progress. Checkboxes are ticked as work is completed and verified.

---

## 1. Stack Decisions (confirmed)

| Layer | Choice | Reason |
|---|---|---|
| Backend | PHP **Laravel 12** | Meets assignment framework requirement; supports PHP 8.2.12 (installed) |
| Database | **SQLite** (dev) | Zero-config; assignment allows it for local dev; file-based, reproducible |
| Auth | Laravel **Sanctum** (token-based) | Simple, framework-native secure tokens; frontend sends `Authorization: Bearer` |
| Frontend | **React + TypeScript** (Vite) | Student-selected framework; typed API models per assignment |
| Frontend HTTP | Axios + React Router + AuthContext | Centralized API client, protected/role-aware routes |
| Project layout | `Backend/` and `Frontend/` subfolders | Laravel app in `Backend/`, React app in `Frontend/`; lab docs (`Backend.md`, `Frontend.md`) at repo root |

**API contract shared between both apps:** `{ "success": bool, "message": string, "data": ..., "meta": ... }`,
base URL `http://localhost:8000/api/v1`, JSON errors with field-mapped `errors` on 422.

---

## 2. Overall Progress

| Phase | Status |
|---|---|
| Backend — scaffold Laravel 12 | ✅ Done |
| Backend — database schema + seed data | ✅ Done |
| Backend — auth (Sanctum) + roles | ✅ Done |
| Backend — core CRUD modules | ✅ Done |
| Backend — academic transactions (offerings, enrollments, grades, record) | ✅ Done |
| Backend — search/filter/sort/pagination | ✅ Done |
| Backend — tests | ✅ Done (49 tests / 154 assertions) |
| Backend — API docs + Postman collection | ✅ Done (`/api/docs`, `postman/`) |
| Backend — README + demo smoke test | ✅ Done |
| Backend — instructors picker endpoint | ✅ Done (`GET /instructors`, commit `feb3195`) |
| **Backend complete** | ✅ (46 API routes, smoke-tested over HTTP) |
| Frontend — scaffold Vite React TS | ✅ Done |
| Frontend — API client + auth | ✅ Done |
| Frontend — core module screens | ✅ Done |
| Frontend — academic transaction screens | ✅ Done |
| Frontend — role-aware UX for all 4 roles | ✅ Done |
| Frontend — UX hardening + tests | ✅ Done (14 Vitest + MSW tests) |
| Frontend — README + evidence + docs | ✅ Done |
| **Frontend complete** | ✅ (build green, tests green, live API verified) |

---

## 3. Backend Plan (Laravel 12 + SQLite)

### 3.1 Data model (per Laboratory 2 §7)

| Table | Minimum fields |
|---|---|
| `users` | id, name, email, password (hashed), **role**, **status**, timestamps |
| `students` | id, student_number (**unique**), first_name, middle_name, last_name, suffix, birth_date, email, contact_number, address, **program_id**, year_level, status, timestamps |
| `programs` | id, code, name, description, status, timestamps |
| `courses` | id, course_code (**unique**), course_title, description, units, status, timestamps |
| `academic_terms` | id, academic_year, semester, start_date, end_date, status, timestamps |
| `course_offerings` | id, course_id, academic_term_id, **instructor_id**, section, schedule, room, capacity, status, timestamps |
| `enrollments` | id, student_id, course_offering_id, enrollment_date, status, timestamps — **unique(student_id, course_offering_id)** |
| `grades` | id, enrollment_id, midterm_grade, final_grade, remarks, timestamps |

Relationships: 1 program→many students · 1 course→many offerings · 1 term→many offerings ·
1 instructor→many offerings · 1 student→many enrollments · 1 offering→many enrollments · 1 enrollment→1 grade.

### 3.2 Roles
`administrator` · `registrar` (staff) · `instructor` · `student`

### 3.3 API endpoint map (`GET` = list, `POST` = create, `GET /{id}`, `PUT/PATCH /{id}`, `DELETE /{id}`)

```
POST   /api/v1/auth/login            POST   /api/v1/auth/logout      GET /api/v1/auth/me
students        programs        courses         academic-terms        course-offerings
enrollments + students/{id}/enrollments + course-offerings/{id}/students
grades + students/{id}/grades
students/{id}/academic-record
instructors (read-only picker, staff only)
```

### 3.4 Build steps (progress)

- [x] Scaffold Laravel 12 into `Backend/` (composer create-project)
- [x] Configure `.env` (SQLite, app name), CORS, `database/database.sqlite`
- [x] Install Sanctum (`install:api`); static OpenAPI fallback chosen (no Scribe)
- [x] Migrations for all 8 tables + constraints + indexes
- [x] Models, relationships, casts, PHP enums (Role, RecordStatus, EnrollmentStatus)
- [x] AuthController (login/logout/me) + token revocation
- [x] Role middleware + object-level authorization checks
- [x] Controllers + Form Requests (validation → 422 with field errors)
- [x] Response envelope helper `{success, message, data, meta}`
- [x] Search/filter/sort/pagination on Students (and where sensible elsewhere) via `App\Support\CollectionQuery`
- [x] Academic Record aggregation (grouped by term, per-term + overall averages)
- [x] Seeders (5 users · 3 programs · 100 students · 20 courses · 2 terms · 20 offerings · 200 enrollments · 100 grades)
- [x] Feature tests (auth, students, authorization/object-level, enrollments, grades, collections, instructors) — **49 tests / 154 assertions**
- [x] OpenAPI/Swagger docs at `/api/docs` (spec at `/openapi.yaml`) + Postman collection in `postman/`
- [x] README.md (setup, env, migrations, seeding, run, auth, test accounts, tests)
- [x] Smoke test: boot server, login, list/search/filter/paginate students, verify 401/403/404/409/422, role guards, DELETE→204, logout→token revoked

### 3.5 Backend demo test accounts (seeded)
| Role | Email | Password |
|---|---|---|
| Administrator | admin@sims.test | `password` |
| Registrar | registrar@sims.test | `password` |
| Instructor | instructor@sims.test | `password` |
| Student | student@sims.test | `password` |

---

## 4. Frontend Plan (React + TypeScript + Vite)

### 4.1 Structure (per Laboratory 3 §18)
```
Frontend/
|-- src/
|   |-- components/      reusable UI (tables, forms, layout, alerts)
|   |-- features/        per-module screens (students, programs, courses, ...)
|   |-- services/        Axios API client (central base URL, auth header, error normalization)
|   |-- hooks/           useAuth, useStudents, usePagination...
|   |-- store/           auth + server-state (light, built-in React context)
|   |-- types/           API models/interfaces matching backend resources
|   |-- utils/, styles/
|-- tests/
|-- .env.example         VITE_API_BASE_URL=http://localhost:8000/api/v1
|-- package.json, README.md
```

### 4.2 Build steps (progress)
- [x] Scaffold Vite + React + TS in `Frontend/`
- [x] Axios API client: base URL env, Bearer token, 401/403/404/409/422/500 normalization
- [x] AuthContext + protected/role-aware routes (React Router)
- [x] Layout shell + responsive navigation per role
- [x] Login page (invalid-credential feedback), logout, `GET /auth/me`
- [x] Programs, Courses, Academic Terms screens (list + CRUD)
- [x] Students screen (list, search, filters, pagination, create/edit/delete w/ confirmation) + detail (enrollments/grades/record tabs)
- [x] Course Offerings screen (+ class roster, instructor picker)
- [x] Enrollments screen (enroll, list per offering/student, duplicates via 409)
- [x] Grades screen (staff list + instructor roster encoding)
- [x] Academic Record screen (aggregate endpoint, grouped by term)
- [x] Profile screen (me + role)
- [x] States: loading, empty, success, 401, 403 (forbidden), 404, 409, 422 field errors, network-down
- [x] UX: confirmation dialogs, toasts, skeletons, responsive, accessible labels
- [x] Tests: auth flow, students list/search, form validation/error, protected route — **14 Vitest + MSW tests green**
- [x] README + API integration map + AI development log + test evidence

### 4.3 Frontend demo checks (from Laboratory 3 §24)
invalid login → login → protected route → students from API → search → filter+paginate →
create student → backend validation error → edit → delete w/ confirmation → manage programs/courses →
academic term + offering → enroll → grade → academic record → 403 restricted role →
backend stopped → network-error state → responsive widths.
✅ Covered by automated tests (login, invalid login, protected redirect, expired session, search, role guard,
422 mapping) and live curl evidence (search/filter, per-role academic record, 401/403/422). Browser demo
steps remain to be walked live in the presentation.

---

## 5. Documentation / Evidence checklist (final deliverables)

- [x] Backend README (install, env, migrate, seed, run, auth, tests, demo accounts)
- [x] Frontend README (setup, env config, run/build/test, API connection)
- [x] API Integration Map (frontend page → endpoint → method → role)
- [x] AI Development Log (tasks, tools, prompts, results, human review, evidence)
- [x] OpenAPI/Swagger docs (`/api/docs`, spec at `public/openapi.yaml`)
- [x] Postman collection (`postman/SIMS.postman_collection.json`)
- [x] Test evidence (49 PHPUnit feature tests passing; 14 frontend Vitest + MSW tests passing)
- [ ] Screenshots of major screens + error states (browser demo, to capture during presentation)
- [x] Git repository with meaningful history

---

## 6. Definitions of Done

- **Backend done when:** all §3.4 checkboxes ticked, `php artisan test` passes, server boots,
  smoke test against real HTTP requests passes, docs + README present.
- **Frontend done when:** all §4.2 checkboxes ticked, app runs with `npm run dev`, core screens
  read/write real backend data, tests pass, README + docs present.