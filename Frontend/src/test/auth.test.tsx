import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from './test-utils'

describe('authentication', () => {
  it('signs in a valid user and lands on the dashboard', async () => {
    const user = userEvent.setup()
    renderApp('/login')

    await user.type(screen.getByLabelText(/email address/i), 'admin@sims.test')
    await user.type(screen.getByLabelText(/password/i), 'password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/Welcome back,/i)).toBeInTheDocument()
    expect(localStorage.getItem('sims_token')).toBe('staff-token')
  })

  it('shows an error message for invalid credentials', async () => {
    const user = userEvent.setup()
    renderApp('/login')

    await user.type(screen.getByLabelText(/email address/i), 'admin@sims.test')
    await user.type(screen.getByLabelText(/password/i), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials.')
  })

  it('redirects anonymous visitors away from protected pages to /login', async () => {
    renderApp('/students')

    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument()
    // The protected screen must not be reachable.
    expect(screen.queryByText('Registered students and their program details.')).not.toBeInTheDocument()
  })

  it('returns a user with an expired token to the login screen', async () => {
    localStorage.setItem('sims_token', 'expired-token')
    renderApp('/profile')

    // /auth/me returns 401 → the client broadcasts auth:unauthorized → redirect.
    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(localStorage.getItem('sims_token')).toBeNull()
  })
})