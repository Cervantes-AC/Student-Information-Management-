import type { ReactNode } from 'react'

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'primary'

export function Badge({ tone = 'muted', children }: { tone?: Tone; children: ReactNode }): React.JSX.Element {
  return <span className={`badge badge-${tone}`}>{children}</span>
}