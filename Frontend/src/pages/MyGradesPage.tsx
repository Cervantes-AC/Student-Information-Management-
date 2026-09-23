import { useCallback, useEffect, useState } from 'react'
import { myApi } from '../api/endpoints'
import { PageHeader } from '../components/ui/Page'
import { DataTable, type Column } from '../components/DataTable'
import { ErrorState } from '../components/ui/States'
import { LoadingBlock } from '../components/ui/Feedback'
import { formatGrade } from '../utils/format'
import type { GradeDetail } from '../types'

export default function MyGradesPage(): React.JSX.Element {
  const [grades, setGrades] = useState<GradeDetail[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setError(null)
    myApi
      .grades()
      .then(setGrades)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load your grades.'))
  }, [])

  useEffect(load, [load])

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
    <div className="page">
      <PageHeader title="My Grades" subtitle="Your encoded grades per course." />
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : grades === null ? (
        <LoadingBlock />
      ) : (
        <DataTable
          columns={columns}
          rows={grades}
          rowKey={(grade) => grade.id}
          emptyTitle="No grades yet"
          emptyMessage="Your grades will appear here once instructors encode them."
          ariaLabel="My grades"
        />
      )}
    </div>
  )
}