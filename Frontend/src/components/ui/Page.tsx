import type { ReactNode } from 'react'
import { Badge } from './Badge'

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}): React.JSX.Element {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p className="muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </div>
  )
}

export function StatCard({
  label,
  value,
  tone = 'primary',
  hint,
}: {
  label: string
  value: ReactNode
  tone?: 'primary' | 'success' | 'info' | 'warning'
  hint?: string
}): React.JSX.Element {
  return (
    <div className="stat-card">
      <div className={`stat-value stat-${tone}`}>{value}</div>
      <div className="stat-label">{label}</div>
      {hint ? (
        <div className="stat-hint">
          <Badge tone="muted">{hint}</Badge>
        </div>
      ) : null}
    </div>
  )
}

export function DetailRow({ label, value }: { label: string; value: ReactNode }): React.JSX.Element {
  return (
    <div className="detail-row">
      <dt>{label}</dt>
      <dd>{value ?? '—'}</dd>
    </div>
  )
}