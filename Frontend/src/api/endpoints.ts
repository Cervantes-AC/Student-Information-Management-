import { client, discard, unwrap, unwrapPage } from './client'
import type {
  AcademicRecord,
  AcademicTerm,
  AcademicTermPayload,
  ApiEnvelope,
  CollectionQuery,
  Course,
  CourseOffering,
  CourseOfferingPayload,
  CoursePayload,
  DashboardStats,
  Enrollment,
  EnrollmentPayload,
  EnrollmentUpdatePayload,
  Grade,
  GradeDetail,
  GradePayload,
  InstructorRef,
  LoginResponse,
  Page,
  Program,
  ProgramPayload,
  RosterEntry,
  Student,
  StudentPayload,
  User,
} from '../types'

const qs = (query?: CollectionQuery): Record<string, unknown> =>
  query
    ? Object.fromEntries(
        Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== ''),
      )
    : {}

export const authApi = {
  login: (email: string, password: string): Promise<LoginResponse> =>
    unwrap(client.post<ApiEnvelope<LoginResponse>>('/auth/login', { email, password })),
  me: (): Promise<User> => unwrap(client.get<ApiEnvelope<User>>('/auth/me')),
  logout: (): Promise<void> => discard(client.post<ApiEnvelope<null>>('/auth/logout')),
}

export const dashboardApi = {
  stats: (): Promise<DashboardStats> => unwrap(client.get<ApiEnvelope<DashboardStats>>('/dashboard/stats')),
}

export const instructorsApi = {
  list: (): Promise<InstructorRef[]> => unwrap(client.get<ApiEnvelope<InstructorRef[]>>('/instructors')),
}

export const programsApi = {
  list: (query?: CollectionQuery): Promise<Page<Program>> =>
    unwrapPage(client.get<ApiEnvelope<Program[]>>('/programs', { params: qs(query) })),
  get: (id: number): Promise<Program> => unwrap(client.get<ApiEnvelope<Program>>(`/programs/${id}`)),
  create: (payload: ProgramPayload): Promise<Program> =>
    unwrap(client.post<ApiEnvelope<Program>>('/programs', payload)),
  update: (id: number, payload: Partial<ProgramPayload>): Promise<Program> =>
    unwrap(client.patch<ApiEnvelope<Program>>(`/programs/${id}`, payload)),
  remove: (id: number): Promise<void> => discard(client.delete(`/programs/${id}`)),
}

export const coursesApi = {
  list: (query?: CollectionQuery): Promise<Page<Course>> =>
    unwrapPage(client.get<ApiEnvelope<Course[]>>('/courses', { params: qs(query) })),
  get: (id: number): Promise<Course> => unwrap(client.get<ApiEnvelope<Course>>(`/courses/${id}`)),
  create: (payload: CoursePayload): Promise<Course> =>
    unwrap(client.post<ApiEnvelope<Course>>('/courses', payload)),
  update: (id: number, payload: Partial<CoursePayload>): Promise<Course> =>
    unwrap(client.patch<ApiEnvelope<Course>>(`/courses/${id}`, payload)),
  remove: (id: number): Promise<void> => discard(client.delete(`/courses/${id}`)),
}

export const termsApi = {
  list: (query?: CollectionQuery): Promise<Page<AcademicTerm>> =>
    unwrapPage(client.get<ApiEnvelope<AcademicTerm[]>>('/academic-terms', { params: qs(query) })),
  get: (id: number): Promise<AcademicTerm> =>
    unwrap(client.get<ApiEnvelope<AcademicTerm>>(`/academic-terms/${id}`)),
  create: (payload: AcademicTermPayload): Promise<AcademicTerm> =>
    unwrap(client.post<ApiEnvelope<AcademicTerm>>('/academic-terms', payload)),
  update: (id: number, payload: Partial<AcademicTermPayload>): Promise<AcademicTerm> =>
    unwrap(client.patch<ApiEnvelope<AcademicTerm>>(`/academic-terms/${id}`, payload)),
  remove: (id: number): Promise<void> => discard(client.delete(`/academic-terms/${id}`)),
}

