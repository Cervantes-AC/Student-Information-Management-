import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../api/endpoints'
import { useAuth } from '../auth/AuthContext'
import { StatCard } from '../components/ui/Page'
import { ErrorState } from '../components/ui/States'
import { LoadingBlock } from '../components/ui/Feedback'
import type { DashboardStats, InstructorStats, StaffStats } from '../types'

export default function DashboardPage(): React.JSX.Element {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    dashboardApi
      .stats()
      .then(setStats)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load statistics.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  if (!user) return <></>

  const firstName = user.name.split(' ')[0] ?? user.name

  return (
    <div className="page dashboard-page">
      <section className="hero-card">
        <div>
          <h1>Welcome back, {firstName} 👋</h1>
          <p className="muted">
            You are signed in as <strong>{user.role_label}</strong> ({user.email}).
          </p>
        </div>
      </section>

      {loading ? (
        <LoadingBlock height={180} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : stats ? (
        <>
          {isStaffStats(stats) ? (
            <section className="stat-grid" aria-label="System statistics">
              <StatCard label="Students" value={stats.students} tone="primary" />
              <StatCard label="Programs" value={stats.programs} tone="info" />
              <StatCard label="Courses" value={stats.courses} tone="info" />
              <StatCard label="Academic terms" value={stats.academic_terms} tone="info" />
              <StatCard label="Course offerings" value={stats.course_offerings} tone="info" />
              <StatCard label="Enrollments" value={stats.enrollments} tone="success" />
              <StatCard label="Active enrollments" value={stats.active_enrollments} tone="success" />
              <StatCard label="Instructors" value={stats.instructors} tone="warning" />
            </section>
          ) : isInstructorStats(stats) ? (
            <section className="stat-grid" aria-label="Your class statistics">
              <StatCard label="Assigned offerings" value={stats.assigned_offerings} tone="primary" />
              <StatCard label="Enrolled students" value={stats.enrolled_students} tone="success" />
              <StatCard label="Grades encoded" value={stats.grades_encoded} tone="info" />
            </section>
          ) : (
            <section className="stat-grid" aria-label="Your statistics">
              <StatCard label="Enrollments" value={stats.enrollments} tone="primary" />
              <StatCard label="Active enrollments" value={stats.active_enrollments} tone="success" />
              <StatCard label="Grades on file" value={stats.grades_encoded} tone="info" />
            </section>
          )}

          <section className="quick-links" aria-label="Quick links">
            <h2>Quick access</h2>
            <div className="quick-link-grid">{quickLinks(user.role)}</div>
          </section>
        </>
      ) : null}
    </div>
  )
}

function isStaffStats(stats: DashboardStats): stats is StaffStats {
  return 'students' in stats
}

function isInstructorStats(stats: DashboardStats): stats is InstructorStats {
  return 'assigned_offerings' in stats
}

function quickLinks(role: string): React.JSX.Element[] {
  const links: { to: string; label: string; icon: string }[] = []
  if (role === 'administrator' || role === 'registrar') {
    links.push(
      { to: '/students', label: 'Manage students', icon: '👥' },
      { to: '/course-offerings', label: 'Course offerings', icon: '🏫' },
      { to: '/enrollments', label: 'Enrollments', icon: '📝' },
      { to: '/grades', label: 'Grades', icon: '⭐' },
    )
  } else if (role === 'instructor') {
    links.push(
      { to: '/course-offerings', label: 'My offerings', icon: '🏫' },
      { to: '/grades', label: 'Grade encoding', icon: '⭐' },
    )
  } else if (role === 'student') {
    links.push(
      { to: '/my/enrollments', label: 'My enrollments', icon: '📝' },
      { to: '/my/grades', label: 'My grades', icon: '⭐' },
      { to: '/my/academic-record', label: 'Academic record', icon: '🧾' },
    )
  }
  return links.map((link) => (
    <Link key={link.to} to={link.to} className="quick-link">
      <span className="quick-link-icon" aria-hidden="true">
        {link.icon}
      </span>
      <span>{link.label}</span>
    </Link>
  ))
}