import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { programsApi, studentsApi } from '../api/endpoints'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { PageHeader, DetailRow } from '../components/ui/Page'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { SelectField, TextInput, toLocalErrors } from '../components/ui/Form'
import { DataTable, type Column } from '../components/DataTable'
import { ErrorState, ForbiddenState, NotFoundState } from '../components/ui/States'
import { LoadingBlock, Spinner } from '../components/ui/Feedback'
import { useToast } from '../components/ui/Toast'
import { enrollmentStatusInfo, formatDate, formatGrade, ordinalYear, recordStatusInfo } from '../utils/format'
import type {
  AcademicRecordCourse,
  AcademicRecordTerm,
  Enrollment,
  GradeDetail,
  Program,
  Student,
  StudentPayload,
} from '../types'

type Tab = 'overview' | 'enrollments' | 'grades' | 'record'

export default function StudentDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const studentId = Number(id)
  const navigate = useNavigate()
  const { can, user } = useAuth()
  const { showToast } = useToast()
  const canEdit = can('administrator', 'registrar')

  const [student, setStudent] = useState<Student | null>(null)
  const [programs, setPrograms] = useState<Program[]>([])
  const [tab, setTab] = useState<Tab>('overview')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'forbidden' | 'notfound'>('loading')
  const [error, setError] = useState<string | null>(null)

  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null)
  const [grades, setGrades] = useState<GradeDetail[] | null>(null)
  const [record, setRecord] = useState<AcademicRecordTerm[] | null>(null)

  const loadStudent = useCallback(() => {
    setStatus('loading')
    studentsApi
      .get(studentId)
      .then((result) => {
        setStudent(result)
        setStatus('ready')
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError) {
          if (err.status === 403) setStatus('forbidden')
          else if (err.status === 404) setStatus('notfound')
          else {
            setStatus('error')
            setError(err.message)
          }
        } else {
          setStatus('error')
          setError('Failed to load the student record.')
        }
      })
  }, [studentId])

  useEffect(loadStudent, [loadStudent])

  useEffect(() => {
    programsApi
      .list({ per_page: 100 })
      .then((result) => setPrograms(result.items))
      .catch(() => setPrograms([]))
  }, [])

  // Load the active tab's data lazily (keeps switching cheap after first load).
  useEffect(() => {
    if (status !== 'ready' || !student) return
    if (tab === 'enrollments' && enrollments === null) {
      studentsApi.enrollments(student.id).then(setEnrollments).catch(() => setEnrollments([]))
    }
    if (tab === 'grades' && grades === null) {
      studentsApi.grades(student.id).then(setGrades).catch(() => setGrades([]))
    }
    if (tab === 'record' && record === null) {
      studentsApi
        .academicRecord(student.id)
        .then((data) => setRecord(data.terms))
        .catch(() => setRecord([]))
    }
  }, [status, tab, student, enrollments, grades, record])

  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState<StudentPayload | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const openEdit = (): void => {
    if (!student) return
    setForm({
      student_number: student.student_number,
      first_name: student.first_name,
      middle_name: student.middle_name ?? '',
      last_name: student.last_name,
      birth_date: student.birth_date ?? '',
      email: student.email ?? '',
      contact_number: student.contact_number ?? '',
      address: student.address ?? '',
      program_id: student.program_id,
      year_level: student.year_level,
    })
    setFieldErrors({})
    setEditOpen(true)
  }

  const updateField = (patch: Partial<StudentPayload>): void => {
    setForm((f) => (f ? { ...f, ...patch } : f))
  }

  const save = async (): Promise<void> => {
    if (!student || !form) return
    setSaving(true)
    setFieldErrors({})
    try {
      await studentsApi.update(student.id, form)
      showToast('Student updated.', 'success')
      setEditOpen(false)
      loadStudent()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.errors) setFieldErrors(toLocalErrors(err.errors))
        else showToast(err.message, 'error')
      } else {
        showToast('Failed to update student.', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async (): Promise<void> => {
    if (!student) return
    setDeleting(true)
    try {
      await studentsApi.remove(student.id)
      showToast('Student deactivated.', 'success')
      navigate('/students')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to deactivate student.', 'error')
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  if (status === 'loading') return <LoadingBlock height={300} />
  if (status === 'forbidden') return <ForbiddenState />
  if (status === 'notfound') return <NotFoundState message="This student record does not exist." />
  if (status === 'error') return <ErrorState message={error ?? undefined} onRetry={loadStudent} />
  if (!student) return <></>

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'enrollments', label: 'Enrollments', count: enrollments?.length },
    { key: 'grades', label: 'Grades', count: grades?.length },
    { key: 'record', label: 'Academic record' },
  ]

  const isOwner = user?.student_id === student.id

  return (
    <div className="page">
      <PageHeader
        title={student.full_name}
        subtitle={`${student.student_number} · ${student.program?.name ?? 'No program'} · ${ordinalYear(student.year_level)}`}
        actions={
          canEdit ? (
            <>
              <button type="button" className="btn" onClick={openEdit} disabled={student.status === 'inactive'}>
                Edit
              </button>
              <button
                type="button"
                className="btn btn-danger-ghost"
                onClick={() => setDeleteOpen(true)}
                disabled={student.status === 'inactive'}
              >
                Deactivate
              </button>
            </>
          ) : isOwner ? (
            <Badge tone="success">Your profile</Badge>
          ) : undefined
        }
      />

      <nav className="tabs" aria-label="Student sections">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`tab ${tab === item.key ? 'active' : ''}`}
            onClick={() => setTab(item.key)}
          >
            {item.label}
            {item.count !== undefined ? <span className="tab-count">{item.count}</span> : null}
          </button>
        ))}
      </nav>

      {tab === 'overview' ? (
        <section className="card">
          <dl className="detail-grid">
            <DetailRow label="Student number" value={student.student_number} />
            <DetailRow label="Full name" value={student.full_name} />
            <DetailRow label="Program" value={student.program?.name} />
            <DetailRow label="Year level" value={ordinalYear(student.year_level)} />
            <DetailRow label="Birth date" value={formatDate(student.birth_date)} />
            <DetailRow label="Email" value={student.email} />
            <DetailRow label="Contact number" value={student.contact_number} />
            <DetailRow label="Address" value={student.address} />
            <DetailRow label="Status" value={recordStatusInfo(student.status).label} />
          </dl>
        </section>
      ) : null}

      {tab === 'enrollments' ? <EnrollmentsSection enrollments={enrollments} /> : null}
      {tab === 'grades' ? <GradesSection grades={grades} /> : null}
      {tab === 'record' ? <RecordSection terms={record} overall={student.id} /> : null}

      {canEdit && form ? (
        <Modal
          open={editOpen}
          title={`Edit ${student.full_name}`}
          onClose={() => setEditOpen(false)}
          wide
          footer={
            <>
              <button type="button" className="btn" onClick={() => setEditOpen(false)} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={() => void save()} disabled={saving}>
                {saving ? (
                  <>
                    <Spinner size="sm" /> Saving…
                  </>
                ) : (
                  'Save changes'
                )}
              </button>
            </>
          }
        >
          <div className="form-grid">
            <TextInput
              label="Student number"
              required
              value={form.student_number}
              error={fieldErrors.student_number}
              onChange={(event) => updateField({ student_number: event.target.value })}
            />
            <TextInput
              label="First name"
              required
              value={form.first_name}
              error={fieldErrors.first_name}
              onChange={(event) => updateField({ first_name: event.target.value })}
            />
            <TextInput
              label="Middle name"
              value={form.middle_name ?? ''}
              error={fieldErrors.middle_name}
              onChange={(event) => updateField({ middle_name: event.target.value })}
            />
            <TextInput
              label="Last name"
              required
              value={form.last_name}
              error={fieldErrors.last_name}
              onChange={(event) => updateField({ last_name: event.target.value })}
            />
            <SelectField
              label="Program"
              required
              value={form.program_id}
              error={fieldErrors.program_id}
              onChange={(event) => updateField({ program_id: Number(event.target.value) })}
            >
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.code} — {program.name}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Year level"
              required
              value={form.year_level}
              error={fieldErrors.year_level}
              onChange={(event) => updateField({ year_level: Number(event.target.value) })}
            >
              {[1, 2, 3, 4, 5].map((year) => (
                <option key={year} value={year}>
                  {ordinalYear(year)}
                </option>
              ))}
            </SelectField>
            <TextInput
              label="Birth date"
              type="date"
              value={form.birth_date ?? ''}
              error={fieldErrors.birth_date}
              onChange={(event) => updateField({ birth_date: event.target.value })}
            />
            <TextInput
              label="Email"
              type="email"
              value={form.email ?? ''}
              error={fieldErrors.email}
              onChange={(event) => updateField({ email: event.target.value })}
            />
            <TextInput
              label="Contact number"
              value={form.contact_number ?? ''}
              error={fieldErrors.contact_number}
              onChange={(event) => updateField({ contact_number: event.target.value })}
            />
            <div className="field field-wide">
              <label className="field-label" htmlFor="student-address">
                Address
              </label>
              <textarea
                id="student-address"
                className="input"
                rows={2}
                value={form.address ?? ''}
                onChange={(event) => updateField({ address: event.target.value })}
              />
              {fieldErrors.address ? (
                <p className="field-error-msg" role="alert">
                  {fieldErrors.address}
                </p>
              ) : null}
            </div>
          </div>
        </Modal>
      ) : null}

      <ConfirmDialog
        open={deleteOpen}
        title="Deactivate student"
        message={`Deactivate ${student.full_name} (${student.student_number})? The record is kept for history.`}
        confirmLabel="Deactivate"
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  )
}

