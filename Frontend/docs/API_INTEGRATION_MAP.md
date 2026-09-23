# SIMS — API Integration Map

Maps every **frontend screen / feature** to the **backend REST endpoint(s)** it consumes.

- Base URL: `VITE_API_BASE_URL` (default `http://localhost:8000/api/v1`)
- Envelope: `{ success, message, data, meta }`; 422 errors carry a field-keyed `errors` map
- Roles: **Admin** = Administrator, **Reg** = Registrar, **Inst** = Instructor, **Stu** = Student
- Collection endpoints: `page`, `per_page`, `search`, `sort`, `order` (+ resource-specific filters), all sent as query params by the shared `useCollection` hook with a 350 ms search debounce

## Authentication & shell

| Screen / Feature | HTTP | Endpoint | Roles | Notes |
|---|---|---|---|---|
| Login | POST | `/auth/login` | public | `{ email, password }` → `{ token, user }`; token stored, then `requireAuth` verifies with `/auth/me` |
| Current user | GET | `/auth/me` | all authenticated | Resolved on every app start; 401 → token cleared + redirect to login |
| Logout | POST | `/auth/logout` | all authenticated | Revokes the Sanctum token server-side; client clears `localStorage` |
| App shell / sidebar | – | role from `/auth/me` | – | Navigation items rendered per role |

## Dashboard

| Screen / Feature | HTTP | Endpoint | Roles | Notes |
|---|---|---|---|---|
| Statistics cards | GET | `/dashboard/stats` | all authenticated | Response shape is role-aware (staff count cards vs instructor vs student) |
| Quick links | – | client-side routes | – | Link to the modules the role may open |

## Students

| Screen / Feature | HTTP | Endpoint | Roles | Notes |
|---|---|---|---|---|
| List w/ search | GET | `/students?search&program_id&year_level&status&sort&order&page&per_page` | Admin, Reg | Search matches name/number; filters + sort + pagination driven by `meta` |
| View details | GET | `/students/{id}` | Admin, Reg (and the student themself for nested views) | Detail screen uses nested endpoints below |
| Enrollment history | GET | `/students/{id}/enrollments` | Admin, Reg, Stu(own student only) | |
| Grade history | GET | `/students/{id}/grades` | Admin, Reg, Stu(own student only) | |
| Academic record | GET | `/students/{id}/academic-record` | Admin, Reg, Stu(own student only) | Aggregated per-term + overall averages |
| Create | POST | `/students` | Admin, Reg | 422 field errors shown inline in the modal |
| Edit | PATCH | `/students/{id}` | Admin, Reg | Category/status updated selectively |
| Deactivate | DELETE | `/students/{id}` | Admin, Reg | Backend soft-deactivates (status → inactive), returns 204 with a confirmation dialog first |

## Reference data — Programs, Courses, Academic Terms

| Screen / Feature | HTTP | Endpoint | Roles | Notes |
|---|---|---|---|---|
| Lists w/ search | GET | `/programs`, `/courses`, `/academic-terms` (+`search&status&sort&order&page&per_page`) | Admin, Reg | Terms additionally support `semester` filter |
| Create | POST | `/programs`, `/courses`, `/academic-terms` | Admin, Reg | Uniqueness (code/course_code/year+semester) → 422 shown on the field |
| Edit | PATCH | `/{resource}/{id}` | Admin, Reg | |
| Deactivate | DELETE | `/{resource}/{id}` | Admin, Reg | 204, confirmation dialog |

## Course Offerings

| Screen / Feature | HTTP | Endpoint | Roles | Notes |
|---|---|---|---|---|
| List w/ filters | GET | `/course-offerings?search&course_id&academic_term_id&instructor_id&status&page&per_page` | Admin, Reg, Inst | Instructors only see their own offerings (backend enforces) |
| View details | GET | `/course-offerings/{id}` | Admin, Reg, Inst | |
| Class roster | GET | `/course-offerings/{id}/students` | Admin, Reg, Inst | Instructor roster screen for grade entry |
| Instructor picker | GET | `/instructors` | Admin, Reg | Read-only list of active instructor accounts powering the assignment dropdown |
| Create | POST | `/course-offerings` | Admin, Reg | Includes assigned instructor |
| Edit | PATCH | `/course-offerings/{id}` | Admin, Reg | |
| Deactivate | DELETE | `/course-offerings/{id}` | Admin, Reg | |

## Enrollments

| Screen / Feature | HTTP | Endpoint | Roles | Notes |
|---|---|---|---|---|
| List w/ filters | GET | `/enrollments?search&course_offering_id&student_id&status&page&per_page` | Admin, Reg | |
| Create | POST | `/enrollments` | Admin, Reg | Duplicate `(student, offering)` → 409 message surfaced from `err.message` |
| Update status | PATCH | `/enrollments/{id}` | Admin, Reg | |
| Deactivate | DELETE | `/enrollments/{id}` | Admin, Reg | |

## Grades

| Screen / Feature | HTTP | Endpoint | Roles | Notes |
|---|---|---|---|---|
| Central list w/ filters | GET | `/grades?search&course_offering_id&student_id&page&per_page` | Admin, Reg | Read-only for staff; instructors use the roster screen instead |
| View single | GET | `/grades/{id}` | Admin, Reg | |
| Create / encode | POST | `/grades` | Admin, Reg, Inst | Grade scales validated by backend (422) |
| Update | PATCH | `/grades/{id}` | Admin, Reg, Inst | Instructors may only update grades in their own offerings (backend enforces) |
| Roster grade entry | GET | `/course-offerings/{id}/students` then POST/PATCH `/grades` | Inst | One flow per enrolled student row |

## Student self-service

| Screen / Feature | HTTP | Endpoint | Roles | Notes |
|---|---|---|---|---|
| My enrollments | GET | `/my/enrollments` | Stu | Backend scopes to the authenticated student |
| My grades | GET | `/my/grades` | Stu | |
| My academic record | GET | `/my/academic-record` | Stu | Aggregated by term with averages — rendered as grouped cards |

## Profile

| Screen / Feature | HTTP | Endpoint | Roles | Notes |
|---|---|---|---|---|
| Account details | GET | `/auth/me` | all authenticated | Name, email, role, status, plus fine-grained age/joined info derived client-side |
| Logout | POST | `/auth/logout` | all authenticated | Confirmation dialog, then token revocation + redirect to `/login` |