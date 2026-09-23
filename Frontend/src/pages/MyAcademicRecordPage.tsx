import { useCallback, useEffect, useState } from 'react'
import { myApi } from '../api/endpoints'
import { PageHeader } from '../components/ui/Page'
import { Badge } from '../components/ui/Badge'
import { DataTable, type Column } from '../components/DataTable'
import { ErrorState } from '../components/ui/States'
import { LoadingBlock } from '../components/ui/Feedback'
import { formatGrade } from '../utils/format'
import type { AcademicRecord, AcademicRecordCourse } from '../types'

export default function MyAcademicRecordPage(): React.JSX.Element {
  const [record, setRecord] = useState<AcademicRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setError(null)
    myApi
      .academicRecord()
      .then(setRecord)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load your academic record.'))
  }, [])

  useEffect(load, [load])

  return (
    <div className="page">
      <PageHeader
        title="My Academic Record"
        subtitle="Your coursework grouped by academic term."
        actions={
          record ? (
            <div className="record-summary-chip">
              <Badge tone="primary">Overall average: {record.overall_average !== null ? record.overall_average.toFixed(2) : '—'}</Badge>
            </div>
          ) : undefined
        }
      />
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : record === null ? (
        <LoadingBlock />
      ) : record.terms.length === 0 ? (
        <p className="muted">No graded coursework on file yet.</p>
      ) : (
        <div className="record-section">
          {record.terms.map((term) => (
            <section key={term.academic_term.id} className="card">
              <header className="record-term-header">
                <h3>{term.academic_term.display_name}</h3>
                <Badge tone="primary">Term average: {term.average !== null ? term.average.toFixed(2) : '—'}</Badge>
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
      )}
    </div>
  )
}

const recordColumns: Column<AcademicRecordCourse>[] = [
  {
    key: 'course',
    header: 'Course',
    render: (course) => (
      <div>
        <strong>{course.course?.course_code ?? '—'}</strong> · <span className="muted">{course.course?.course_title ?? '—'}</span>
      </div>
    ),
  },
  { key: 'section', header: 'Section', render: (course) => course.section ?? '—' },
  { key: 'midterm', header: 'Midterm', render: (course) => formatGrade(course.midterm_grade) },
  { key: 'final', header: 'Final', render: (course) => formatGrade(course.final_grade) },
  {
    key: 'grade_point',
    header: 'Grade point',
    render: (course) => (course.grade_point !== null ? <strong>{course.grade_point.toFixed(2)}</strong> : '—'),
  },
  { key: 'remarks', header: 'Remarks', render: (course) => course.remarks ?? '—' },
]