import { useCallback, useState } from 'react'
import { programsApi } from '../api/endpoints'
import { ApiError } from '../api/client'
import { useCollection } from '../hooks/useCollection'
import { DataTable, type Column } from '../components/DataTable'
import { PaginationBar } from '../components/PaginationBar'
import { ListToolbar } from '../components/ListToolbar'
import { PageHeader } from '../components/ui/Page'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { TextInput, toLocalErrors } from '../components/ui/Form'
import { ErrorState } from '../components/ui/States'
import { Spinner } from '../components/ui/Feedback'
import { useToast } from '../components/ui/Toast'
import { recordStatusInfo } from '../utils/format'
import type { Program, ProgramPayload } from '../types'

const PAGE_TITLE = 'Programs'

export default function ProgramsPage(): React.JSX.Element {
  const { showToast } = useToast()
  const collection = useCollection((query) => programsApi.list(query), { defaultSort: 'name' })
  const { items, meta, loading, error, search, setSearch, page, setPage, perPage, setPerPage, sort, order, reload } =
    collection

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Program | null>(null)
  const [form, setForm] = useState<ProgramPayload>({ code: '', name: '', description: '' })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null)
  const [deleting, setDeleting] = useState(false)

  const openCreate = (): void => {
    setEditing(null)
    setForm({ code: '', name: '', description: '' })
    setFieldErrors({})
    setModalOpen(true)
  }

  const openEdit = (program: Program): void => {
    setEditing(program)
    setForm({ code: program.code, name: program.name, description: program.description ?? '' })
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
      if (editing) {
        await programsApi.update(editing.id, form)
        showToast('Program updated.', 'success')
      } else {
        await programsApi.create(form)
        showToast('Program created.', 'success')
      }
      setModalOpen(false)
      reload()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.errors) setFieldErrors(toLocalErrors(err.errors))
        else showToast(err.message, 'error')
      } else {
        showToast('Failed to save program.', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await programsApi.remove(deleteTarget.id)
      showToast('Program deactivated.', 'success')
      setDeleteTarget(null)
      reload()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to deactivate program.', 'error')
    } finally {
      setDeleting(false)
    }
  }, [deleteTarget, reload, showToast])

  const columns: Column<Program>[] = [
    { key: 'code', header: 'Code', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'description', header: 'Description' },
    {
      key: 'status',
      header: 'Status',
      render: (program) => {
        const info = recordStatusInfo(program.status)
        return <Badge tone={info.tone}>{info.label}</Badge>
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'col-actions',
      render: (program) => (
        <div className="row-actions">
          <button type="button" className="btn btn-sm" onClick={() => openEdit(program)}>
            Edit
          </button>
          <button
            type="button"
            className="btn btn-sm btn-danger-ghost"
            onClick={() => setDeleteTarget(program)}
            disabled={program.status === 'inactive'}
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
        title={PAGE_TITLE}
        subtitle="Degree programs offered by the institution."
        actions={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + New program
          </button>
        }
      />

      <ListToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search by code or name…" />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={items}
            rowKey={(program) => program.id}
            loading={loading}
            sort={sort}
            order={order}
            onSort={collection.setSort}
            emptyTitle="No programs"
            emptyMessage="Create a program to get started."
            ariaLabel="Programs"
          />
          <PaginationBar meta={meta} page={page} onPageChange={setPage} perPage={perPage} onPerPageChange={setPerPage} />
        </>
      )}

      <Modal
        open={modalOpen}
        title={editing ? `Edit ${editing.code}` : 'New program'}
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
                'Save program'
              )}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <TextInput
            label="Program code"
            required
            value={form.code}
            error={fieldErrors.code}
            placeholder="e.g. BSIT"
            maxLength={20}
            onChange={(event) => setForm((f) => ({ ...f, code: event.target.value }))}
          />
          <TextInput
            label="Program name"
            required
            value={form.name}
            error={fieldErrors.name}
            placeholder="e.g. Bachelor of Science in Information Technology"
            maxLength={255}
            onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
          />
          <div className="field field-wide">
            <label className="field-label" htmlFor="program-description">
              Description
            </label>
            <textarea
              id="program-description"
              className="input"
              rows={3}
              value={form.description ?? ''}
              maxLength={1000}
              onChange={(event) => setForm((f) => ({ ...f, description: event.target.value }))}
            />
            {fieldErrors.description ? (
              <p className="field-error-msg" role="alert">
                {fieldErrors.description}
              </p>
            ) : null}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Deactivate program"
        message={`Deactivate “${deleteTarget?.name ?? ''}”? The record is kept for history (status becomes inactive).`}
        confirmLabel="Deactivate"
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}