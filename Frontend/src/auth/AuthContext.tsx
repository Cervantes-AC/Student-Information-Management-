import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../api/endpoints'
import { storeToken } from '../api/client'
import type { Role, User } from '../types'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  user: User | null
  status: AuthStatus
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  can: (...roles: Role[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Emitted by the HTTP client whenever any request returns 401. */
const UNAUTHORIZED_EVENT = 'auth:unauthorized'

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Token is already invalid/expired — clear locally regardless.
    }
    storeToken(null)
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password)
    storeToken(result.token)
    setUser(result.user)
    setStatus('authenticated')
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('sims_token')
    if (!token) {
      setStatus('unauthenticated')
      return
    }

    let cancelled = false
    authApi
      .me()
      .then((me) => {
        if (cancelled) return
        setUser(me)
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        storeToken(null)
        setUser(null)
        setStatus('unauthenticated')
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const handleUnauthorized = (): void => {
      setUser(null)
      setStatus('unauthenticated')
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [])

  const can = useCallback(
    (...roles: Role[]) => (user ? roles.includes(user.role) : false),
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, logout, can }),
    [user, status, login, logout, can],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}