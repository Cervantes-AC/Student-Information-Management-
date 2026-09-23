# SIMS Backend — Laravel 12 REST API

REST API for the **Student Information Management System** (Laboratory Activity — Lab 2).
Serves `/api/v1` with Sanctum token auth, role-based access control, SQLite storage,
validation, pagination/search/filter/sort, API documentation, a Postman collection and a PHPUnit test suite.

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Laravel 12 (PHP 8.2+) |
| Auth | Laravel Sanctum (bearer tokens) |
| Database | SQLite (`database/database.sqlite`) |
| Validation | Form Requests → `422` with field-mapped `errors` |
| Docs | OpenAPI 3 spec (`/openapi.yaml`), Swagger UI at `/api/docs`, Postman collection |
| Tests | PHPUnit feature tests (in-memory SQLite) |

---

## Requirements

- PHP **8.2+** (extension `pdo_sqlite` enabled; `zip` needed for Composer)
- Composer **2.x**
- Laravel 12 CLI optional (`php artisan` works via `composer`)

> Windows/XAMPP tip: enable `extension=zip` and `extension=pdo_sqlite` in `C:\xampp\php\php.ini`.

---

## Setup

```bash
cd Backend

# 1. Install dependencies
composer install

# 2. Create the SQLite database file (config/.env already points to it)
#    Windows: New-Item database\database.sqlite -ItemType File    (or touch on Unix)
#    The repo ships an empty database.sqlite; skip if it exists.

# 3. Configure environment
copy .env.example .env        # (already done in this repo — .env is gitignored)
php artisan key:generate
```

Edit `.env` as needed:

```
APP_NAME="Student Information Management API"
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
# DB_DATABASE defaults to database/database.sqlite when DB_CONNECTION=sqlite
```

### CORS

`config/cors.php` deliberately allows the React/Vite dev origins
(`http://localhost:5173`, `http://127.0.0.1:5173`) plus a pattern for any `localhost:<port>`.
Add your own staging origin there if the frontend is served from elsewhere.

---

## Migrate & Seed

```bash
php artisan migrate:fresh --seed
```

This produces **5 users · 3 programs · 100 students · 20 courses · 2 academic terms ·
20 course offerings · 200 enrollments · 100 grades**, plus a student account linked to
student number `2026-00001`.

### Demo accounts (password: `password`)

| Role | Email | Notes |
|---|---|---|
| Administrator | `admin@sims.test` | Full access |
| Registrar | `registrar@sims.test` | Staff access |
| Instructor | `instructor@sims.test` | Sees/edits own offerings & rosters |
| Instructor | `instructor2@sims.test` | Second instructor (for cross-instructor 403 checks) |
| Student | `student@sims.test` | Linked to student `2026-00001`; self-service only |

---

## Run the API

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

Base URL: `http://127.0.0.1:8000/api/v1`

Quick login:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sims.test","password":"password"}'
```

Use the returned `token` on every other request:

```bash
curl http://127.0.0.1:8000/api/v1/students?search=dela \
  -H "Authorization: Bearer <token>"
```

---

## API conventions

### Response envelope

Every response uses `{ "success", "message", "data", "meta", "errors" }`:

```jsonc
// 200 list
{ "success": true, "message": "Students retrieved successfully.",
  "data": [ ... ], "meta": { "current_page": 1, "per_page": 15, "total": 100,
  "last_page": 7, "from": 1, "to": 15 } }

// 422 validation
{ "success": false, "message": "Validation failed.",
  "errors": { "student_number": ["The student number is already registered."] } }
