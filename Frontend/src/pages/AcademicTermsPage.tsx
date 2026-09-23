import { useCallback, useState } from 'react'
import { termsApi } from '../api/endpoints'
import { ApiError } from '../api/client'
import { useCollection } from '../hooks/useCollection'
import { DataTable, type Column } from '../components/DataTable'
import { PaginationBar } from '../components/PaginationBar'
import { ListToolbar } from '../components/ListToolbar'
import { PageHeader } from '../components/ui/Page'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { SelectField, TextInput, toLocalErrors } from '../components/ui/Form'
import { ErrorState } from '../components/ui/States'
import { Spinner } from '../components/ui/Feedback'
import { useToast } from '../components/ui/Toast'
import { formatDate, recordStatusInfo } from '../utils/format'
import type { AcademicTerm, AcademicTermPayload } from '../types'

const SEMESTERS = ['1st', '2nd', 'Summer'] as const

export default function AcademicTermsPage(): React.JSX.Element {
  const { showToast } = useToast()
  const collection = useCollection((query) => termsApi.list(query), { defaultSort: 'academic_year', defaultOrder: 'desc' })
  const { items, meta, loading, error, search, setSearch, page, setPage, perPage, setPerPage, sort, order, reload } =
    collection

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AcademicTerm | null>(null)
  const [form, setForm] = useState<AcademicTermPayload>({
    academic_year: '',
    semester: '1st',
    start_date: '',
    end_date: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AcademicTerm | null>(null)
  const [deleting, setDeleting] = useState(false)

  const openCreate = (): void => {
    setEditing(null)
    setForm({ academic_year: '', semester: '1st', start_date: '', end_date: '' })
    setFieldErrors({})
    setModalOpen(true)
  }

  const openEdit = (term: AcademicTerm): void => {
    setEditing(term)
    setForm({
      academic_year: term.academic_year,
      semester: term.semester,
      start_date: term.start_date ?? '',
      end_date: term.end_date ?? '',
    })
    setFieldErrors({})
    setModalOpen(true)
  }

  const closeModal = (): void => {
    if (saving) return
    setModalOpen(false)
  }

  const save = async (): Promise<void> => {
    setSaving(true)
    setFieldErrors({})
    try {
      const payload = {
        ...form,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      }
      if (editing) {
        await termsApi.update(editing.id, payload)
        showToast('Academic term updated.', 'success')
      } else {
        await termsApi.create(payload)
        showToast('Academic term created.', 'success')
      }
      setModalOpen(false)
      reload()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.errors) setFieldErrors(toLocalErrors(err.errors))
        else showToast(err.message, 'error')
      } else {
        showToast('Failed to save academic term.', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await termsApi.remove(deleteTarget.id)
      showToast('Academic term deactivated.', 'success')
      setDeleteTarget(null)
      reload()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to deactivate academic term.', 'error')
    } finally {
      setDeleting(false)
    }
  }, [deleteTarget, reload, showToast])

  const columns: Column<AcademicTerm>[] = [
    { key: 'display_name', header: 'Academic term', sortable: true },
    { key: 'start_date', header: 'Starts', render: (term) => formatDate(term.start_date) },
    { key: 'end_date', header: 'Ends', render: (term) => formatDate(term.end_date) },
    {
      key: 'status',
      header: 'Status',
      render: (term) => {
        const info = recordStatusInfo(term.status)
        return <Badge tone={info.tone}>{info.label}</Badge>
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'col-actions',
      render: (term) => (
        <div className="row-actions">
          <button type="button" className="btn btn-sm" onClick={() => openEdit(term)}>
            Edit
          </button>
          <button
            type="button"
            className="btn btn-sm btn-danger-ghost"
            onClick={() => setDeleteTarget(term)}
            disabled={term.status === 'inactive'}
          >
            Deactivate
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Academic Terms"
        subtitle="Semesters and school years used by course offerings."
        actions={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + New term
          </button>
        }
      />

      <ListToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search by year or semester…" />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={items}
            rowKey={(term) => term.id}
            loading={loading}
            sort={sort}
            order={order}
            onSort={collection.setSort}
            emptyTitle="No academic terms"
            emptyMessage="Create an academic term to get started."
            ariaLabel="Academic terms"
          />
          <PaginationBar meta={meta} page={page} onPageChange={setPage} perPage={perPage} onPerPageChange={setPerPage} />
        </>
      )}

      <Modal
        open={modalOpen}
        title={editing ? `Edit ${editing.display_name}` : 'New academic term'}
        onClose={closeModal}
        footer={
          <>
            <button type="button" className="btn" onClick={closeModal} disabled={saving}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={() => void save()} disabled={saving}>
              {saving ? (
                <>
                  <Spinner size="sm" /> Saving…
                </>
              ) : (
                'Save term'
              )}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <TextInput
            label="Academic year"
            required
            value={form.academic_year}
            error={fieldErrors.academic_year}
            placeholder="e.g. 2025-2026"
            maxLength={20}
            onChange={(event) => setForm((f) => ({ ...f, academic_year: event.target.value }))}
          />
          <SelectField
            label="Semester"
            required
            value={form.semester}
            error={fieldErrors.semester}
            onChange={(event) => setForm((f) => ({ ...f, semester: event.target.value as AcademicTerm['semester'] }))}
          >
            {SEMESTERS.map((semester) => (
              <option key={semester} value={semester}>
                {semester === 'Summer' ? 'Summer' : `${semester} semester`}
              </option>
            ))}
          </SelectField>
          <TextInput
            label="Start date"
            type="date"
            value={form.start_date ?? ''}
            error={fieldErrors.start_date}
            onChange={(event) => setForm((f) => ({ ...f, start_date: event.target.value }))}
          />
          <TextInput
            label="End date"
            type="date"
            value={form.end_date ?? ''}
            error={fieldErrors.end_date}
            onChange={(event) => setForm((f) => ({ ...f, end_date: event.target.value }))}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Deactivate academic term"
        message={`Deactivate “${deleteTarget?.display_name ?? ''}”? The record is kept for history (status becomes inactive).`}
        confirmLabel="Deactivate"
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}