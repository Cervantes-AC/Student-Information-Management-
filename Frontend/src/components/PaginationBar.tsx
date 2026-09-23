import type { ApiMeta } from '../types'

interface PaginationBarProps {
  meta: ApiMeta | null
  page: number
  onPageChange: (page: number) => void
  perPage: number
  onPerPageChange: (perPage: number) => void
}

export function PaginationBar({
  meta,
  page,
  onPageChange,
  perPage,
  onPerPageChange,
}: PaginationBarProps): React.JSX.Element | null {
  if (!meta || meta.total === 0) return null

  const lastPage = Math.max(1, meta.last_page)

  return (
    <div className="pagination">
      <span className="pagination-info">
        {meta.from ?? 0}–{meta.to ?? 0} of {meta.total}
      </span>
      <div className="pagination-controls">
        <button type="button" className="btn btn-sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          ‹ Prev
        </button>
        <span className="pagination-page">
          Page {page} of {lastPage}
        </span>
        <button
          type="button"
          className="btn btn-sm"
          disabled={page >= lastPage}
          onClick={() => onPageChange(page + 1)}
        >
          Next ›
        </button>
      </div>
      <label className="pagination-size">
        Per page
        <select
          className="input input-sm"
          value={perPage}
          onChange={(event) => onPerPageChange(Number(event.target.value))}
        >
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </label>
    </div>
  )
}