# AI-Assisted Framework-Based REST API Development
### Laboratory Activity I — Backend Application Development for Information Technology

**System Case:** Student Information Management REST API

| Focus Requirement | Detail |
|---|---|
| Development Mode | Backend only — no graphical frontend required |
| Framework | Student choice, any appropriate backend framework |
| Primary Output | Working, secured, documented REST API |
| Database | Relational database with migrations/schema and seed data |
| Development Approach | AI-assisted development with human review and accountability |

> Assessment focuses on API design, backend architecture, database quality, security, testing, documentation, and the student's ability to explain and modify the solution.

---

## 1. Laboratory Description

Design, develop, test, secure, and document a complete backend application using RESTful API architecture. Students choose the language, framework, ORM, database, and tools.

The backend implements a **Student Information Management System**, exposing endpoints for:
- Authentication
- Student records
- Academic programs
- Courses
- Academic terms
- Course offerings
- Enrollments
- Grades
- Academic-record retrieval

No graphical frontend is required — focus is server-side engineering.

AI tools are encouraged (planning, scaffolding, code gen, debugging, tests, docs, refactoring, review) but **every AI-generated artifact must be reviewed, tested, and understood** before acceptance.

**Expected Result:** A reproducible REST API project installable on another machine, connected to a database, testable via an API client, and explainable during a technical demo.

---

## 2. Learning Outcomes

- Explain RESTful API principles (HTTP methods, resources, status codes, representations)
- Set up a backend project with a chosen framework + relational database
- Design normalized tables, relationships, constraints, migrations, seed data
- Implement authentication and role-based authorization
- Develop CRUD + domain-specific endpoints using framework conventions
- Validate requests; return consistent success/error responses
- Implement search, filtering, sorting, pagination
- Apply backend security (password hashing, secret management, server-side authorization)
- Create/execute API tests (automated + API client)
- Produce OpenAPI/Swagger (or equivalent) documentation
- Use AI responsibly while retaining technical ownership

---

## 3. AI-Assisted Development Policy

### 3.1 Permitted Uses of AI
- Requirements analysis and decomposition
- Framework setup and configuration guidance
- Database and ERD design review
- Route/controller/service/repository/model scaffolding
- Validation rules and error-handling patterns
- Debugging and root-cause analysis
- Test-case and test-data generation
- OpenAPI/Swagger documentation assistance
- Security and code-review checklists
- Refactoring and performance suggestions
- README and technical documentation drafting

### 3.2 AI Accountability
- Do not submit code you cannot explain
- Do not accept AI-generated database/security code without reviewing it
- Never paste real passwords, private tokens, or confidential credentials into AI tools
- Run tests after meaningful AI-generated changes
- Prefer small, reviewable prompts/commits over "generate the whole app" prompts
- Record major AI contributions in README/dev notes when required

### 3.3 Recommended AI-Assisted Workflow

| Step | Developer Action |
|---|---|
| 1. Understand | Read the requirement and identify the business rule before prompting |
| 2. Plan | Define resource, data model, endpoint, validation, security, tests |
| 3. Prompt | Ask AI for a specific, bounded task using project context |
| 4. Generate | Allow AI to propose code, tests, docs, or fixes |
| 5. Review | Read output; compare with framework conventions |
| 6. Test | Run automated tests and API-client requests |
| 7. Improve | Refactor, correct, secure, optimize |
| 8. Document | Update README, API docs, dev notes |

---

## 4. Framework & Technology Freedom

| Language | Example Frameworks |
|---|---|
| PHP | Laravel, Symfony |
| JavaScript/TypeScript | Express.js, Fastify, NestJS |
| Python | Django REST Framework, FastAPI, Flask |
| Java | Spring Boot |
| C# | ASP.NET Core Web API |
| Go | Fiber, Gin, Echo |
| Ruby | Ruby on Rails |
| Kotlin | Ktor, Spring Boot |
| Other | Any instructor-approved framework |

**Database:** Relational DB required — PostgreSQL, MySQL, MariaDB, SQL Server, or SQLite (local dev). Use ORM/query layer or a safe parameterized method.

---

## 5. System Scenario

