import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp, seedStaff, seedStudent } from './test-utils'
import { capture } from './handlers'

describe('students screen', () => {
  it('lists students for staff users', async () => {
    seedStaff()
    renderApp('/students')

    expect(await screen.findByText('Juan Reyes Dela Cruz')).toBeInTheDocument()
    expect(screen.getByText('Maria Santos Lopez')).toBeInTheDocument()
  })

  it('sends the search term to the API and renders the filtered results', async () => {
    seedStaff()
    const user = userEvent.setup()
    renderApp('/students')

    await screen.findByText('Maria Santos Lopez')

    await user.type(screen.getByLabelText('Search records'), 'Maria')

    // The debounced query must reach the API…
    await waitFor(
      () => {
        expect(capture.studentSearch).toBe('Maria')
      },
      { timeout: 2500 },
    )
    // …and the table must show only the server-filtered rows.
    expect(await screen.findByText('Maria Santos Lopez')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByText('Juan Reyes Dela Cruz')).not.toBeInTheDocument()
    })
  })

  it('blocks students from staff-only screens with the forbidden state', async () => {
    seedStudent()
    renderApp('/students')

    expect(await screen.findByText('Access denied')).toBeInTheDocument()
    expect(screen.queryByText(/Registered students/i)).not.toBeInTheDocument()
  })
})