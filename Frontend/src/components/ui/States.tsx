import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function EmptyState({
  title = 'Nothing here yet',
  message = 'No records match the current filters.',
  action,
}: {
  title?: string
  message?: string
  action?: ReactNode
}): React.JSX.Element {
  return (
    <div className="state" data-type="empty">
      <div className="state-icon">🗂️</div>
      <h3>{title}</h3>
      <p className="muted">{message}</p>
      {action ? <div className="state-action">{action}</div> : null}
    </div>
  )
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}): React.JSX.Element {
  return (
    <div className="state" data-type="error" role="alert">
      <div className="state-icon">⚠️</div>
      <h3>{title}</h3>
      {message ? <p className="muted">{message}</p> : null}
      {onRetry ? (
        <div className="state-action">
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function ForbiddenState({ message }: { message?: string }): React.JSX.Element {
  return (
    <div className="state" data-type="forbidden">
      <div className="state-icon">🔒</div>
      <h3>Access denied</h3>
      <p className="muted">{message ?? 'You are not authorized to view this content.'}</p>
      <div className="state-action">
        <Link className="btn btn-primary" to="/">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}

export function NotFoundState({ message }: { message?: string }): React.JSX.Element {
  return (
    <div className="state" data-type="notfound">
      <div className="state-icon">🔍</div>
      <h3>Page not found</h3>
      <p className="muted">{message ?? 'The page you are looking for does not exist.'}</p>
      <div className="state-action">
        <Link className="btn btn-primary" to="/">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }): React.JSX.Element {
  return (
    <header className="section-heading">
      <h2>{title}</h2>
      {subtitle ? <p className="muted">{subtitle}</p> : null}
    </header>
  )
}