A Student Information Management REST API consumable by a future web/mobile/desktop client. Centralizes student/academic info and enforces role-based access.

### 5.1 Required User Roles

| Role | Minimum Responsibility |
|---|---|
| Administrator | Full system administration and access to all managed resources |
| Registrar / Staff | Manage students, academic records, programs, courses, enrollments as permitted |
| Instructor | View assigned course offerings; manage grades for authorized enrollments |
| Student | View only own profile, enrollments, and grades |

---

## 6. Required Domain Modules

| Module | Minimum Scope |
|---|---|
| Authentication | Login, logout/token invalidation, current authenticated user |
| Users and Roles | User accounts, roles, status, authorization rules |
| Students | Profile, student number, program, year level, status, contact data |
| Programs | Code, name, description, status |
| Courses | Code, title, units, description, status |
| Academic Terms | Academic year, semester/term, dates, status |
| Course Offerings | Course, term, instructor, section, schedule, capacity, status |
| Enrollments | Student registration in a course offering with status |
| Grades | Grades linked to enrollment with remarks/status |
| Academic Record | Aggregated student record grouped by academic term |

---

## 7. Minimum Data Model

| Entity | Minimum Fields |
|---|---|
| users | id, name, email, password_hash, role/role_id, status, created_at, updated_at |
| students | id, student_number, first_name, middle_name, last_name, suffix, birth_date, email, contact_number, address, program_id, year_level, status, timestamps |
| programs | id, code, name, description, status, timestamps |
| courses | id, course_code, course_title, description, units, status, timestamps |
| academic_terms | id, academic_year, semester/term, start_date, end_date, status, timestamps |
| course_offerings | id, course_id, academic_term_id, instructor_id, section, schedule, room, capacity, status, timestamps |
| enrollments | id, student_id, course_offering_id, enrollment_date, status, timestamps |
| grades | id, enrollment_id, midterm_grade, final_grade/final_rating, remarks, timestamps |

### 7.1 Required Relationships
- One program → many students
- One course → many course offerings
- One academic term → many course offerings
- One instructor → many course offerings
- One student → many enrollments
- One course offering → many enrollments
- One enrollment → one grade record (or equivalent normalized structure)

### 7.2 Data Integrity Requirements
- `student_number` must be unique
- `course_code` must be unique
- Foreign keys must protect valid relationships
- Duplicate enrollment in the same course offering must be prevented
- Indexes should support frequently searched columns
- Schema changes should use migrations or an equivalent reproducible mechanism

---

## 8. REST API Design Standards

Use API versioning + resource-oriented URLs (e.g., `/api/v1`). Nouns for resources, HTTP method expresses the operation. **Avoid RPC-style names** (`/getStudents`, `/createStudent`, etc.).

| Operation | Recommended Pattern |
|---|---|
| List students | `GET /api/v1/students` |
| Create student | `POST /api/v1/students` |
| Retrieve student | `GET /api/v1/students/{id}` |
| Replace/update student | `PUT /api/v1/students/{id}` |
| Partial update | `PATCH /api/v1/students/{id}` |
| Delete/deactivate | `DELETE /api/v1/students/{id}` |

### 8.1 Required Endpoint Groups