```

### Error codes

| Code | Meaning |
|---|---|
| `401` | Missing/invalid bearer token or bad credentials |
| `403` | Authenticated, but role or record access not allowed |
| `404` | Record or route not found |
| `409` | Conflict (`duplicate enrollment`, `duplicate grade`) |
| `422` | Validation failed (field-mapped `errors`) |
| `500` | Server error (never leaks stack traces in JSON) |

`DELETE` endpoints **deactivate** records (`status = inactive` / `dropped`) and return
`204 No Content` — this preserves referential integrity with child records.

### List endpoints: search / filter / sort / pagination

| Query param | Purpose | Example |
|---|---|---|
| `search` | LIKE across a resource's searchable columns | `?search=dela` |
| `<column>` | exact filter on filterable columns | `?program_id=1&year_level=3&status=active` |
| `sort` + `order` | allowed sort columns, `asc`/`desc` | `?sort=last_name&order=asc` |
| `page`, `per_page` | pagination (default 15, max 100) | `?page=2&per_page=25` |

---

## Endpoints overview

Base path: `/api/v1`

| Method | Endpoint | Access |
|---|---|---|
| POST | `/auth/login` | public |
| GET | `/auth/me` · POST `/auth/logout` | any authenticated |
| GET | `/dashboard/stats` | any authenticated (role-shaped) |
| GET/POST | `/programs`, `/programs/{id}` (GET/PUT/PATCH/DELETE) | admin, registrar |
| GET/POST | `/courses`, `/courses/{id}` (GET/PUT/PATCH/DELETE) | admin, registrar |
| GET/POST | `/academic-terms`, `/academic-terms/{id}` (GET/PUT/PATCH/DELETE) | admin, registrar |
| GET | `/course-offerings` | staff (all), instructor (own) |
| GET | `/course-offerings/{id}` | staff (any), instructor (own) |
| POST/PUT/PATCH/DELETE | `/course-offerings[/{id}]` | admin, registrar |
| GET | `/course-offerings/{id}/students` | staff, the offering's instructor |
| GET/POST | `/students`, `/students/{id}` (GET/PUT/PATCH/DELETE) | list/create/update/delete: admin, registrar; show: staff or the student themselves |
| GET | `/students/{id}/enrollments` · `/students/{id}/grades` · `/students/{id}/academic-record` | staff, or the student themselves |
| GET/POST | `/enrollments`, `/enrollments/{id}` (GET/PUT/PATCH/DELETE) | admin, registrar |
| GET | `/grades` · `/grades/{id}` | admin, registrar |
| POST/PUT/PATCH | `/grades[/{id}]` | staff, or instructor for their own offering's students |
| GET | `/my/enrollments` · `/my/grades` · `/my/academic-record` | student (own data only) |

All endpoints are documented in the OpenAPI spec — see [API documentation](#api-documentation).

---

## API documentation

- **OpenAPI 3 spec:** `GET /openapi.yaml` (also at `Backend/public/openapi.yaml`)
- **Swagger UI (interactive):** `GET /api/docs` (browser; loads the spec from `/openapi.yaml`)
- **Postman collection:** `postman/SIMS.postman_collection.json` (45 requests)

Postman quick start:

1. Import `postman/SIMS.postman_collection.json`.
2. The collection variable `baseUrl` defaults to `http://127.0.0.1:8000/api/v1`.
3. Run **Authentication → Login** — the test script stores the returned token in the
   `token` collection variable, so all other requests are pre-authorized.

---

## Running the tests

```bash
cd Backend
php artisan test
```

Runs the PHPUnit suite against **in-memory SQLite** (`phpunit.xml` sets
`DB_CONNECTION=sqlite` + `DB_DATABASE=:memory:`). Current: **47 tests / 145 assertions**
covering authentication, students (search/filter/sort/pagination), reference data CRUD,
offerings, enrollments (409 duplicates), grades (instructor scope 403), class rosters,
student-scoped endpoints, academic records and role-shaped dashboards.

Run a single file:

```bash
php artisan test --filter=StudentManagementTest
```

---

## Project structure

```
Backend/
|-- app/
|   |-- Enums/            Role, RecordStatus, EnrollmentStatus
|   |-- Http/
|   |   |-- Controllers/Api/V1/   Auth, Dashboard, Students, Programs, Courses,
|   |   |                          AcademicTerms, CourseOfferings, Enrollments, Grades,
|   |   |                          StudentEnrollment/Grade, OfferingStudent, AcademicRecord, MyData
|   |   |-- Middleware/   EnsureRole (role:...) route middleware
|   |   `-- Requests/     Form Requests (422 field validation)
|   |-- Models/           User, Program, Student, Course, AcademicTerm,
|   |                      CourseOffering, Enrollment, Grade
|   `-- Support/          ApiResponse (envelope), CollectionQuery (search/filter/sort/page),
|                          Presenters (stable JSON shapes)
|-- bootstrap/app.php     Middleware alias + JSON exception mapping (401/403/404/409/422)
|-- config/cors.php       Local dev origins
|-- database/
|   |-- factories/        Factories for all models
|   |-- migrations/       8 table migrations + indexes/constraints
|   `-- seeders/          Demo data (5 users, 100 students, 200 enrollments, ...)
|-- postman/              SIMS.postman_collection.json
|-- public/openapi.yaml   OpenAPI 3 specification
|-- resources/views/swagger.blade.php   Swagger UI (served at /api/docs)
|-- routes/api.php        All /api/v1 endpoints + role middleware
|-- tests/Feature/        PHPUnit feature tests
`-- scripts/              Small dev helpers (validate_yaml.php)
```

---

## Notable design decisions

- **Deactivation instead of hard deletes** — students/programs/courses/offerings/terms are
  marked `inactive` and enrollments `dropped`, preserving referential integrity (DELETE → 204).
- **Instructor scoping** — `/course-offerings` and grade management automatically limit
  instructors to their own offerings; cross-instructor attempts return `403`.
- **Student object-level checks** — a student token can only read their own linked
  student record, enrollments, grades and academic record.
- **409 conflicts** — duplicate `(student, offering)` enrollments and double-encoded grades
  are rejected with a consistent conflict response (also enforced by DB unique indexes).
- **One grade per enrollment** — `grades.enrollment_id` is unique.
</content>
</invoke>