# AI-Assisted Frontend Framework Integration with an Existing REST API
### Laboratory Activity III — Frontend Application Development for Information Technology

**Continuation of Laboratory Activity II** — Student Information Management System, Frontend Client for the Existing REST API

*(Note: the source document numbers this "Laboratory Activity II" in its header/footer but text refers to it as continuing "Laboratory Activity II"/consuming "Laboratory Activity I" — treat this as the frontend counterpart to your backend.md.)*

| Focus Requirement | Detail |
|---|---|
| Development Mode | Frontend only — consume the REST API completed in the backend activity |
| Frontend Framework | Student choice, any appropriate client-side framework/library |
| Backend | Use the existing framework-based REST API; no replacement backend |
| Primary Output | Working frontend application integrated with authenticated REST endpoints |
| Development Approach | AI-assisted development with human review, testing, technical accountability |

> The frontend framework is a tool. Assessment focuses on client architecture, API integration, usability, state and error handling, security awareness, testing, and the ability to explain and modify the solution.

---

## 1. Laboratory Description

Direct continuation of the backend REST API activity. Students retain their existing backend and implement a **separate frontend application** that consumes those endpoints over HTTP.

The frontend must:
- Be built with a student-selected client-side framework/library
- Authenticate against the existing backend
- Retrieve and manipulate real backend data
- Enforce role-aware navigation at the UI level
- Provide professional data-management screens for the Student Information Management System

**Not allowed:** replacing the REST API with local mock data, direct DB access, server routes embedded in the frontend project, or a second backend.

> **Core Continuation Rule:** Must connect to and demonstrate the actual REST API from the backend activity. A visually complete app running only on hardcoded/static/browser-only data does **not** satisfy this activity.

---

## 2. Learning Outcomes

- Create a maintainable frontend project with a selected framework/library
- Configure environment-based API endpoints; communicate with an external REST API
- Implement authentication flows and protected routes
- Build reusable components, layouts, forms, tables, navigation
- Consume CRUD, search, filter, sort, pagination, and domain-specific endpoints
- Manage loading, empty, success, validation, authorization, and network-error states
- Implement role-aware UX without treating client-side checks as security boundaries
- Apply responsive design, accessibility, usability, consistent visual design
- Test API integration and critical user flows
- Use AI-assisted tools productively while retaining ownership of architecture, code quality, verification

---

## 3. Relationship to the Backend Activity

| Backend (Lab Activity I) | Frontend (Lab Activity II/III) |
|---|---|
| Exposes `/api/v1` endpoints | Consumes `/api/v1` endpoints |
| Authenticates users, issues session/token credentials | Provides login/logout UI, sends credentials appropriately |
| Validates requests, returns 4xx errors | Displays validation messages, preserves user input |
| Enforces roles and object-level authorization | Adapts visible navigation/actions to authenticated role |
| Queries the relational database | Never connects directly to the database |
| Provides search/filter/sort/pagination metadata | Builds controls sending query params, renders results |
| Returns structured JSON responses | Maps JSON responses to UI state |
| Produces authoritative academic data | Presents/edits that data through authorized workflows |

---

## 4. Frontend Framework Freedom

| Technology Family | Examples |
|---|---|
| JavaScript/TypeScript | React, Vue, Angular, Svelte, Solid, Preact |
| Meta-frameworks as a client | Next.js, Nuxt, SvelteKit, or equivalent — only as frontend client, never as replacement backend |
| Mobile-capable web UI | Ionic or similar, if output remains a client consuming the REST API |
| Other | Subject to instructor approval, if it clearly functions as a frontend client |

> **Pure Frontend Requirement:** If a meta-framework supports server routes/actions/ORM/DB access, those must **not** be used to duplicate or bypass the existing REST API. All authoritative data comes from the backend.

---

## 5. Recommended Frontend Architecture

```
Browser / Frontend Application
 |
 +-- Routes and Layouts
 +-- Pages / Views
 +-- Reusable Components
 +-- Forms and Validation
 +-- State / Query Management
 +-- API Client / Service Layer
 |
 v
 Existing REST API (Backend Activity)
 |
 v
 Existing Database
```