**Authentication**
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout` (or equivalent token invalidation)
- `GET /api/v1/auth/me`

**Students**
- `GET /api/v1/students`
- `POST /api/v1/students`
- `GET /api/v1/students/{id}`
- `PUT`/`PATCH /api/v1/students/{id}`
- `DELETE /api/v1/students/{id}`

**Programs**
- `GET`/`POST /api/v1/programs`
- `GET`/`PUT`/`PATCH`/`DELETE /api/v1/programs/{id}`

**Courses**
- `GET`/`POST /api/v1/courses`
- `GET`/`PUT`/`PATCH`/`DELETE /api/v1/courses/{id}`

**Academic Terms**
- `GET`/`POST /api/v1/academic-terms`
- `GET`/`PUT`/`PATCH`/`DELETE /api/v1/academic-terms/{id}`

**Course Offerings**
- `GET`/`POST /api/v1/course-offerings`
- `GET`/`PUT`/`PATCH`/`DELETE /api/v1/course-offerings/{id}`

**Enrollments**
- `GET`/`POST /api/v1/enrollments`
- `GET`/`PATCH`/`DELETE /api/v1/enrollments/{id}`
- `GET /api/v1/students/{id}/enrollments`
- `GET /api/v1/course-offerings/{id}/students`

**Grades**
- `GET`/`POST /api/v1/grades`
- `GET`/`PUT`/`PATCH /api/v1/grades/{id}`
- `GET /api/v1/students/{id}/grades`

**Academic Record**
- `GET /api/v1/students/{id}/academic-record`

### 8.2 HTTP Status Codes

| Code | Expected Use |
|---|---|
| 200 OK | Successful retrieval/update with response content |
| 201 Created | Resource successfully created |
| 204 No Content | Successful operation without response body |
| 400 Bad Request | Malformed/invalid request outside normal validation |
| 401 Unauthorized | Authentication missing or invalid |
| 403 Forbidden | Authenticated user lacks required permission |
| 404 Not Found | Requested resource does not exist |
| 409 Conflict | Duplicate/conflicting state |
| 422 Unprocessable Content | Request validation failed |
| 500 Internal Server Error | Unexpected failure; no sensitive internals leaked |

---

## 9. Response and Error Consistency

**Success example:**
```json
{
  "success": true,
  "message": "Student retrieved successfully.",
  "data": { "id": 1, "student_number": "2026-00001" }
}
```

**Validation error example:**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": { "email": ["A valid email address is required."] }
}
```

---

## 10. Validation Requirements

- `student_number`: required, unique
- `first_name`, `last_name`: required
- `email`: valid format when supplied
- `program_id`: must reference an existing program
- `course_id`, `academic_term_id`, `instructor_id`, `student_id`, `course_offering_id`: must reference valid records
- Year level/status values: restricted to documented valid values
- Grade values: must follow defined grading range/rules
- **All validation must occur server-side** — invalid input must never be persisted just because a client sent it

---

## 11. Search, Filtering, Sorting, Pagination

| Feature | Example |
|---|---|
| Search | `GET /api/v1/students?search=dela` |
| Filter | `GET /api/v1/students?program_id=1&year_level=3&status=ACTIVE` |
| Sort | `GET /api/v1/students?sort=last_name` |
| Pagination | `GET /api/v1/students?page=2&per_page=20` |

Collection endpoints must not return unbounded datasets. Pagination metadata should include current page, page size, total records, last page (or cursor equivalent).

---

## 12. Authentication and Authorization

### 12.1 Authentication
- Passwords hashed with a framework-supported mechanism
- Protected routes require valid authenticated session/token
- Must provide a current-user endpoint (or equivalent)
- Logout/token invalidation where supported

### 12.2 Authorization

| Role | Minimum Access Rule |
|---|---|
| Administrator | May manage all required resources |
| Registrar/Staff | May manage student/academic records per configured permissions |
| Instructor | May view assigned offerings; modify grades only for authorized enrollments |
| Student | May view only own profile, enrollment, grade info |

> **Object-Level Authorization:** A student must not retrieve another student's confidential record just by changing an ID in the URL. Authorization must be enforced server-side for the actual requested resource.

---

## 13. Backend Security Requirements

- Use environment variables / secure config mechanism for secrets
- Do not commit real `.env`, DB password, private keys, or tokens
- Use parameterized queries / ORM safeguards + validation to prevent SQL injection
- Do not expose raw DB exceptions, stack traces, or sensitive implementation details
- Do not return password hashes, auth secrets, or unnecessary sensitive fields
- Apply authorization to every protected action, not just menu/client behavior
- Configure CORS deliberately when browser clients are expected
- Log useful operational errors without logging passwords/private tokens

---

## 14. Environment and Reproducibility

Project must run on another machine: safe `.env.example`, migration/schema files, seeders/fixtures, dependency manifests, install instructions.

```
APP_ENV=development
APP_PORT=8000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_api
DB_USER=app_user
DB_PASSWORD=...
AUTH_SECRET=...
```

---

## 15. Required Test Data

