import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './server'
import { capture } from './handlers'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  server.resetHandlers()
  cleanup()
  capture.studentSearch = ''
  capture.programCreateBody = null
})

afterAll(() => server.close())

beforeEach(() => {
  // Fresh auth state + clean URL for every test.
  localStorage.clear()
  window.history.pushState({}, '', '/')
})