function EnrollmentsSection({ enrollments }: { enrollments: Enrollment[] | null }): React.JSX.Element {
  if (enrollments === null) return <LoadingBlock height={160} />
  const columns: Column<Enrollment>[] = [
    {
      key: 'course',
      header: 'Course',
      render: (enrollment) => (
        <div>
          <strong>{enrollment.course_offering.course?.course_code ?? '—'}</strong> ·{' '}
          <span className="muted">{enrollment.course_offering.course?.course_title ?? '—'}</span>
        </div>
      ),
    },
    { key: 'section', header: 'Section', render: (enrollment) => enrollment.course_offering.section },
    {
      key: 'term',
      header: 'Term',
      render: (enrollment) => enrollment.course_offering.academic_term.display_name,
    },
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
        enrollment.grade ? (
          <strong>{formatGrade(enrollment.grade.final_grade ?? enrollment.grade.midterm_grade)}</strong>
        ) : (
          <Badge tone="muted">Not graded</Badge>
        ),
    },
  ]
  return (
    <DataTable
      columns={columns}
      rows={enrollments}
      rowKey={(enrollment) => enrollment.id}
      emptyTitle="No enrollments"
      emptyMessage="This student has no enrollments yet."
      ariaLabel="Student enrollments"
    />
  )
}