| Entity | Minimum Demonstration Records |
|---|---|
| Users | 5 |
| Programs | 3 |
| Students | 100 |
| Courses | 20 |
| Academic Terms | 2 |
| Course Offerings | 20 |
| Enrollments | 200 |
| Grades | 100 |

Use seeders/factories/fixtures/scripts — manual insertion discouraged.

---

## 16. Testing Requirements

| Area | Minimum Test Cases |
|---|---|
| Authentication | Valid login; invalid password; missing/invalid auth |
| Students | Create; retrieve; update; duplicate student number; invalid email; not found |
| Authorization | Permitted admin action; forbidden student/instructor actions; object-level access control |
| Enrollment | Valid enrollment; invalid references; duplicate enrollment prevention |
| Grades | Valid grade; invalid enrollment; unauthorized grade modification |
| Collections | Search; filtering; sorting; pagination behavior |

### 16.1 Recommended Tools
Pest/PHPUnit, Vitest/Jest, Pytest, JUnit, xUnit, Go testing (per stack). At minimum, cover auth, student creation, validation, authorization, enrollment, grade submission.

---

## 17. API Documentation

Mandatory. Swagger UI/OpenAPI preferred (or equivalent clearly describing the contract). Must include:
- Endpoint path + HTTP method
- Description/purpose
- Authentication requirement
- Path/query parameters
- Request body schema + example
- Successful response schema + example
- Validation/error response examples
- Relevant HTTP status codes

Recommended: a documented route such as `/api/docs`.

---

## 18. API Client Collection

Postman/Insomnia/Bruno (or equivalent) collection covering major endpoints, both successful and failed requests. Organize by resource group: Authentication, Students, Programs, Courses, Academic Terms, Course Offerings, Enrollments, Grades, Academic Records.

---

## 19. Laboratory Development Phases

| Phase | Required Work | Checkpoint |
|---|---|---|
| 1. Project Setup | Select framework; init repo; configure env + DB | Server starts, DB connects |
| 2. Database Design | ERD, schema/migrations, constraints, seeders | DB recreatable from project files |
| 3. Authentication | Login, password hashing, protected routes, current user | Protected endpoint rejects unauthenticated request |
| 4. Core Resources | Programs, Students, Courses, Academic Terms | CRUD works with validation |
| 5. Academic Transactions | Course Offerings, Enrollments, Grades, Academic Record | Relationships/domain ops work |
| 6. Advanced API Features | Search, filter, sort, pagination, consistent errors | Collection endpoints meet requirements |
| 7. Authorization | Apply permissions + object-level access rules | Unauthorized roles get 403 |
| 8. Documentation | README, OpenAPI/Swagger, ERD, API collection | Another dev can understand/setup |
| 9. Testing | Positive/negative/validation/security/automated tests | Critical tests pass |
| 10. Final Demonstration | Deploy/start locally, demo end-to-end | All mandatory acceptance cases shown |

---

## 20. Required Final Outputs

1. Complete backend source code
2. Database migration/schema files
3. Seeders, fixtures, factories, or data-generation scripts
4. Safe `.env.example` or equivalent
5. Entity Relationship Diagram (ERD)
6. OpenAPI/Swagger or equivalent API documentation
7. Postman/Insomnia/Bruno or equivalent API collection
8. Automated test suite and/or test evidence
9. README.md (install, config, migration, seeding, running, auth, testing instructions)
10. Git repository with meaningful development history
11. Short technical doc: architecture, design decisions, security approach, AI-assisted workflow

---

## 21. README Minimum Content

- Project title and description
- Selected technology stack
- Prerequisites
- Installation instructions
- Environment configuration
- Database setup
- Migration/schema instructions
- Seeder/fixture instructions
- How to start the API
- Authentication instructions
- API documentation location
- How to run tests
- Development test accounts (no real credentials)
- Summary of AI tool usage + how outputs were verified

---

## 22. Mandatory Acceptance Demonstration

