// API contract types mirroring the SIMS backend response shapes (app/Support/Presenters.php).

export type Role = 'administrator' | 'registrar' | 'instructor' | 'student'
export type RecordStatus = 'active' | 'inactive'
export type EnrollmentStatus = 'enrolled' | 'dropped' | 'completed'
export type RoleLabelMap = Record<Role, string>

export interface User {
  id: number
  name: string
  email: string
  role: Role
  role_label: string
  status: RecordStatus
  student_id: number | null
}

/** Compact instructor reference used by assignment forms. */
export interface InstructorRef {
  id: number
  name: string
  email: string
}

export interface ApiMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
  from: number | null
  to: number | null
}

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
  meta?: ApiMeta
  errors?: Record<string, string[]>
}

export interface LoginResponse {
  token: string
  user: User
}

export interface Page<T> {
  items: T[]
  meta: ApiMeta | null
}

/** Query params shared by every collection endpoint. Extra keys become filters. */
export interface CollectionQuery {
  page?: number
  per_page?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  [key: string]: unknown
}

export interface Program {
  id: number
  code: string
  name: string
  description: string | null
  status: RecordStatus
  created_at: string
  updated_at: string
}

export interface ProgramPayload {
  code: string
  name: string
  description?: string | null
  status?: RecordStatus
}

export interface Course {
  id: number
  course_code: string
  course_title: string
  description: string | null
  units: number
  status: RecordStatus
  created_at: string
  updated_at: string
}

export interface CoursePayload {
  course_code: string
  course_title: string
  description?: string | null
  units?: number
  status?: RecordStatus
}

export interface AcademicTerm {
  id: number
  academic_year: string
  semester: '1st' | '2nd' | 'Summer'
  display_name: string
  start_date: string | null
  end_date: string | null
  status: RecordStatus
}

export interface AcademicTermPayload {
  academic_year: string
  semester: '1st' | '2nd' | 'Summer'
  start_date?: string | null
  end_date?: string | null
  status?: RecordStatus
}

export interface Student {
  id: number
  student_number: string
  full_name: string
  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null
  birth_date: string | null
  email: string | null
  contact_number: string | null
  address: string | null
  program_id: number
  program: Pick<Program, 'id' | 'code' | 'name'> | null
  year_level: number
  status: RecordStatus
  created_at: string
  updated_at: string
}

export interface StudentPayload {
  student_number: string
  first_name: string
  middle_name?: string | null
  last_name: string
  suffix?: string | null
  birth_date?: string | null
  email?: string | null
  contact_number?: string | null
  address?: string | null
  program_id: number
  year_level: number
  status?: RecordStatus
}

export interface CourseOffering {
  id: number
  section: string
  schedule: string | null
  room: string | null
  capacity: number
  status: RecordStatus
  course: Pick<Course, 'id' | 'course_code' | 'course_title' | 'units'> | null
  academic_term: AcademicTerm
  instructor: Pick<User, 'id' | 'name' | 'email'> | null
  created_at: string
  updated_at: string
}

export interface CourseOfferingPayload {
  course_id: number
  academic_term_id: number
  instructor_id: number
  section: string
  schedule?: string | null
  room?: string | null
  capacity?: number
  status?: RecordStatus
}

export interface Grade {
  id: number
  enrollment_id: number
  midterm_grade: number | null
  final_grade: number | null
  remarks: string | null
  created_at: string
  updated_at: string
}

export interface GradePayload {
  enrollment_id: number
  midterm_grade?: number | null
  final_grade?: number | null
  remarks?: string | null
}

export interface GradeDetail extends Grade {
  course: Pick<Course, 'id' | 'course_code' | 'course_title' | 'units'> | null
  section: string | null
  academic_term: AcademicTerm
}

export interface Enrollment {
  id: number
  enrollment_date: string | null
  status: EnrollmentStatus
  student: Student
  course_offering: CourseOffering
  grade: Grade | null
}

export interface EnrollmentPayload {
  student_id: number
  course_offering_id: number
  enrollment_date?: string | null
  status?: EnrollmentStatus
}

export interface EnrollmentUpdatePayload {
  enrollment_date?: string | null
  status?: EnrollmentStatus
}

export interface RosterEntry {
  enrollment_id: number
  enrollment_date: string | null
  student: Student
  grade: Grade | null
}

export interface AcademicRecordCourse {
  enrollment_id: number
  status: EnrollmentStatus
  course: Pick<Course, 'course_code' | 'course_title' | 'units'> | null
  section: string | null
  midterm_grade: number | null
  final_grade: number | null
  remarks: string | null
  grade_point: number | null
}

export interface AcademicRecordTerm {
  academic_term: AcademicTerm
  average: number | null
  courses: AcademicRecordCourse[]
}

export interface AcademicRecord {
  student: Student
  terms: AcademicRecordTerm[]
  overall_average: number | null
}

export interface StaffStats {
  students: number
  programs: number
  courses: number
  academic_terms: number
  course_offerings: number
  enrollments: number
  active_enrollments: number
  instructors: number
}

export interface InstructorStats {
  assigned_offerings: number
  enrolled_students: number
  grades_encoded: number
}

export interface StudentStats {
  enrollments: number
  active_enrollments: number
  grades_encoded: number
}

export type DashboardStats = StaffStats | InstructorStats | StudentStats