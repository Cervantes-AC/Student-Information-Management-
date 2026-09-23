import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { coursesApi, instructorsApi, offeringsApi, termsApi } from '../api/endpoints'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
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
import { recordStatusInfo } from '../utils/format'
import type {
  AcademicTerm,
  Course,
  CourseOffering,
  CourseOfferingPayload,
  InstructorRef,
} from '../types'

export default function CourseOfferingsPage(): React.JSX.Element {
  const { can, user } = useAuth()
  const canEdit = can('administrator', 'registrar')
  const { showToast } = useToast()
  const collection = useCollection((query) => offeringsApi.list(query), { defaultSort: 'id' })
  const { items, meta, loading, error, search, setSearch, page, setPage, perPage, setPerPage, sort, order, reload } =
    collection

  const [courses, setCourses] = useState<Course[]>([])
  const [terms, setTerms] = useState<AcademicTerm[]>([])
  const [instructors, setInstructors] = useState<InstructorRef[]>([])
  const [termFilter, setTermFilter] = useState('')

  useEffect(() => {
    coursesApi.list({ per_page: 100 }).then((r) => setCourses(r.items)).catch(() => setCourses([]))
    termsApi.list({ per_page: 100 }).then((r) => setTerms(r.items)).catch(() => setTerms([]))
    instructorsApi.list().then(setInstructors).catch(() => setInstructors([]))
  }, [])

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<CourseOfferingPayload>({
    course_id: 0,
    academic_term_id: 0,
    instructor_id: 0,
    section: '',
    schedule: '',
    room: '',
    capacity: 40,
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CourseOffering | null>(null)
  const [deleting, setDeleting] = useState(false)

  const openCreate = (): void => {
    setForm({
      course_id: courses[0]?.id ?? 0,
      academic_term_id: terms[0]?.id ?? 0,
      instructor_id: instructors[0]?.id ?? 0,
      section: '',
      schedule: '',
      room: '',
      capacity: 40,
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
      await offeringsApi.create(form)
      showToast('Course offering created.', 'success')
      setModalOpen(false)
      reload()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.errors) setFieldErrors(toLocalErrors(err.errors))
        else showToast(err.message, 'error')
      } else {
        showToast('Failed to save offering.', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await offeringsApi.remove(deleteTarget.id)
      showToast('Course offering deactivated.', 'success')
      setDeleteTarget(null)
      reload()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to deactivate offering.', 'error')
    } finally {
      setDeleting(false)
    }
  }, [deleteTarget, reload, showToast])

  const columns: Column<CourseOffering>[] = [
    {
      key: 'section',
      header: 'Section',
      sortable: true,
      render: (offering) => (
        <Link to={`/course-offerings/${offering.id}/roster`} className="table-link">
          {offering.section}
        </Link>
      ),
    },
    {
      key: 'course',
      header: 'Course',
      render: (offering) => (
        <div>
          <strong>{offering.course?.course_code ?? '—'}</strong> · {offering.course?.course_title ?? '—'}
        </div>
      ),
    },
    { key: 'term', header: 'Term', render: (offering) => offering.academic_term.display_name },
    {
      key: 'instructor',
      header: 'Instructor',
      render: (offering) => (offering.instructor ? `${offering.instructor.name} (${offering.instructor.email})` : '—'),
    },
    { key: 'schedule', header: 'Schedule', render: (offering) => offering.schedule ?? '—' },
    { key: 'capacity', header: 'Capacity', render: (offering) => offering.capacity },
    {
      key: 'status',
      header: 'Status',
      render: (offering) => {
        const info = recordStatusInfo(offering.status)
        return <Badge tone={info.tone}>{info.label}</Badge>
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'col-actions',
      render: (offering) => (
        <div className="row-actions">
          <Link className="btn btn-sm" to={`/course-offerings/${offering.id}/roster`}>
            {user?.role === 'instructor' ? 'My roster' : 'Roster'}
          </Link>
          {canEdit ? (
            <button
              type="button"
              className="btn btn-sm btn-danger-ghost"
              onClick={() => setDeleteTarget(offering)}
              disabled={offering.status === 'inactive'}
            >
              Deactivate
            </button>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Course Offerings"
        subtitle={
          user?.role === 'instructor'
            ? 'The sections assigned to you. Encode grades from each roster.'
            : 'Sections of courses offered in each academic term.'
        }
        actions={
          canEdit ? (
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              + New offering
            </button>
          ) : undefined
        }
      />

      <ListToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search section, course…">
        <SelectField
          label="Term"
          value={termFilter}
          onChange={(event) => {
            setTermFilter(event.target.value)
            collection.setFilter('academic_term_id', event.target.value)
          }}
        >
          <option value="">All terms</option>
          {terms.map((term) => (
            <option key={term.id} value={term.id}>
              {term.display_name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Status"
          value={collection.filters?.status ?? ''}
          onChange={(event) => collection.setFilter('status', event.target.value)}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </SelectField>
      </ListToolbar>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={items}
            rowKey={(offering) => offering.id}
            loading={loading}
            sort={sort}
            order={order}
            onSort={collection.setSort}
            emptyTitle="No course offerings"
            emptyMessage="Create a course offering to get started."
            ariaLabel="Course offerings"
          />
          <PaginationBar meta={meta} page={page} onPageChange={setPage} perPage={perPage} onPerPageChange={setPerPage} />
        </>
      )}

      <Modal
        open={modalOpen}
        title="New course offering"
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
                'Save offering'
              )}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <SelectField
            label="Course"
            required
            value={form.course_id}
            error={fieldErrors.course_id}
            onChange={(event) => setForm((f) => ({ ...f, course_id: Number(event.target.value) }))}
          >
            <option value={0} disabled>
              Select course…
            </option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.course_code} — {course.course_title}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Academic term"
            required
            value={form.academic_term_id}
            error={fieldErrors.academic_term_id}
            onChange={(event) => setForm((f) => ({ ...f, academic_term_id: Number(event.target.value) }))}
          >
            <option value={0} disabled>
              Select term…
            </option>
            {terms.map((term) => (
              <option key={term.id} value={term.id}>
                {term.display_name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Instructor"
            required
            value={form.instructor_id}
            error={fieldErrors.instructor_id}
            onChange={(event) => setForm((f) => ({ ...f, instructor_id: Number(event.target.value) }))}
          >
            <option value={0} disabled>
              Select instructor…
            </option>
            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.name}
              </option>
            ))}
          </SelectField>
          <TextInput
            label="Section"
            required
            value={form.section}
            error={fieldErrors.section}
            placeholder="e.g. A-1"
            maxLength={20}
            onChange={(event) => setForm((f) => ({ ...f, section: event.target.value }))}
          />
          <TextInput
            label="Schedule"
            value={form.schedule ?? ''}
            error={fieldErrors.schedule}
            placeholder="e.g. MWF 8:00-9:00"
            onChange={(event) => setForm((f) => ({ ...f, schedule: event.target.value }))}
          />
          <TextInput
            label="Room"
            value={form.room ?? ''}
            error={fieldErrors.room}
            placeholder="e.g. B201"
            onChange={(event) => setForm((f) => ({ ...f, room: event.target.value }))}
          />
          <TextInput
            label="Capacity"
            type="number"
            min={1}
            max={500}
            value={form.capacity}
            error={fieldErrors.capacity}
            onChange={(event) => setForm((f) => ({ ...f, capacity: Number(event.target.value) }))}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Deactivate course offering"
        message={`Deactivate section “${deleteTarget?.section ?? ''}”? Enrollment history is preserved.`}
        confirmLabel="Deactivate"
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}