1. Start the REST API and connect to the database
2. Authenticate successfully
3. Show a protected endpoint rejecting an unauthenticated request
4. Create a program
5. Create a valid student
6. Show validation rejecting an invalid/duplicate student
7. Retrieve and update a student
8. Search and filter student records
9. Show pagination and sorting
10. Create a course and academic term
11. Create a course offering
12. Enroll a student
13. Prevent/handle duplicate enrollment correctly
14. Encode/update an authorized grade
15. Retrieve a student academic record
16. Show a forbidden request for an unauthorized role
17. Show a 404/not-found case
18. Display API documentation
19. Run/show automated test results
20. Explain one AI-assisted code contribution and demonstrate understanding

---

## 23. Minimum Acceptance Criteria

- API server runs without critical errors
- Database integrated and reproducible from project files
- Authentication and protected routes work
- Role-based and object-level authorization enforced
- Required CRUD + academic transaction endpoints work
- Validation prevents invalid data persistence
- Search, filtering, sorting, pagination work
- Correct HTTP status codes used
- Errors returned consistently, no sensitive detail leaks
- API documentation and API-client collection complete
- Required critical automated tests / equivalent evidence present
- Student can explain and modify implementation, including AI-generated parts

---

## 24. Grading Rubric (100 pts)

| Criterion | Points |
|---|---|
| REST API design and correct HTTP usage | 15 |
| Database design, relationships, migrations, data integrity | 15 |
| Core CRUD and academic transaction functionality | 15 |
| Authentication and authorization | 15 |
| Validation and error handling | 10 |
| Search, filtering, sorting, and pagination | 10 |
| API documentation and reproducibility | 5 |
| Testing and reliability | 5 |
| Code organization and maintainability | 5 |
| Technical demonstration, AI accountability, understanding | 5 |
| **TOTAL** | **100** |

### 24.1 Rubric Interpretation
- **REST API Design (15):** Resource-oriented endpoints, correct methods, versioning, status codes, response consistency, documented contracts.
- **Database Design (15):** Normalized structure, relationships, keys, constraints, migrations/schema, seed data, integrity.
- **Core Functionality (15):** Required resources/transactions work correctly without hardcoded/static data.
- **Auth & Authorization (15):** Secure auth, password hashing, protected routes, role permissions, object-level authorization.
- **Validation & Error Handling (10):** Robust server-side validation, duplicate/conflict handling, not-found behavior, consistent errors.
- **Advanced Collection Features (10):** Search, filtering, sorting, pagination, efficient collection endpoints.
- **Documentation (5):** README, setup, API docs, ERD, API client collection complete/usable.
- **Testing (5):** Positive, negative, validation, authorization, critical automated test evidence.
- **Code Quality (5):** Clear organization, naming, framework conventions, separation of concerns, maintainability.
- **Demonstration & AI Accountability (5):** Can explain architecture/code/DB/security/testing/AI contributions; can do a small live mod/debug task.

---

## 25. Critical Deficiencies (major deductions)

No working REST API; no real database integration; no authentication; plaintext passwords; missing server-side authorization; static/hardcoded API data; no validation; no API demonstration; inability to explain major source code / AI-generated portions.

---

## 26. Optional Enhancements

- Refresh-token strategy / secure session rotation
- Email verification and password reset
- Rate limiting
- Soft delete and recovery
- Audit trail / activity logs
- Dockerized development environment
- CI/CD pipeline
- Redis caching
- CSV import/export
- PDF academic record generation
- Health/readiness endpoints
- Role and permission administration
- Integration tests and performance tests

> Bonus features do not replace incomplete core requirements.

---

## 27. Final Development Principle

**AI Accelerates Development; the Developer Owns the Result.** Use AI to reduce repetitive work, explore alternatives, debug faster, improve documentation — never as a substitute for understanding. Every endpoint, schema decision, security rule, and test result remains the developer's responsibility.

---

## 28. Final Submission Checklist

- [ ] Backend source code runs successfully
- [ ] No frontend required for grading
- [ ] Database schema/migrations + seed data included
- [ ] Authentication and authorization functional
- [ ] All required resources + academic transaction endpoints implemented
- [ ] Search, filtering, sorting, pagination work
- [ ] Validation and error handling consistent
- [ ] Secrets excluded from repository
- [ ] README and API documentation complete
- [ ] API client collection included
- [ ] Tests executed, evidence available
- [ ] AI-assisted contributions reviewed and explainable