---

## 6. AI-Assisted Development Policy

### 6.1 Appropriate Uses of AI
- Analyze the existing OpenAPI/Swagger spec or REST endpoint docs
- Plan frontend architecture, routing, components, state, API-service boundaries
- Generate framework scaffolding and repetitive UI structures
- Create typed interfaces/data models from API responses
- Draft forms, tables, reusable components, client-side validation
- Debug CORS, auth, routing, state, API integration issues
- Generate unit, component, and E2E test cases
- Review accessibility, usability, performance, security concerns
- Refactor code; improve naming, modularity, consistency
- Assist README, setup, technical documentation

### 6.2 Required Human Verification
- Read and understand generated code before accepting it
- Compare frontend assumptions with the actual backend API contract
- Test successful and failed requests using real backend responses
- Verify role restrictions are still enforced by the backend
- Remove unused, duplicated, insecure, or hallucinated code/dependencies
- Confirm the project builds and runs from documented setup instructions
- Be prepared to explain, modify, or debug any important code during the demo

**Recommended AI Workflow:**
`UNDERSTAND → INSPECT API → PLAN → PROMPT → GENERATE → REVIEW → INTEGRATE → TEST → DEBUG → IMPROVE → DOCUMENT`

### 6.3 AI Development Log

| Entry | Required Information |
|---|---|
| Task | What problem/feature was addressed |
| AI Tool | Tool used (ChatGPT, Claude, Copilot, Cursor, Gemini, etc.) |
| Prompt Summary | Short description of what was asked (no full chain-of-thought needed) |
| Result | What code/design/test/recommendation was produced |
| Human Review | What was accepted/changed/rejected/verified |
| Evidence | Relevant commit, file, test, screenshot, or endpoint |

---

## 7. Technical Requirements

| Area | Minimum Requirement |
|---|---|
| Separate frontend project | Frontend source separate from backend project (monorepo OK if clearly separated) |
| API configuration | Base URL configurable via environment variables/framework config |
| Real API data | Core screens load/modify data from the existing backend |
| Routing | Framework-appropriate routing for public, authenticated, role-aware views |
| Authentication | Login, logout, current-user state, unauthorized/expired session handling |
| CRUD integration | Create, retrieve, update, delete/deactivate via backend API |
| Query features | Search, filtering, sorting, pagination where backend supports it |
| Forms | Structured forms with clear validation feedback |
| States | Loading, empty, success, error, forbidden, not-found |
| Responsive UI | Usable at common desktop and mobile/tablet widths |
| No direct DB access | Never connect directly to MySQL, PostgreSQL, SQL Server, SQLite, etc. |

---

## 8. Environment and API Configuration

Do not hardcode production URLs throughout source code — use framework-appropriate env config.

