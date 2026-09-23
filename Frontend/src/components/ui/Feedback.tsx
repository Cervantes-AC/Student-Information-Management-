import type { ReactNode } from 'react'

export function Spinner({ size = 'md', label }: { size?: 'sm' | 'md' | 'lg'; label?: string }): React.JSX.Element {
  const px = size === 'sm' ? 14 : size === 'lg' ? 40 : 22
  return (
    <span className="spinner" role="status" aria-label={label ?? 'Loading'} style={{ width: px, height: px }} />
  )
}

export default function LoadingScreen({ label = 'Loading…' }: { label?: string }): React.JSX.Element {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <Spinner size="lg" />
      <p className="muted">{label}</p>
    </div>
  )
}

export function LoadingBlock({ height = 220 }: { height?: number }): React.JSX.Element {
  return (
    <div className="loading-block" role="status" style={{ minHeight: height }}>
      <Spinner size="lg" />
    </div>
  )
}

export function SkeletonRows({ rows = 5 }: { rows?: number }): React.JSX.Element {
  return (
    <div className="skeleton-rows" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="skeleton-row">
          <div className="skeleton-line" style={{ width: '40%' }} />
          <div className="skeleton-line" style={{ width: '75%' }} />
          <div className="skeleton-line" style={{ width: '55%' }} />
          <div className="skeleton-line" style={{ width: '25%' }} />
        </div>
      ))}
    </div>
  )
}

export function InlineIcon({ children }: { children: ReactNode }): React.JSX.Element {
  return <span className="inline-icon">{children}</span>
}