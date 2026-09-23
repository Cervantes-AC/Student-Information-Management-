import type { Program, Student, User } from '../types'

export const ISO = '2026-01-15T08:00:00.000Z'

export const adminUser: User = {
  id: 1,
  name: 'System Administrator',
  email: 'admin@sims.test',
  role: 'administrator',
  role_label: 'Administrator',
  status: 'active',
  student_id: null,
}

export const studentUser: User = {
  id: 5,
  name: 'Juan Dela Cruz',
  email: 'student@sims.test',
  role: 'student',
  role_label: 'Student',
  status: 'active',
  student_id: 1,
}

export const instructorUser: User = {
  id: 2,
  name: 'Prof. Maria Instructor',
  email: 'instructor@sims.test',
  role: 'instructor',
  role_label: 'Instructor',
  status: 'active',
  student_id: null,
}

export const programs: Program[] = [
  {
    id: 1,
    code: 'BSIT',
    name: 'Bachelor of Science in Information Technology',
    description: 'Information technology program',
    status: 'active',
    created_at: ISO,
    updated_at: ISO,
  },
  {
    id: 2,
    code: 'BSCS',
    name: 'Bachelor of Science in Computer Science',
    description: null,
    status: 'active',
    created_at: ISO,
    updated_at: ISO,
  },
]

export const students: Student[] = [
  {
    id: 1,
    student_number: '2026-00001',
    full_name: 'Juan Reyes Dela Cruz',
    first_name: 'Juan',
    middle_name: 'Reyes',
    last_name: 'Dela Cruz',
    suffix: null,
    birth_date: '2004-05-21',
    email: 'juan.delacruz@sims.test',
    contact_number: null,
    address: 'Manila',
    program_id: 1,
    program: { id: 1, code: 'BSIT', name: 'Bachelor of Science in Information Technology' },
    year_level: 1,
    status: 'active',
    created_at: ISO,
    updated_at: ISO,
  },
  {
    id: 2,
    student_number: '2026-00002',
    full_name: 'Maria Santos Lopez',
    first_name: 'Maria',
    middle_name: 'Santos',
    last_name: 'Lopez',
    suffix: null,
    birth_date: '2003-11-02',
    email: 'maria.lopez@sims.test',
    contact_number: '0917 000 0000',
    address: 'Quezon City',
    program_id: 2,
    program: { id: 2, code: 'BSCS', name: 'Bachelor of Science in Computer Science' },
    year_level: 2,
    status: 'active',
    created_at: ISO,
    updated_at: ISO,
  },
]