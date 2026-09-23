import { http, HttpResponse } from 'msw'
import type { ApiMeta, User } from '../types'
import { ISO, adminUser, instructorUser, programs, studentUser, students } from './fixtures'

/** The API base URL the axios client resolves to in tests. */
export const API = 'http://localhost:8000/api/v1'

export const STAFF_TOKEN = 'staff-token'
export const STUDENT_TOKEN = 'student-token'
export const INSTRUCTOR_TOKEN = 'instructor-token'

/** Captured by handlers so tests can assert the exact query sent. */
export const capture = {
  studentSearch: '',
  programCreateBody: null as Record<string, unknown> | null,
}

function ok(data: unknown, message = 'OK', meta?: ApiMeta) {
  return { success: true, message, data, meta }
}

function fail(message: string) {
  return { success: false, message, data: null }
}

function fail422(errors: Record<string, string[]>) {
  return { success: false, message: 'The given data was invalid.', data: null, errors }
}

function userFor(request: Request): User | null {
  const auth = request.headers.get('Authorization')
  if (auth === `Bearer ${STAFF_TOKEN}`) return adminUser
  if (auth === `Bearer ${STUDENT_TOKEN}`) return studentUser
  if (auth === `Bearer ${INSTRUCTOR_TOKEN}`) return instructorUser
  return null
}

function isStaff(user: User): boolean {
  return user.role === 'administrator' || user.role === 'registrar'
}

export const handlers = [
  // ── Auth ────────────────────────────────────────────────────────────
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }
    if (body.email === 'admin@sims.test' && body.password === 'password') {
      return HttpResponse.json(ok({ token: STAFF_TOKEN, user: adminUser }, 'Logged in successfully.'))
    }
    if (body.email === 'student@sims.test' && body.password === 'password') {
      return HttpResponse.json(ok({ token: STUDENT_TOKEN, user: studentUser }, 'Logged in successfully.'))
    }
    return HttpResponse.json(fail('Invalid credentials.'), { status: 401 })
  }),

  http.get(`${API}/auth/me`, ({ request }) => {
    const user = userFor(request)
    if (!user) return HttpResponse.json(fail('Unauthenticated.'), { status: 401 })
    return HttpResponse.json(ok(user, 'Authenticated user retrieved.'))
  }),

  http.post(`${API}/auth/logout`, ({ request }) => {
    if (!userFor(request)) return HttpResponse.json(fail('Unauthenticated.'), { status: 401 })
    return HttpResponse.json(ok(null, 'Logged out successfully.'))
  }),

  // ── Dashboard ───────────────────────────────────────────────────────
  http.get(`${API}/dashboard/stats`, ({ request }) => {
    const user = userFor(request)
    if (!user) return HttpResponse.json(fail('Unauthenticated.'), { status: 401 })
    const stats =
      user.role === 'instructor'
        ? { assigned_offerings: 3, enrolled_students: 42, grades_encoded: 12 }
        : user.role === 'student'
          ? { enrollments: 5, active_enrollments: 4, grades_encoded: 4 }
          : { students: 2, programs: 2, courses: 8, academic_terms: 2, course_offerings: 6, enrollments: 9, active_enrollments: 8, instructors: 2 }
    return HttpResponse.json(ok(stats, 'Dashboard statistics retrieved.'))
  }),

  // ── Programs ────────────────────────────────────────────────────────
  http.get(`${API}/programs`, ({ request }) => {
    if (!isStaff(userFor(request) as User)) return HttpResponse.json(fail('Forbidden.'), { status: 403 })
    return HttpResponse.json(
      ok(programs, 'Programs retrieved.', {
        current_page: 1,
        per_page: 15,
        total: programs.length,
        last_page: 1,
        from: 1,
        to: programs.length,
      }),
    )
  }),

  http.post(`${API}/programs`, async ({ request }) => {
    if (!isStaff(userFor(request) as User)) return HttpResponse.json(fail('Forbidden.'), { status: 403 })
    const body = (await request.json()) as Record<string, unknown>
    capture.programCreateBody = body
    if (body.code === 'BSIT') {
      return HttpResponse.json(fail422({ code: ['The program code has already been taken.'] }), { status: 422 })
    }
    return HttpResponse.json(
      ok({ id: 99, ...body, status: 'active', created_at: ISO, updated_at: ISO }, 'Program created.'),
      { status: 201 },
    )
  }),

  // ── Students ────────────────────────────────────────────────────────
  http.get(`${API}/students`, ({ request }) => {
    const user = userFor(request)
    if (!user) return HttpResponse.json(fail('Unauthenticated.'), { status: 401 })
    if (!isStaff(user)) return HttpResponse.json(fail('Forbidden.'), { status: 403 })

    const url = new URL(request.url)
    const search = url.searchParams.get('search') ?? ''
    capture.studentSearch = search
    const filtered = search
      ? students.filter((student) => student.full_name.toLowerCase().includes(search.toLowerCase()))
      : students
    return HttpResponse.json(
      ok(filtered, 'Students retrieved.', {
        current_page: 1,
        per_page: 15,
        total: filtered.length,
        last_page: 1,
        from: filtered.length ? 1 : null,
        to: filtered.length ? filtered.length : null,
      }),
    )
  }),
]