import { useCallback, useEffect, useState } from 'react'
import { myApi } from '../api/endpoints'
import { PageHeader } from '../components/ui/Page'
import { Badge } from '../components/ui/Badge'
import { ErrorState } from '../components/ui/States'
import { LoadingBlock } from '../components/ui/Feedback'
import { enrollmentStatusInfo, formatDate, formatGrade } from '../utils/format'
import type { Enrollment } from '../types'

export default function MyEnrollmentsPage(): React.JSX.Element {
  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setError(null)
    myApi
      .enrollments()
      .then(setEnrollments)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load your enrollments.'))
  }, [])

  useEffect(load, [load])

  return (
    <div className="page">
      <PageHeader title="My Enrollments" subtitle="The courses you are enrolled in." />
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : enrollments === null ? (
        <LoadingBlock />
      ) : enrollments.length === 0 ? (
        <p className="muted">You have no enrollments on file.</p>
      ) : (
        <div className="card-list">
          {enrollments.map((enrollment) => {
            const info = enrollmentStatusInfo(enrollment.status)
            return (
              <article key={enrollment.id} className="card card-row">
                <div className="card-row-main">
                  <h3>
                    {enrollment.course_offering.course?.course_code ?? '—'} —{' '}
                    {enrollment.course_offering.course?.course_title ?? '—'}
                  </h3>
                  <p className="muted">
                    Section {enrollment.course_offering.section} · {enrollment.course_offering.academic_term.display_name}
                    {enrollment.course_offering.schedule ? ` · ${enrollment.course_offering.schedule}` : ''}
                    {enrollment.course_offering.room ? ` · Room ${enrollment.course_offering.room}` : ''}
                  </p>
                  <p className="small muted">
                    Instructor: {enrollment.course_offering.instructor?.name ?? '—'} · Enrolled{' '}
                    {formatDate(enrollment.enrollment_date)}
                  </p>
                </div>
                <div className="card-row-side">
                  <Badge tone={info.tone}>{info.label}</Badge>
                  {enrollment.grade ? (
                    <span className="grade-chip" title="Grade">
                      {formatGrade(enrollment.grade.final_grade ?? enrollment.grade.midterm_grade)}
                    </span>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}