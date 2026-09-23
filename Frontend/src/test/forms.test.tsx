import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp, seedStaff } from './test-utils'
import { capture } from './handlers'

describe('form validation mapping', () => {
  it('maps 422 field errors from the API into the program form', async () => {
    seedStaff()
    const user = userEvent.setup()
    renderApp('/programs')

    await screen.findByText('BSIT')

    await user.click(screen.getByRole('button', { name: /new program/i }))
    await user.type(screen.getByLabelText(/program code/i), 'BSIT')
    await user.type(screen.getByLabelText(/program name/i), 'Duplicate Program')
    await user.click(screen.getByRole('button', { name: /save program/i }))

    expect(await screen.findByText('The program code has already been taken.')).toBeInTheDocument()
    // The invalid data was actually submitted to the API.
    expect(capture.programCreateBody?.code).toBe('BSIT')
  })
})