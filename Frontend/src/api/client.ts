import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import type { ApiEnvelope, ApiMeta } from '../types'

/**
 * Base URL for the SIMS REST API. Override via VITE_API_BASE_URL
 * (see .env.example). Defaults to the local backend dev server.
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

export const TOKEN_KEY = 'sims_token'

/** Normalized error thrown for every failed API call. */
export class ApiError extends Error {
  readonly status: number
  readonly errors?: Record<string, string[]>

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function storeToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

// Attach the bearer token to every request.
client.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Normalize failures into ApiError and signal session expiry.
client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const axiosError = error as { response?: { status: number; data?: ApiEnvelope<unknown> }; message?: string }

    const status = axiosError.response?.status ?? 0

    if (status === 401) {
      storeToken(null)
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }

    const message =
      axiosError.response?.data?.message ??
      (status === 0 || !axiosError.response
        ? 'Cannot reach the API server. Check that the backend is running.'
        : 'An unexpected error occurred.')

    return Promise.reject(new ApiError(status, message, axiosError.response?.data?.errors))
  },
)

async function unwrap<T>(promise: Promise<AxiosResponse<ApiEnvelope<T>>>): Promise<T> {
  const { data } = await promise
  return data.data
}

async function unwrapPage<T>(promise: Promise<AxiosResponse<ApiEnvelope<T[]>>>): Promise<{ items: T[]; meta: ApiMeta | null }> {
  const { data } = await promise
  return { items: data.data, meta: data.meta ?? null }
}

async function discard(promise: Promise<AxiosResponse<unknown>>): Promise<void> {
  await promise
}

export { client, unwrap, unwrapPage, discard }