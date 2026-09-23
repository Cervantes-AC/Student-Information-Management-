import { useState } from 'react'
import { gradesApi } from '../api/endpoints'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useCollection } from '../hooks/useCollection'
import { DataTable, type Column } from '../components/DataTable'
import { PaginationBar } from '../components/PaginationBar'
import { ListToolbar } from '../components/ListToolbar'
import { PageHeader } from '../components/ui/Page'
import { Modal } from '../components/ui/Modal'
import { SelectField, TextInput, toLocalErrors } from '../components/ui/Form'
import { ErrorState } from '../components/ui/States'
import { Spinner } from '../components/ui/Feedback'
import { useToast } from '../components/ui/Toast'
import { formatGrade } from '../utils/format'
import type { Grade } from '../types'

interface GradeForm {
  midterm: string
  final: string
  remarks: string
}

export default function GradesPage(): React.JSX.Element {
  const { user } = useAuth()
  const { showToast } = useToast()
  const canStaff = user?.role === 'administrator' || user?.role === 'registrar'
  const collection = useCollection((query) => gradesApi.list(query), { defaultSort: 'id', defaultOrder: 'desc' })
  const { items, meta, loading, error, search, setSearch, page, setPage, perPage, setPerPage, sort, order, reload } =
    collection

  const [editTarget, setEditTarget] = useState<Grade | null>(null)
  const [form, setForm] = useState<GradeForm>({ midterm: '', final: '', remarks: '' })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const openEdit = (grade: Grade): void => {
    setEditTarget(grade)
    setForm({
      midterm: grade.midterm_grade?.toString() ?? '',
      final: grade.final_grade?.toString() ?? '',
      remarks: grade.remarks ?? '',
    })
    setFieldErrors({})
  }

  const closeModal = (): void => {
    if (saving) return
    setEditTarget(null)
  }

  const save = async (): Promise<void> => {
    if (!editTarget) return
    setSaving(true)
    setFieldErrors({})
    try {
      await gradesApi.update(editTarget.id, {
        midterm_grade: form.midterm === '' ? null : Number(form.midterm),
        final_grade: form.final === '' ? null : Number(form.final),
        remarks: form.remarks || null,
      })
      showToast('Grade updated.', 'success')
      setEditTarget(null)
      reload()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.errors) setFieldErrors(toLocalErrors(err.errors))
        else showToast(err.message, 'error')
      } else {
        showToast('Failed to update grade.', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const columns: Column<Grade>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'enrollment_id', header: 'Enrollment', sortable: true },
    { key: 'midterm', header: 'Midterm', render: (grade) => formatGrade(grade.midterm_grade) },
    { key: 'final', header: 'Final', render: (grade) => formatGrade(grade.final_grade) },
    { key: 'remarks', header: 'Remarks', render: (grade) => grade.remarks ?? '—' },
    {
      key: 'actions',
      header: '',
      className: 'col-actions',
      render: (grade) =>
        canStaff ? (
          <button type="button" className="btn btn-sm" onClick={() => openEdit(grade)}>
            Edit
          </button>
        ) : (
          <></>
        ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Grades"
        subtitle={
          user?.role === 'instructor'
            ? 'Grade records across your classes. New grades are encoded from each class roster.'
            : 'All encoded grade records. New grades can be encoded from rosters or enrollments.'
        }
      />

      <ListToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search grades…" />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={items}
            rowKey={(grade) => grade.id}
            loading={loading}
            sort={sort}
            order={order}
            onSort={collection.setSort}
            emptyTitle="No grades recorded"
            emptyMessage="Grades appear here once they are encoded from an offering roster."
            ariaLabel="Grades"
          />
          <PaginationBar meta={meta} page={page} onPageChange={setPage} perPage={perPage} onPerPageChange={setPerPage} />
        </>
      )}

      <Modal
        open={editTarget !== null}
        title={`Edit grade #${editTarget?.id ?? ''}`}
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
                'Save grade'
              )}
            </button>
          </>
        }
      >
        {editTarget ? (
          <div className="form-grid">
            <p className="modal-note">
              Enrollment #{editTarget.enrollment_id} — created {new Date(editTarget.created_at).toLocaleDateString()}
            </p>
            <TextInput
              label="Midterm grade"
              type="number"
              step="0.01"
              min={1}
              max={5}
              value={form.midterm}
              error={fieldErrors.midterm_grade}
              hint="1.00–5.00 (1.00 is the highest)"
              onChange={(event) => setForm((f) => ({ ...f, midterm: event.target.value }))}
            />
            <TextInput
              label="Final grade"
              type="number"
              step="0.01"
              min={1}
              max={5}
              value={form.final}
              error={fieldErrors.final_grade}
              hint="1.00–5.00 (1.00 is the highest)"
              onChange={(event) => setForm((f) => ({ ...f, final: event.target.value }))}
            />
            <SelectField
              label="Remarks"
              value={form.remarks}
              error={fieldErrors.remarks}
              onChange={(event) => setForm((f) => ({ ...f, remarks: event.target.value }))}
            >
              <option value="">(none)</option>
              <option value="PASSED">PASSED</option>
              <option value="FAILED">FAILED</option>
              <option value="INC">INC (Incomplete)</option>
              <option value="DROPPED">DROPPED</option>
            </SelectField>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}