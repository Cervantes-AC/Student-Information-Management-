import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { enrollmentsApi, offeringsApi, studentsApi } from '../api/endpoints'
import { ApiError } from '../api/client'
import { useCollection } from '../hooks/useCollection'
import { DataTable, type Column } from '../components/DataTable'
import { PaginationBar } from '../components/PaginationBar'
import { ListToolbar } from '../components/ListToolbar'
import { PageHeader } from '../components/ui/Page'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { SelectField, toLocalErrors } from '../components/ui/Form'
import { ErrorState } from '../components/ui/States'
import { Spinner } from '../components/ui/Feedback'
import { useToast } from '../components/ui/Toast'
import { enrollmentStatusInfo, formatGrade } from '../utils/format'
import type { CourseOffering, Enrollment, Student } from '../types'

export default function EnrollmentsPage(): React.JSX.Element {
  const { showToast } = useToast()
  const collection = useCollection((query) => enrollmentsApi.list(query), { defaultSort: 'id', defaultOrder: 'desc' })
  const { items, meta, loading, error, search, setSearch, page, setPage, perPage, setPerPage, sort, order, reload } =
    collection

  const [students, setStudents] = useState<Student[]>([])
  const [offerings, setOfferings] = useState<CourseOffering[]>([])

  useEffect(() => {
    studentsApi.list({ per_page: 100 }).then((r) => setStudents(r.items)).catch(() => setStudents([]))
    offeringsApi.list({ per_page: 100 }).then((r) => setOfferings(r.items)).catch(() => setOfferings([]))
  }, [])

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ student_id: 0, course_offering_id: 0 })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [dropTarget, setDropTarget] = useState<Enrollment | null>(null)
  const [dropping, setDropping] = useState(false)

  const openCreate = (): void => {
    setForm({ student_id: students[0]?.id ?? 0, course_offering_id: offerings[0]?.id ?? 0 })
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
      await enrollmentsApi.create(form)
      showToast('Student enrolled.', 'success')
      setModalOpen(false)
      reload()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.errors) setFieldErrors(toLocalErrors(err.errors))
        else showToast(err.message, 'error') // includes 409 duplicate-enrollment message
      } else {
        showToast('Failed to create enrollment.', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const confirmDrop = useCallback(async (): Promise<void> => {
    if (!dropTarget) return
    setDropping(true)
    try {
      await enrollmentsApi.remove(dropTarget.id)
      showToast('Enrollment dropped.', 'success')
      setDropTarget(null)
      reload()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to drop enrollment.', 'error')
    } finally {
      setDropping(false)
    }
  }, [dropTarget, reload, showToast])

  const columns: Column<Enrollment>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (enrollment) => (
        <Link to={`/students/${enrollment.student.id}`} className="table-link">
          {enrollment.student.full_name}
        </Link>
      ),
    },
    {
      key: 'course',
      header: 'Course / Section',
      render: (enrollment) => (
        <div>
          <strong>{enrollment.course_offering.course?.course_code ?? '—'}</strong> · {enrollment.course_offering.section}
        </div>
      ),
    },
    { key: 'term', header: 'Term', render: (enrollment) => enrollment.course_offering.academic_term.display_name },
    {
      key: 'status',
      header: 'Status',
      render: (enrollment) => {
        const info = enrollmentStatusInfo(enrollment.status)
        return <Badge tone={info.tone}>{info.label}</Badge>
      },
    },
    {
      key: 'grade',
      header: 'Grade',
      render: (enrollment) =>
        enrollment.grade ? formatGrade(enrollment.grade.final_grade ?? enrollment.grade.midterm_grade) : '—',
    },
    {
      key: 'actions',
      header: '',
      className: 'col-actions',
      render: (enrollment) => (
        <div className="row-actions">
          <button
            type="button"
            className="btn btn-sm btn-danger-ghost"
            onClick={() => setDropTarget(enrollment)}
            disabled={enrollment.status !== 'enrolled'}
            title={enrollment.status !== 'enrolled' ? 'Only active enrollments can be dropped' : 'Drop this enrollment'}
          >
            Drop
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Enrollments"
        subtitle="Enrollment records linking students to course offerings."
        actions={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + Enroll student
          </button>
        }
      />

      <ListToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search student or course…">
        <SelectField
          label="Status"
          value={collection.filters?.status ?? ''}
          onChange={(event) => collection.setFilter('status', event.target.value)}
        >
          <option value="">All statuses</option>
          <option value="enrolled">Enrolled</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
        </SelectField>
      </ListToolbar>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={items}
            rowKey={(enrollment) => enrollment.id}
            loading={loading}
            sort={sort}
            order={order}
            onSort={collection.setSort}
            emptyTitle="No enrollments"
            emptyMessage="Enroll a student to get started."
            ariaLabel="Enrollments"
          />
          <PaginationBar meta={meta} page={page} onPageChange={setPage} perPage={perPage} onPerPageChange={setPerPage} />
        </>
      )}

      <Modal
        open={modalOpen}
        title="Enroll a student"
        onClose={closeModal}
        footer={
          <>
            <button type="button" className="btn" onClick={closeModal} disabled={saving}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={() => void save()} disabled={saving}>
              {saving ? (
                <>
                  <Spinner size="sm" /> Enrolling…
                </>
              ) : (
                'Enroll student'
              )}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <SelectField
            label="Student"
            required
            value={form.student_id}
            error={fieldErrors.student_id}
            onChange={(event) => setForm((f) => ({ ...f, student_id: Number(event.target.value) }))}
          >
            <option value={0} disabled>
              Select student…
            </option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.student_number} — {student.full_name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Course offering"
            required
            value={form.course_offering_id}
            error={fieldErrors.course_offering_id}
            onChange={(event) => setForm((f) => ({ ...f, course_offering_id: Number(event.target.value) }))}
          >
            <option value={0} disabled>
              Select offering…
            </option>
            {offerings.map((offering) => (
              <option key={offering.id} value={offering.id}>
                {offering.course?.course_code ?? '—'} · Section {offering.section} ({offering.academic_term.display_name})
              </option>
            ))}
          </SelectField>
          <p className="field-hint field-wide">
            Duplicate enrollments (same student + offering) are rejected by the API with a conflict error.
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={dropTarget !== null}
        title="Drop enrollment"
        message={`Drop ${dropTarget?.student.full_name ?? ''} from section ${dropTarget?.course_offering.section ?? ''}? The enrollment status becomes “dropped”.`}
        confirmLabel="Drop enrollment"
        busy={dropping}
        onConfirm={() => void confirmDrop()}
        onClose={() => setDropTarget(null)}
      />
    </div>
  )
}