export const studentsApi = {
  list: (query?: CollectionQuery): Promise<Page<Student>> =>
    unwrapPage(client.get<ApiEnvelope<Student[]>>('/students', { params: qs(query) })),
  get: (id: number): Promise<Student> => unwrap(client.get<ApiEnvelope<Student>>(`/students/${id}`)),
  create: (payload: StudentPayload): Promise<Student> =>
    unwrap(client.post<ApiEnvelope<Student>>('/students', payload)),
  update: (id: number, payload: Partial<StudentPayload>): Promise<Student> =>
    unwrap(client.patch<ApiEnvelope<Student>>(`/students/${id}`, payload)),
  remove: (id: number): Promise<void> => discard(client.delete(`/students/${id}`)),
  enrollments: (id: number): Promise<Enrollment[]> =>
    unwrap(client.get<ApiEnvelope<Enrollment[]>>(`/students/${id}/enrollments`)),
  grades: (id: number): Promise<GradeDetail[]> =>
    unwrap(client.get<ApiEnvelope<GradeDetail[]>>(`/students/${id}/grades`)),
  academicRecord: (id: number): Promise<AcademicRecord> =>
    unwrap(client.get<ApiEnvelope<AcademicRecord>>(`/students/${id}/academic-record`)),
}

export const offeringsApi = {
  list: (query?: CollectionQuery): Promise<Page<CourseOffering>> =>
    unwrapPage(client.get<ApiEnvelope<CourseOffering[]>>('/course-offerings', { params: qs(query) })),
  get: (id: number): Promise<CourseOffering> =>
    unwrap(client.get<ApiEnvelope<CourseOffering>>(`/course-offerings/${id}`)),
  create: (payload: CourseOfferingPayload): Promise<CourseOffering> =>
    unwrap(client.post<ApiEnvelope<CourseOffering>>('/course-offerings', payload)),
  update: (id: number, payload: Partial<CourseOfferingPayload>): Promise<CourseOffering> =>
    unwrap(client.patch<ApiEnvelope<CourseOffering>>(`/course-offerings/${id}`, payload)),
  remove: (id: number): Promise<void> => discard(client.delete(`/course-offerings/${id}`)),
  roster: (id: number): Promise<RosterEntry[]> =>
    unwrap(client.get<ApiEnvelope<RosterEntry[]>>(`/course-offerings/${id}/students`)),
}

export const enrollmentsApi = {
  list: (query?: CollectionQuery): Promise<Page<Enrollment>> =>
    unwrapPage(client.get<ApiEnvelope<Enrollment[]>>('/enrollments', { params: qs(query) })),
  get: (id: number): Promise<Enrollment> =>
    unwrap(client.get<ApiEnvelope<Enrollment>>(`/enrollments/${id}`)),
  create: (payload: EnrollmentPayload): Promise<Enrollment> =>
    unwrap(client.post<ApiEnvelope<Enrollment>>('/enrollments', payload)),
  update: (id: number, payload: EnrollmentUpdatePayload): Promise<Enrollment> =>
    unwrap(client.patch<ApiEnvelope<Enrollment>>(`/enrollments/${id}`, payload)),
  remove: (id: number): Promise<void> => discard(client.delete(`/enrollments/${id}`)),
}

export const gradesApi = {
  list: (query?: CollectionQuery): Promise<Page<Grade>> =>
    unwrapPage(client.get<ApiEnvelope<Grade[]>>('/grades', { params: qs(query) })),
  get: (id: number): Promise<Grade> => unwrap(client.get<ApiEnvelope<Grade>>(`/grades/${id}`)),
  create: (payload: GradePayload): Promise<Grade> =>
    unwrap(client.post<ApiEnvelope<Grade>>('/grades', payload)),
  update: (id: number, payload: Omit<Partial<GradePayload>, 'enrollment_id'>): Promise<Grade> =>
    unwrap(client.patch<ApiEnvelope<Grade>>(`/grades/${id}`, payload)),
}

export const myApi = {
  enrollments: (): Promise<Enrollment[]> => unwrap(client.get<ApiEnvelope<Enrollment[]>>('/my/enrollments')),
  grades: (): Promise<GradeDetail[]> => unwrap(client.get<ApiEnvelope<GradeDetail[]>>('/my/grades')),
  academicRecord: (): Promise<AcademicRecord> =>
    unwrap(client.get<ApiEnvelope<AcademicRecord>>('/my/academic-record')),
}