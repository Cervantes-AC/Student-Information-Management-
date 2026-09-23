import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { PageHeader, DetailRow } from '../components/ui/Page'
import { Badge } from '../components/ui/Badge'
import { initials, roleText } from '../utils/format'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useState } from 'react'

export default function ProfilePage(): React.JSX.Element {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  if (!user) return <></>

  const handleSignOut = (): void => {
    setSigningOut(true)
    void logout().then(() => navigate('/login', { replace: true }))
  }

  return (
    <div className="page">
      <PageHeader
        title="Your profile"
        subtitle="Account details for the SIMS workspace."
        actions={
          <button type="button" className="btn btn-danger-ghost" onClick={() => setConfirmOpen(true)}>
            Sign out
          </button>
        }
      />

      <section className="card profile-card">
        <div className="profile-avatar-large" aria-hidden="true">
          {initials(user.name)}
        </div>
        <dl className="detail-grid">
          <DetailRow label="Full name" value={user.name} />
          <DetailRow label="Email" value={user.email} />
          <DetailRow
            label="Role"
            value={
              <>
                {roleText(user.role)} <Badge tone="primary">{user.role}</Badge>
              </>
            }
          />
          <DetailRow label="Status" value={user.status === 'active' ? 'Active' : 'Inactive'} />
          {user.student_id ? <DetailRow label="Linked student record" value={`Student #${user.student_id}`} /> : null}
        </dl>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Sign out"
        message="End this session? Your bearer token will be revoked on the server."
        confirmLabel="Sign out"
        busy={signingOut}
        onConfirm={handleSignOut}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  )
}