import { describe, expect, it } from 'vitest'
import {
  enrollmentStatusInfo,
  formatDate,
  formatGrade,
  initials,
  ordinalYear,
  recordStatusInfo,
} from '../utils/format'

describe('format helpers', () => {
  it('formats grades on the 1.00–5.00 scale', () => {
    expect(formatGrade(1.5)).toBe('1.50')
    expect(formatGrade(5)).toBe('5.00')
    expect(formatGrade(null)).toBe('—')
  })

  it('produces ordinal year labels', () => {
    expect(ordinalYear(1)).toBe('1st')
    expect(ordinalYear(2)).toBe('2nd')
    expect(ordinalYear(3)).toBe('3rd')
    expect(ordinalYear(4)).toBe('4th')
    expect(ordinalYear(21)).toBe('21st')
  })

  it('derives initials from a full name', () => {
    expect(initials('Juan Reyes Dela Cruz')).toBe('JR')
    expect(initials('Maria')).toBe('M')
  })

  it('maps enrollment statuses to label + tone', () => {
    expect(enrollmentStatusInfo('enrolled')).toEqual({ label: 'Enrolled', tone: 'success' })
    expect(enrollmentStatusInfo('dropped').label).toBe('Dropped')
    expect(enrollmentStatusInfo('completed').tone).toBe('muted')
  })

  it('maps record statuses', () => {
    expect(recordStatusInfo('active').label).toBe('Active')
    expect(recordStatusInfo('inactive')).toEqual({ label: 'Inactive', tone: 'danger' })
  })

  it('renders a dash for empty dates', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate('')).toBe('—')
  })
})