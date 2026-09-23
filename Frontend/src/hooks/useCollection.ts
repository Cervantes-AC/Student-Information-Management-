import { useCallback, useEffect, useRef, useState } from 'react'
import type { ApiMeta, CollectionQuery, Page } from '../types'

export interface CollectionController<T> {
  items: T[]
  meta: ApiMeta | null
  loading: boolean
  error: string | null
  filters: Record<string, string>
  /** Debounced search box value. */
  search: string
  setSearch: (value: string) => void
  setFilter: (key: string, value: string) => void
  clearFilters: () => void
  page: number
  setPage: (page: number) => void
  perPage: number
  setPerPage: (perPage: number) => void
  sort: string
  setSort: (column: string) => void
  order: 'asc' | 'desc'
  reload: () => void
}

interface Options {
  defaultPerPage?: number
  defaultSort?: string
  defaultOrder?: 'asc' | 'desc'
  debounceMs?: number
}

/**
 * Owns the state shape shared by every list screen: server-side search,
 * filters, sorting and pagination, driven by a fetch function the page provides.
 */
export function useCollection<T>(
  fetcher: (query: CollectionQuery) => Promise<Page<T>>,
  { defaultPerPage = 15, defaultSort = 'id', defaultOrder = 'asc', debounceMs = 350 }: Options = {},
): CollectionController<T> {
  const [items, setItems] = useState<T[]>([])
  const [meta, setMeta] = useState<ApiMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(defaultPerPage)
  const [sort, setSort] = useState(defaultSort)
  const [order, setOrder] = useState<'asc' | 'desc'>(defaultOrder)

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  // Debounce the search input into the settled search param.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, debounceMs)
    return () => {
      window.clearTimeout(timer)
    }
  }, [searchInput, debounceMs])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const query: CollectionQuery = {
        page,
        per_page: perPage,
        ...(search ? { search } : {}),
        sort,
        order,
        ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '')),
      }
      const result = await fetcherRef.current(query)
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load records.')
    } finally {
      setLoading(false)
    }
  }, [page, perPage, search, sort, order, filters])

  useEffect(() => {
    void load()
  }, [load])

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((current) => {
      const next = { ...current }
      if (value === '') delete next[key]
      else next[key] = value
      return next
    })
    setPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
    setSearchInput('')
    setSearch('')
    setPage(1)
  }, [])

  const handleSort = useCallback((column: string) => {
    setSort((current) => {
      if (current === column) {
        setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
        return current
      }
      setOrder('asc')
      return column
    })
    setPage(1)
  }, [])

  const reload = useCallback(() => {
    void load()
  }, [load])

  return {
    items,
    meta,
    loading,
    error,
    filters,
    search: searchInput,
    setSearch: setSearchInput,
    setFilter,
    clearFilters,
    page,
    setPage,
    perPage,
    setPerPage,
    sort,
    setSort: handleSort,
    order,
    reload,
  }
}