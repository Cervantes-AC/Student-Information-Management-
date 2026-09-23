import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '../router'
import { STAFF_TOKEN, STUDENT_TOKEN, INSTRUCTOR_TOKEN } from './handlers'

/** Render the full routed app inside a memory router, starting at `entry`. */
export function renderApp(entry = '/') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

export function seedStaff() {
  localStorage.setItem('sims_token', STAFF_TOKEN)
}

export function seedStudent() {
  localStorage.setItem('sims_token', STUDENT_TOKEN)
}

export function seedInstructor() {
  localStorage.setItem('sims_token', INSTRUCTOR_TOKEN)
}