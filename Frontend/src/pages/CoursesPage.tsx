import { useCallback, useState } from 'react'
import { coursesApi } from '../api/endpoints'
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
import type { Course, CoursePayload } from '../types'

export default function CoursesPage(): React.JSX.Element {
  const { showToast } = useToast()
  const collection = useCollection((query) => coursesApi.list(query), { defaultSort: 'course_code' })
  const { items, meta, loading, error, search, setSearch, page, setPage, perPage, setPerPage, sort, order, reload } =
    collection

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [form, setForm] = useState<CoursePayload>({ course_code: '', course_title: '', units: 3, description: '' })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null)
  const [deleting, setDeleting] = useState(false)

  const openCreate = (): void => {
    setEditing(null)
    setForm({ course_code: '', course_title: '', units: 3, description: '' })
    setFieldErrors({})
    setModalOpen(true)
  }

  const openEdit = (course: Course): void => {
    setEditing(course)
    setForm({
      course_code: course.course_code,
      course_title: course.course_title,
      units: course.units,
      description: course.description ?? '',
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
      if (editing) {
        await coursesApi.update(editing.id, form)
        showToast('Course updated.', 'success')
      } else {
        await coursesApi.create(form)
        showToast('Course created.', 'success')
      }
      setModalOpen(false)
      reload()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.errors) setFieldErrors(toLocalErrors(err.errors))
        else showToast(err.message, 'error')
      } else {
        showToast('Failed to save course.', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await coursesApi.remove(deleteTarget.id)
      showToast('Course deactivated.', 'success')
      setDeleteTarget(null)
      reload()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to deactivate course.', 'error')
    } finally {
      setDeleting(false)
    }
  }, [deleteTarget, reload, showToast])

  const columns: Column<Course>[] = [
    { key: 'course_code', header: 'Code', sortable: true },
    { key: 'course_title', header: 'Title', sortable: true },
    { key: 'units', header: 'Units', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (course) => {
        const info = recordStatusInfo(course.status)
        return <Badge tone={info.tone}>{info.label}</Badge>
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'col-actions',
      render: (course) => (
        <div className="row-actions">
          <button type="button" className="btn btn-sm" onClick={() => openEdit(course)}>
            Edit
          </button>
          <button
            type="button"
            className="btn btn-sm btn-danger-ghost"
            onClick={() => setDeleteTarget(course)}
            disabled={course.status === 'inactive'}
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
        title="Courses"
        subtitle="Curriculum subjects offered across programs."
        actions={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + New course
          </button>
        }
      />

      <ListToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search by code or title…" />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={items}
            rowKey={(course) => course.id}
            loading={loading}
            sort={sort}
            order={order}
            onSort={collection.setSort}
            emptyTitle="No courses"
            emptyMessage="Create a course to get started."
            ariaLabel="Courses"
          />
          <PaginationBar meta={meta} page={page} onPageChange={setPage} perPage={perPage} onPerPageChange={setPerPage} />
        </>
      )}

      <Modal
        open={modalOpen}
        title={editing ? `Edit ${editing.course_code}` : 'New course'}
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
                'Save course'
              )}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <TextInput
            label="Course code"
            required
            value={form.course_code}
            error={fieldErrors.course_code}
            placeholder="e.g. IT101"
            maxLength={20}
            onChange={(event) => setForm((f) => ({ ...f, course_code: event.target.value }))}
          />
          <TextInput
            label="Course title"
            required
            value={form.course_title}
            error={fieldErrors.course_title}
            placeholder="e.g. Introduction to Computing"
            maxLength={255}
            onChange={(event) => setForm((f) => ({ ...f, course_title: event.target.value }))}
          />
          <TextInput
            label="Units"
            type="number"
            min={0.5}
            max={10}
            step={0.5}
            value={form.units}
            error={fieldErrors.units}
            onChange={(event) => setForm((f) => ({ ...f, units: Number(event.target.value) }))}
          />
          <div className="field field-wide">
            <label className="field-label" htmlFor="course-description">
              Description
            </label>
            <textarea
              id="course-description"
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
        title="Deactivate course"
        message={`Deactivate “${deleteTarget?.course_title ?? ''}”? The record is kept for history (status becomes inactive).`}
        confirmLabel="Deactivate"
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}