function GradesSection({ grades }: { grades: GradeDetail[] | null }): React.JSX.Element {
  if (grades === null) return <LoadingBlock height={160} />
  const columns: Column<GradeDetail>[] = [
    { key: 'course', header: 'Course', render: (grade) => <strong>{grade.course?.course_code ?? '—'}</strong> },
    { key: 'title', header: 'Title', render: (grade) => <span className="muted">{grade.course?.course_title ?? '—'}</span> },
    { key: 'section', header: 'Section', render: (grade) => grade.section ?? '—' },
    { key: 'term', header: 'Term', render: (grade) => grade.academic_term.display_name },
    { key: 'midterm', header: 'Midterm', render: (grade) => formatGrade(grade.midterm_grade) },
    { key: 'final', header: 'Final', render: (grade) => formatGrade(grade.final_grade) },
    { key: 'remarks', header: 'Remarks', render: (grade) => grade.remarks ?? '—' },
  ]
  return (
    <DataTable
      columns={columns}
      rows={grades}
      rowKey={(grade) => grade.id}
      emptyTitle="No grades"
      emptyMessage="No grades have been encoded for this student yet."
      ariaLabel="Student grades"
    />
  )
}

function RecordSection({ terms, overall }: { terms: AcademicRecordTerm[] | null; overall: number }): React.JSX.Element {
  void overall
  if (terms === null) return <LoadingBlock height={200} />
  if (terms.length === 0) {
    return <Badge tone="muted">No graded coursework on file.</Badge>
  }
  return (
    <div className="record-section">
      {terms.map((term) => (
        <section key={term.academic_term.id} className="card">
          <header className="record-term-header">
            <h3>{term.academic_term.display_name}</h3>
            <Badge tone="primary">Average: {term.average !== null ? term.average.toFixed(2) : '—'}</Badge>
          </header>
          <DataTable
            columns={recordColumns}
            rows={term.courses}
            rowKey={(course) => course.enrollment_id}
            emptyTitle="No graded courses"
            emptyMessage="No graded courses in this term."
            ariaLabel={`${term.academic_term.display_name} courses`}
          />
        </section>
      ))}
    </div>
  )
}

const recordColumns: Column<AcademicRecordCourse>[] = [
  {
    key: 'course',
    header: 'Course',
    render: (course) => (
      <div>
        <strong>{course.course?.course_code ?? '—'}</strong> ·{' '}
        <span className="muted">{course.course?.course_title ?? '—'}</span>
      </div>
    ),
  },
  { key: 'section', header: 'Section', render: (course) => course.section ?? '—' },
  { key: 'midterm', header: 'Midterm', render: (course) => formatGrade(course.midterm_grade) },
  { key: 'final', header: 'Final', render: (course) => formatGrade(course.final_grade) },
  {
    key: 'grade_point',
    header: 'Grade point',
    className: 'col-number',
    render: (course) => (course.grade_point !== null ? <strong>{course.grade_point.toFixed(2)}</strong> : '—'),
  },
  { key: 'remarks', header: 'Remarks', render: (course) => course.remarks ?? '—' },
]