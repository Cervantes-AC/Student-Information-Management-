import type { ReactNode } from 'react'

interface ListToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  children?: ReactNode
  actions?: ReactNode
}

/** Search input + filter controls shown above every list screen. */
export function ListToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  children,
  actions,
}: ListToolbarProps): React.JSX.Element {
  return (
    <div className="toolbar">
      <div className="toolbar-filters">
        <input
          className="input search-input"
          type="search"
          value={search}
          placeholder={searchPlaceholder}
          aria-label="Search records"
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {children}
      </div>
      {actions ? <div className="toolbar-actions">{actions}</div> : null}
    </div>
  )
}