import type { EnrollmentStatus, RecordStatus, Role, RoleLabelMap } from '../types'

export const ROLE_LABELS: RoleLabelMap = {
  administrator: 'Administrator',
  registrar: 'Registrar',
  instructor: 'Instructor',
  student: 'Student',
}

export const STATUS_LABELS: Record<'active' | 'inactive' | 'enrolled' | 'dropped' | 'completed', string> =
  {
    active: 'Active',
    inactive: 'Inactive',
    enrolled: 'Enrolled',
    dropped: 'Dropped',
    completed: 'Completed',
  }

/** Format an ISO date/datetime as a readable local date; '' when absent. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

/** Give user-facing text for a record status. */
export function statusText(status: string): string {
  return STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status
}

export function roleText(role: Role): string {
  return ROLE_LABELS[role] ?? role
}

/** Simple year-level ordinal (1 -> "1st", 4 -> "4th"). */
export function ordinalYear(level: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = level % 100
  return `${level}${suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0]}`
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function isStaff(role: Role): boolean {
  return role === 'administrator' || role === 'registrar'
}

export function canManageGrading(role: Role): boolean {
  return isStaff(role) || role === 'instructor'
}

export interface EnrollmentStatusInfo {
  label: string
  tone: 'success' | 'muted' | 'warning'
}

export function enrollmentStatusInfo(status: EnrollmentStatus): EnrollmentStatusInfo {
  switch (status) {
    case 'enrolled':
      return { label: 'Enrolled', tone: 'success' }
    case 'completed':
      return { label: 'Completed', tone: 'muted' }
    case 'dropped':
      return { label: 'Dropped', tone: 'warning' }
  }
}

export interface StatusInfo {
  label: string
  tone: 'success' | 'muted' | 'warning' | 'danger'
}

export function recordStatusInfo(status: RecordStatus): StatusInfo {
  return status === 'active' ? { label: 'Active', tone: 'success' } : { label: 'Inactive', tone: 'danger' }
}

/** Format 1.00–5.00 grade scale value as a fixed two-decimal string. */
export function formatGrade(grade: number | null): string {
  return grade === null || grade === undefined ? '—' : grade.toFixed(2)
}