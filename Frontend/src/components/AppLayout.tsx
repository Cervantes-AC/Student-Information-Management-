import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { initials, roleText } from '../utils/format'
import type { Role } from '../types'

interface NavItem {
  to: string
  label: string
  icon: string
  roles: Role[]
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: '📊', roles: ['administrator', 'registrar', 'instructor', 'student'], end: true },
  { to: '/students', label: 'Students', icon: '👥', roles: ['administrator', 'registrar'] },
  { to: '/programs', label: 'Programs', icon: '🎓', roles: ['administrator', 'registrar'] },
  { to: '/courses', label: 'Courses', icon: '📚', roles: ['administrator', 'registrar'] },
  { to: '/academic-terms', label: 'Academic Terms', icon: '📅', roles: ['administrator', 'registrar'] },
  { to: '/course-offerings', label: 'Course Offerings', icon: '🏫', roles: ['administrator', 'registrar', 'instructor'] },
  { to: '/enrollments', label: 'Enrollments', icon: '📝', roles: ['administrator', 'registrar'] },
  { to: '/grades', label: 'Grades', icon: '⭐', roles: ['administrator', 'registrar', 'instructor'] },
  { to: '/my/enrollments', label: 'My Enrollments', icon: '📝', roles: ['student'] },
  { to: '/my/grades', label: 'My Grades', icon: '⭐', roles: ['student'] },
  { to: '/my/academic-record', label: 'My Academic Record', icon: '🧾', roles: ['student'] },
  { to: '/profile', label: 'Profile', icon: '👤', roles: ['administrator', 'registrar', 'instructor', 'student'] },
]

function NavList({ onNavigate }: { onNavigate?: () => void }): React.JSX.Element {
  const { user } = useAuth()
  if (!user) return <></>
  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role))
  return (
    <nav className="nav-list" aria-label="Main navigation">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onNavigate}
        >
          <span className="nav-icon" aria-hidden="true">
            {item.icon}
          </span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

function UserChip(): React.JSX.Element {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return <></>

  const handleLogout = (): void => {
    void logout().then(() => navigate('/login', { replace: true }))
  }

  return (
    <div className="user-chip">
      <div className="user-avatar" aria-hidden="true">
        {initials(user.name)}
      </div>
      <div className="user-info">
        <strong>{user.name}</strong>
        <span className="muted">{roleText(user.role)}</span>
      </div>
      <button type="button" className="icon-btn" title="Log out" aria-label="Log out" onClick={handleLogout}>
        ⎋
      </button>
    </div>
  )
}

/** Application shell: responsive sidebar + topbar + routed content. */
export function AppLayout({ children }: { children?: ReactNode }): React.JSX.Element {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="app-shell">
      <div className={`sidebar-backdrop ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`sidebar ${drawerOpen ? 'open' : ''}`}>
        <div className="brand">
          <Link to="/" className="brand-link" onClick={() => setDrawerOpen(false)}>
            <span className="brand-mark" aria-hidden="true">
              🎓
            </span>
            <span className="brand-text">
              <strong>SIMS</strong>
              <small>Student Info System</small>
            </span>
          </Link>
        </div>
        <div className="nav-scroll">
          <NavList onNavigate={() => setDrawerOpen(false)} />
        </div>
        <UserChip />
      </aside>

      <div className="app-main">
        <header className="topbar">
          <button
            type="button"
            className="icon-btn hamburger"
            aria-label="Toggle navigation"
            onClick={() => setDrawerOpen((open) => !open)}
          >
            ☰
          </button>
          <div className="topbar-title">
            <span className="badge badge-primary">{user ? roleText(user.role) : ''} workspace</span>
          </div>
          <Link to="/profile" className="topbar-avatar" aria-label="Your profile">
            {user ? initials(user.name) : '—'}
          </Link>
        </header>
        <main className="app-content">{children ?? <Outlet />}</main>
      </div>
    </div>
  )
}