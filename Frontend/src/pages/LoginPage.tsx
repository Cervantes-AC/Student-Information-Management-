import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../api/client'
import { TextInput, toLocalErrors } from '../components/ui/Form'
import { Spinner } from '../components/ui/Feedback'

export default function LoginPage(): React.JSX.Element {
  const { login, status } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Already signed in (skip the form while a login submit is in flight).
  if (status === 'authenticated' && !busy) {
    return <Navigate to="/" replace />
  }

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setFieldErrors({})
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        if (err.errors) setFieldErrors(toLocalErrors(err.errors))
      } else {
        setError('Unable to sign in. Please try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <span className="brand-mark" aria-hidden="true">
            🎓
          </span>
          <h1>SIMS</h1>
          <p className="muted">Student Information Management System</p>
        </div>

        {error ? (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        ) : null}

        <TextInput
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={email}
          error={fieldErrors.email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextInput
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          error={fieldErrors.password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? (
            <>
              <Spinner size="sm" /> Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>

        <div className="login-links">
          <Link to="/">Back to home</Link>
        </div>
      </form>
    </div>
  )
}