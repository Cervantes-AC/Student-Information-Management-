import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { gradesApi, offeringsApi } from '../api/endpoints'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { PageHeader } from '../components/ui/Page'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { SelectField, TextInput, toLocalErrors } from '../components/ui/Form'
import { DataTable, type Column } from '../components/DataTable'
import { ErrorState, ForbiddenState, NotFoundState } from '../components/ui/States'
import { LoadingBlock, Spinner } from '../components/ui/Feedback'
import { useToast } from '../components/ui/Toast'
import { canManageGrading, formatGrade } from '../utils/format'
import type { CourseOffering, RosterEntry } from '../types'

type LoadState = 'loading' | 'ready' | 'error' | 'forbidden' | 'notfound'

export default function OfferingRosterPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const offeringId = Number(id)
  const { user } = useAuth()
  const { showToast } = useToast()
  const canGrade = user ? canManageGrading(user.role) : false

  const [offering, setOffering] = useState<CourseOffering | null>(null)
  const [roster, setRoster] = useState<RosterEntry[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [loadingList, setLoadingList] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAll = useCallback(() => {
    setState('loading')
    setLoadingList(true)
    Promise.all([offeringsApi.get(offeringId), offeringsApi.roster(offeringId)])
      .then(([offeringData, rosterData]) => {
        setOffering(offeringData)
        // Students can only view their own offering data; instructors may only
        // grade rosters assigned to them — surface backend 403s correctly.
        setRoster(rosterData)
        setState('ready')
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError) {
          if (err.status === 403) setState('forbidden')
          else if (err.status === 404) setState('notfound')
          else {
            setState('error')
            setError(err.message)
          }
        } else {
          setState('error')
          setError('Failed to load the roster.')
        }
      })
      .finally(() => setLoadingList(false))
  }, [offeringId])

  useEffect(loadAll, [loadAll])

  // ── Grade editor state ──────────────────────────────────────
  const [editing, setEditing] = useState<RosterEntry | null>(null)
  const [form, setForm] = useState({ midterm: '', final: '', remarks: '' })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const openGradeEditor = (entry: RosterEntry): void => {
    setEditing(entry)
    setForm({
      midterm: entry.grade?.midterm_grade?.toString() ?? '',
      final: entry.grade?.final_grade?.toString() ?? '',
      remarks: entry.grade?.remarks ?? '',
    })
    setFieldErrors({})
  }

  const closeEditor = (): void => {
    if (saving) return
    setEditing(null)
  }

  const saveGrade = async (): Promise<void> => {
    if (!editing) return
    setSaving(true)
    setFieldErrors({})
    const payload = {
      midterm_grade: form.midterm === '' ? null : Number(form.midterm),
      final_grade: form.final === '' ? null : Number(form.final),
      remarks: form.remarks || null,
    }
    try {
      if (editing.grade) {
        await gradesApi.update(editing.grade.id, payload)
        showToast('Grade updated.', 'success')
      } else {
        await gradesApi.create({ enrollment_id: editing.enrollment_id, ...payload })
        showToast('Grade recorded.', 'success')
      }
      setEditing(null)
      loadAll()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.errors) setFieldErrors(toLocalErrors(err.errors))
        else showToast(err.message, 'error')
      } else {
        showToast('Failed to save grade.', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  if (state === 'loading') return <LoadingBlock height={280} />
  if (state === 'forbidden') return <ForbiddenState message="You can only view rosters for your own offerings." />
  if (state === 'notfound') return <NotFoundState message="This course offering does not exist." />
  if (state === 'error') return <ErrorState message={error ?? undefined} onRetry={loadAll} />
  if (!offering) return <></>

  const columns: Column<RosterEntry>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (entry) => (
        <div>
          <Link to={`/students/${entry.student.id}`} className="table-link">
            {entry.student.full_name}
          </Link>
          <div className="muted small">{entry.student.student_number}</div>
        </div>
      ),
    },
    { key: 'year', header: 'Year', render: (entry) => `${entry.student.year_level} · ${entry.student.program?.code ?? '—'}` },
    { key: 'midterm', header: 'Midterm', render: (entry) => formatGrade(entry.grade?.midterm_grade ?? null) },
    { key: 'final', header: 'Final', render: (entry) => formatGrade(entry.grade?.final_grade ?? null) },
    { key: 'remarks', header: 'Remarks', render: (entry) => entry.grade?.remarks ?? <Badge tone="muted">Not graded</Badge> },
    {
      key: 'actions',
      header: canGrade ? 'Grade' : '',
      className: 'col-actions',
      render: (entry) =>
        canGrade ? (
          <button type="button" className="btn btn-sm" onClick={() => openGradeEditor(entry)}>
            {entry.grade ? 'Edit grade' : 'Encode grade'}
          </button>
        ) : (
          <Badge tone="muted">—</Badge>
        ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title={`Roster — Section ${offering.section}`}
        subtitle={`${offering.course?.course_code ?? ''} ${offering.course?.course_title ?? ''} · ${offering.academic_term.display_name} · ${offering.instructor?.name ?? 'No instructor'}`}
        actions={
          <Link className="btn" to="/course-offerings">
            ← Back to offerings
          </Link>
        }
      />

      <DataTable
        columns={columns}
        rows={roster}
        rowKey={(entry) => entry.enrollment_id}
        loading={loadingList}
        emptyTitle="No enrolled students"
        emptyMessage="No students are enrolled in this section yet."
        ariaLabel="Class roster"
      />

      <Modal
        open={editing !== null}
        title={editing?.grade ? 'Edit grade' : 'Encode grade'}
        onClose={closeEditor}
        footer={
          <>
            <button type="button" className="btn" onClick={closeEditor} disabled={saving}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={() => void saveGrade()} disabled={saving}>
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
        {editing ? (
          <div className="form-grid">
            <p className="modal-note">
              {editing.student.full_name} — {offering.course?.course_code ?? ''} {offering.section}
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