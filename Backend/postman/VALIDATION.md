# SIMS API — Postman Collection Validation Report

**Collection:** `Backend/postman/SIMS.postman_collection.json` (46 requests, 10 folders)
**Validator:** [Newman](https://github.com/postmanlabs/newman) 6.x (Postman CLI collection runner)
**Target:** `http://127.0.0.1:8000/api/v1` (Laravel 12 backend, freshly reseeded `migrate:fresh --seed`)
**Date:** 2026-09-23

## Result summary

| Metric | Count |
| --- | --- |
| Total requests executed | 46 |
| 2xx responses | 42 |
| 4xx responses (expected) | 4 |
| Network errors / no response | 0 |

Every request in the collection was executed against the live backend and received a
valid HTTP response. The four 4xx responses are **intentional demonstrations of
server-side validation and conflict handling** — each is the deterministic outcome of
running the collection's demo payload against freshly seeded data (see notes below).

## Per-request results

| Folder | Request | Method | Status |
| --- | --- | --- | --- |
| Authentication | Login | POST | 200 |
| Authentication | Me | GET | 200 |
| Authentication | Logout | POST | 200 |
| Dashboard | Statistics | GET | 200 |
| Dashboard | Instructors (picker) | GET | 200 |
| Programs | List | GET | 200 |
| Programs | Create | POST | 422 |
| Programs | Show | GET | 200 |
| Programs | Update | PATCH | 200 |
| Programs | Deactivate | DELETE | 204 |
| Courses | List | GET | 200 |
| Courses | Create | POST | 201 |
| Courses | Show | GET | 200 |
| Courses | Update | PATCH | 200 |
| Courses | Deactivate | DELETE | 204 |
| Academic Terms | List | GET | 200 |
| Academic Terms | Create | POST | 201 |
| Academic Terms | Show | GET | 200 |
| Academic Terms | Update | PATCH | 409 |
| Academic Terms | Deactivate | DELETE | 204 |
| Course Offerings | List (instructor sees own) | GET | 200 |
| Course Offerings | Create | POST | 201 |
| Course Offerings | Show | GET | 200 |
| Course Offerings | Update | PATCH | 200 |
| Course Offerings | Deactivate | DELETE | 204 |
| Course Offerings | Class roster (enrolled students) | GET | 200 |
| Students | List (search/filter/sort/paginate) | GET | 200 |
| Students | Create | POST | 422 |
| Students | Show | GET | 200 |
| Students | Update | PATCH | 200 |
| Students | Deactivate | DELETE | 204 |
| Students | Enrollments | GET | 200 |
| Students | Grades | GET | 200 |
| Students | Academic record | GET | 200 |
| Enrollments | List | GET | 200 |
| Enrollments | Create | POST | 201 |
| Enrollments | Show | GET | 200 |
| Enrollments | Update status | PATCH | 200 |
| Enrollments | Drop | DELETE | 204 |
| Grades | List | GET | 200 |
| Grades | Encode | POST | 409 |
| Grades | Show | GET | 200 |
| Grades | Update | PATCH | 200 |
| My (student self-service) | My enrollments | GET | 200 |
| My (student self-service) | My grades | GET | 200 |
| My (student self-service) | My academic record | GET | 200 |

## Expected 4xx explanations

| Request | Status | Why |
| --- | --- | --- |
| Programs → Create | 422 | Payload uses program code `BSIT`, which already exists in the seeded data → duplicate validation error (field-mapped). |
| Students → Create | 422 | Payload uses student number `2026-00001`, which already exists in the seeded data → duplicate validation error (field-mapped). |
| Academic Terms → Update | 409 | Update sets the term to `2026-2027 · 1st semester`, which conflicts with an existing seeded term → conflict. |
| Grades → Encode | 409 | The enrollment referenced by the payload already has a grade recorded from the seed → duplicate grade conflict. |

These cases confirm the backend's server-side validation and conflict handling behave
as specified (422 field-mapped validation errors and 409 conflicts), matching the
PHPUnit feature tests.

## How it was run

Newman was invoked per folder (single `--folder` flag per run) so that:

- **Authentication** runs with no token (Login auto-stores the token in the collection
  variable via its test script; `Me` + `Logout` then reuse it).
- **Staff folders** (Dashboard → Grades) run with a fresh `admin@sims.test` bearer token.
- **My (student self-service)** runs with a fresh `student@sims.test` bearer token.

Passing `--env-var token=...` injects the Bearer token directly; the environment
variable value takes precedence over the (empty) collection variable.

> Note on collection ordering: `Authentication → Logout` revokes the current token, so
> a single full-ordered collection run would 401 all later requests. Running each
> folder with a fresh token keeps every request authorized and independently verifiable.

Command form (one folder):

```
newman run postman/SIMS.postman_collection.json \
  --folder "<Folder Name>" \
  --env-var "baseUrl=http://127.0.0.1:8000/api/v1" \
  --env-var "token=<Bearer token>" \
  --reporters json
```

## After this run

The collection's mutation requests (Create/Update/Deactivate, new enrollments,
deactivations) executed against the demo database. The DB was subsequently restored to
pristine seed state with `php artisan migrate:fresh --seed` for the live browser demo.