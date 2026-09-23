import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** MSW node server intercepts the axios/XHR requests made inside jsdom. */
export const server = setupServer(...handlers)