```
# Example only - naming varies by framework
VITE_API_BASE_URL=http://localhost:8000/api/v1
# or
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

- Commit an `.env.example` or equivalent template — not private secrets
- Do not place DB passwords, JWT signing secrets, service-account secrets, or backend private keys in frontend code
- If backend is served from a different origin, configure CORS deliberately on the backend (don't disable security globally)
- Document how to run frontend + backend together during development

---

## 9. Required Frontend Modules

| Module | Required Frontend Capabilities |
|---|---|
| Authentication | Login; logout; current-user identity; invalid-credential feedback; session/token expiry handling |
| Dashboard | Summary cards/overview from backend data; quick navigation to major modules |
| Students | List, search, filter, paginate, view details, create, edit, delete/deactivate as permitted |
| Programs | List and maintain academic programs via authorized endpoints |
| Courses | List and maintain courses; display code, title, units, status, related details |
| Academic Terms | List and manage academic year/semester records |
| Course Offerings | Create/manage offerings with course, term, section, instructor, schedule, capacity |
| Enrollments | Enroll students, view enrollment lists, update status, prevent duplicate/error states via backend feedback |
| Grades | Authorized grade entry/update and viewing |
| Academic Record | Present the aggregated academic-record endpoint readably |
| Profile / Account | Display authenticated user details and role; optional preferences allowed |

---

## 10. Authentication and Protected Navigation

- Public login page
- Protected application shell/layout after successful auth
- Current-user request (e.g., `GET /api/v1/auth/me`) when backend provides it
- Logout flow clearing client state + calling backend logout/revocation endpoint when required
- Automatic handling of 401 Unauthorized responses
- Forbidden-page/equivalent for 403 responses
- Route guards or protected-route mechanisms appropriate to the framework

> **Security Boundary:** Hiding a button or blocking a route in the frontend is **not** authorization. The backend must remain responsible for deciding whether an action is permitted.

---

## 11. Role-Aware User Experience

| Role | Expected Frontend Behavior |
|---|---|
| Administrator | Navigation/controls for authorized system-management functions |
| Registrar/Staff | Student, enrollment, academic-term, and other permitted management functions |
| Instructor | Assigned offerings, enrolled students, backend-permitted grade workflows |
| Student | Own profile, own enrollments, own grades, own academic record only |

> The exact permission matrix should follow the backend implementation. Frontend behavior must not assume permissions the backend doesn't grant.

---

## 12. API Client / Service Layer

Create a reusable request mechanism (fetch, Axios, Angular HttpClient, a query library, generated OpenAPI client, etc.) with:
- Central API base URL
- Consistent authorization headers/credential settings
- Common JSON parsing and error normalization
- Handling for 401, 403, 404, 409, 422, 500-class responses
- Reusable functions/hooks/services for major resources
- Cancellation or stale-request handling where useful
- Avoid repeated raw endpoint strings and duplicated request boilerplate

---

## 13. API Response and Error Handling

| Backend Response | Frontend Expectation |
|---|---|
| 200 / 201 | Update UI state; show clear success feedback when appropriate |
| 204 | Complete the action without expecting a JSON body |
| 400 | Present a meaningful request error |
| 401 | Return to authentication or attempt documented refresh flow |
| 403 | Show an access-denied state; do not silently fail |
| 404 | Show not-found state or return to the resource list |
| 409 | Explain the conflict (e.g., duplicate enrollment) |
| 422 | Map server-side field validation messages to relevant form fields |
| 500+ | Show a safe general error message; allow retry when appropriate |
| Network failure | Show offline/unreachable-server feedback rather than an infinite loader |

---

## 14. User Interface and Experience Requirements

- Consistent page layout, spacing, typography, colors, buttons, forms, dialogs, tables
- Clear navigation between major modules
- Data tables with readable headers and predictable actions
- Forms with labels, required-field indicators, input help, inline validation
- Confirmation for destructive actions
- Visible loading indicators/skeletons during API requests
- Purposeful empty states when no records exist
- Non-blocking success/error notifications where appropriate
- Responsive behavior across common desktop, tablet, mobile widths
- Keyboard-accessible controls and semantic labels where practical
- Avoid relying on color alone to communicate status

---

## 15. Required Student List Integration

The Students screen is a required demonstration of collection-oriented API integration.

```
GET /api/v1/students?search=dela&program_id=1&year_level=3&page=2&per_page=20
```

- Search field linked to backend search query
- At least two backend-supported filters
- Pagination controls driven by backend pagination metadata
- Sorting when supported by the backend
- Create-student form posting to the API
- Edit-student form populated from backend data
- Delete/deactivate action with confirmation
- Validation messages from the API displayed to the user

---

## 16. Forms and Validation

| Validation Layer | Purpose |
|---|---|
| Client-side | Immediate usability feedback, required fields, basic formats, preventing incomplete submissions |
| Backend | Authoritative validation, uniqueness, authorization, DB relationships, business rules |

Client-side validation improves usability but **must not replace** server-side validation. Interpret backend validation responses and associate errors with the correct form fields.

---

## 17. State and Data Management

- Separate server/API state from temporary UI state where practical
- Avoid unnecessary duplication of the same record in multiple disconnected stores
- Refresh/invalidate stale lists after successful create/update/delete
- Preserve user search/filter state when it improves usability
- Do not treat browser storage as the authoritative database

*(A dedicated state library is not mandatory if built-in framework mechanisms are sufficient.)*

---

## 18. Suggested Frontend Project Structure

```
student-information-frontend/
|-- src/
|   |-- app/ or router/
|   |-- pages/ or views/
|   |-- components/
|   |-- features/
|   |-- services/ or api/
|   |-- hooks/ or composables/
|   |-- stores/ or state/
|   |-- types/ or models/
|   |-- utils/
|   `-- styles/
|-- public/
|-- tests/
|-- .env.example
|-- package.json (or framework equivalent)
`-- README.md
```

---

## 19. Laboratory Development Phases

| Phase | Required Work |
|---|---|
| 1. Review Existing Backend | Run backend API, inspect Swagger/OpenAPI/Postman docs, verify auth, identify base URL + required endpoints |
| 2. Frontend Setup | Select framework, init project, configure routing, env vars, code quality tools, base layout |
| 3. API Client and Authentication | API service/client, login/logout, current-user state, protected routes, 401/403 handling |
| 4. Core Reference Data | Integrate Programs, Courses, Academic Terms (list + authorized CRUD) |
| 5. Student Management | Student list, details, search, filters, pagination, create, edit, delete/deactivate |
| 6. Academic Transactions | Integrate Course Offerings, Enrollments, Grades |
| 7. Academic Record and Role Views | Render aggregated academic records; adapt navigation/actions per role |
| 8. UX Hardening | Loading, empty, validation, error, confirmation, responsive, accessibility states |
| 9. Testing | Component/integration/E2E tests; verify negative API scenarios |
| 10. Documentation and Defense | README, AI Development Log, evidence, build instructions, prepare live demo |

---

## 20. Testing Requirements

| Test Area | Minimum Scenarios |
|---|---|
| Authentication | Successful login; invalid credentials; logout; protected route without auth; expired/invalid session |
| Students | Load list; search; filter; paginate; create; edit; duplicate/validation failure; delete/deactivate |
| Authorization | Attempt action hidden/forbidden to a restricted role; confirm backend returns expected denial |
| Enrollments | Successful enrollment; duplicate/conflict; invalid reference; status change |
| Grades | Authorized update; validation error; unauthorized update |
| Networking | Backend unavailable; slow request/loading state; 500-class response |
| Routing | Refresh on nested route; not-found route; protected navigation |
| Responsive UI | Desktop and narrow/mobile viewport checks |

---

## 21. Automated Testing

Recommended tools: Vitest, Jest, Testing Library, Cypress, Playwright, Angular testing tools, or equivalent.

- At least one authentication-flow test
- At least one API-integrated list or component test
- At least one form validation/error test
- At least one protected-route or authorization-related test
- At least one critical end-to-end flow when supported by project setup

---

## 22. Required Documentation

| Document / Evidence | Minimum Content |
|---|---|
| README.md | Purpose, framework, prerequisites, installation, env config, run/build/test commands, API connection instructions |
| API Integration Map | Frontend page/feature → REST endpoint(s) → HTTP method → role/permission |
| AI Development Log | Concise record of AI-assisted tasks and human verification |
| Screenshots / Evidence | Major screens and important success/error states |
| Test Evidence | Automated test output and/or documented test cases |
| Architecture Note | Routing, API client, auth state, components, data/state strategy |

---

## 23. Required Final Outputs

1. Complete frontend source code
2. Working connection to the existing backend REST API
3. `.env.example` or equivalent configuration template
4. README.md with complete setup and integration instructions
5. API Integration Map
6. AI Development Log
7. Automated tests and/or documented testing evidence
8. Screenshots or equivalent evidence of major modules and error states
9. Git repository with meaningful development history
10. Working production build or framework-equivalent distributable output when applicable

---

## 24. Mandatory Live Demonstration

1. Start or verify the existing REST API (backend)
2. Start the frontend application; show its configured API base URL
3. Attempt an invalid login; show error feedback
4. Login successfully; show authenticated user/role
5. Navigate through a protected application route
6. Load the Students list from the backend
7. Search students using a backend query parameter
8. Apply filters and pagination using backend-supported parameters
9. Create a student and show the new backend record
10. Trigger and display a backend validation error
11. Edit an existing student
12. Delete/deactivate a student with confirmation
13. Load and manage Programs or Courses
14. Load and manage an Academic Term and Course Offering
15. Enroll a student through the API
16. Encode/update a grade as an authorized user
17. Display a student academic record from the aggregate endpoint
18. Demonstrate a restricted role and a 403/authorization scenario
19. Stop/disconnect the backend temporarily; show a controlled network-error state
20. Show responsive behavior; explain architecture, API service, auth strategy, AI-assisted workflow

---

## 25. Minimum Acceptance Criteria

- Frontend starts without critical errors
- Frontend and backend are separate logical applications
- Actual backend API is used for core data
- Authentication and protected navigation work
- Role-aware UI behavior is implemented
- Student CRUD is integrated with real backend data
- Programs, Courses, Academic Terms, Course Offerings, Enrollments, Grades, Academic Record represented in frontend
- Search, filtering, pagination integrated where backend supports it
- Backend validation messages displayed meaningfully
- Loading, empty, network-error, unauthorized, forbidden, not-found states handled
- Usable at desktop and narrow viewport sizes
- No direct database connection in the frontend
- No secrets or backend signing credentials embedded in client code
- Required documentation and test evidence complete

---

## 26. Grading Rubric (100 pts)

| Criterion | Points | Full-Credit Indicators |
|---|---|---|
| REST API Integration | 20 | Real backend integration; centralized API handling; correct methods/parameters; reliable sync after mutations |
| Authentication and Role-Aware Navigation | 15 | Login/logout, protected routes, session/token handling, 401/403 behavior, role-appropriate UI |
| Core Functional Modules | 15 | Students, reference data, course offerings, enrollments, grades, academic record function via API |
| Professional UI/UX | 15 | Consistent modern design, clear navigation, usable tables/forms, confirmations, feedback, responsive layout |
| Forms, Validation and Error States | 10 | Client usability validation + correct server validation display; loading/empty/network/error states |
| Frontend Architecture and Code Quality | 10 | Reusable components/services, clear separation of concerns, framework conventions, readable/maintainable code |
| Testing and Reliability | 5 | Meaningful critical-flow tests + negative/error testing |
| Documentation | 5 | Complete README, integration map, setup, architecture note, evidence |
| AI-Assisted Development and Technical Defense | 5 | Responsible AI use documented; can explain, modify, troubleshoot |
| **TOTAL** | **100** | |

---

## 27. Critical Deficiencies (substantial deductions)

No connection to the existing backend; hardcoded/static core data; direct database access from the frontend; frontend contains a replacement backend; authentication simulated only in the UI; inability to demonstrate API requests; unhandled critical errors; secrets embedded in frontend code; copied/AI-generated implementation that cannot be explained or modified.

---

## 28. Bonus Enhancements

- Advanced accessibility improvements + automated accessibility tests
- Optimistic updates with safe rollback
- Advanced caching or query invalidation
- Offline read-only support for previously fetched non-sensitive data
- Charts or analytics based on backend data
- Dark mode or theme system
- Internationalization/localization
- OpenAPI-generated typed API client
- CI workflow for lint, test, production build
- Containerized frontend deployment or static hosting config
- Performance profiling and bundle optimization

> Bonus features do not replace incomplete core requirements.

---

## 29. Technical Defense Questions

- How does the frontend know the backend base URL?
- Where is authentication state stored and why did you choose that approach?
- What happens when the backend returns 401, 403, 404, 409, or 422?
- Why is hiding a button not sufficient authorization?
- How does your student list implement backend pagination?
- How do you prevent duplicated API request logic across components?
- How do you refresh data after a successful create or update?
- Which validation belongs in the client and which belongs in the backend?
- What part of your project was AI-assisted, and how did you verify the output?
- If the backend changes an endpoint contract, where would you update the frontend?
- How would you diagnose a CORS error?
- How would you change one module if asked during the defense?

---

## 30. Final Integration Goal

**Expected End State:** The backend activity provides a secured, documented Student Information Management REST API. This frontend activity adds an independently developed frontend framework application that authenticates against that API and presents backend capabilities as a usable, professional information system. Together, both activities demonstrate full client-server application development while preserving a clear separation between frontend and backend responsibilities.