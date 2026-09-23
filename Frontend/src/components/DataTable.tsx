import type { ReactNode } from 'react'
import { SkeletonRows } from './ui/Feedback'
import { EmptyState } from './ui/States'

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  render?: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  loading?: boolean
  sort?: string
  order?: 'asc' | 'desc'
  onSort?: (key: string) => void
  emptyTitle?: string
  emptyMessage?: string
  onRowClick?: (row: T) => void
  ariaLabel?: string
}

export function renderFallback(row: unknown, key: string): ReactNode {
  const record = row as Record<string, unknown>
  const value = record[key]
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  sort,
  order,
  onSort,
  emptyTitle = 'No records found',
  emptyMessage = 'There are no records to display for these criteria.',
  onRowClick,
  ariaLabel = 'Data table',
}: DataTableProps<T>): React.JSX.Element {
  const headerCell = (column: Column<T>): ReactNode => {
    if (!column.sortable || !onSort) return column.header
    const active = sort === column.key
    const arrow = active ? (order === 'asc' ? ' ↑' : ' ↓') : ' ⇅'
    return (
      <button
        type="button"
        className="sort-btn"
        onClick={() => onSort(column.key)}
        aria-label={`Sort by ${column.header}`}
      >
        {column.header}
        <span className={active ? 'sort-arrow active' : 'sort-arrow'}>{arrow}</span>
      </button>
    )
  }

  return (
    <div className="table-wrap">
      <table className="data-table" aria-label={ariaLabel}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.className}>
                {headerCell(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? null : (
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'row-clickable' : undefined}
              >
                {columns.map((column) => (
                  <td key={column.key} className={column.className}>
                    {column.render ? column.render(row) : renderFallback(row, column.key)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {loading ? (
        <SkeletonRows rows={5} />
      ) : rows.length === 0 ? (
        <EmptyState title={emptyTitle} message={emptyMessage} />
      ) : null}
    </div>
  )
}