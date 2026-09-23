import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { ForbiddenState } from '../components/ui/States'
import LoadingScreen from '../components/ui/Feedback'
import type { Role } from '../types'

/** Blocks anonymous users; redirects to /login while preserving the destination. */
export function RequireAuth(): React.JSX.Element {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <LoadingScreen label="Checking your session…" />

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return <Outlet />
}

/** Admits only authenticated users whose role is in the allowed set. */
export function RequireRole({ roles }: { roles: Role[] }): React.JSX.Element {
  const { user, can } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (!can(...roles)) {
    return <ForbiddenState message="This section is not available for your account role." />
  }

  return <Outlet />
}