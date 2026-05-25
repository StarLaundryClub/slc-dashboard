'use client'
import { useState } from 'react'

const LOCS = ['brighton','nashua','orem','global']
const INPUT = { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--white)', padding: '7px 10px', fontSize: 12, width: '100%' }

interface User { id: string; email: string; firstName: string; lastName: string; role: string; locations: string[] }

export default function UsersClient({ users }: { users: User[] }) {
  const [inviteEmail, setInviteEmail]   = useState('')
  const [inviteRole, setInviteRole]     = useState('viewer')
  const [inviteLocs, setInviteLocs]     = useState<string[]>([])
  const [status, setStatus]             = useState<string>('')

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    setStatus('Sending...')
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole, locations: inviteLocs }),
    })
    const d = await res.json()
    setStatus(res.ok ? `✓ Invited ${inviteEmail}` : `Error: ${d.error}`)
    if (res.ok) { setInviteEmail(''); setInviteLocs([]) }
  }

  async function updateUser(userId: string, role: string, locations: string[]) {
    const res = await fetch('/api/users/' + userId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, locations }),
    })
    if (res.ok) setStatus('Updated.')
    else setStatus('Update failed.')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Invite form */}
      <form onSubmit={sendInvite} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--teal-mid)', marginBottom: 14 }}>Invite New User</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--gray)', display: 'block', marginBottom: 4 }}>Email</label>
            <input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} style={INPUT} placeholder="user@example.com" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--gray)', display: 'block', marginBottom: 4 }}>Role</label>
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={INPUT}>
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: 'var(--gray)', display: 'block', marginBottom: 6 }}>Locations (leave empty for all)</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
            {LOCS.map(l => (
              <label key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={inviteLocs.includes(l)} onChange={e => setInviteLocs(prev => e.target.checked ? [...prev, l] : prev.filter(x => x !== l))} />
                {l}
              </label>
            ))}
          </div>
        </div>
        {status && <div style={{ fontSize: 12, color: 'var(--teal-bright)', marginBottom: 8 }}>{status}</div>}
        <button type="submit" style={{ background: 'var(--teal)', color: 'var(--white)', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Send Invite
        </button>
      </form>

      {/* User list */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--teal-mid)', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>Existing Users</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--bg3)' }}>
              {['Name','Email','Role','Locations',''].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--gray)', fontWeight: 600, fontSize: 11 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {users.map(u => <UserRow key={u.id} user={u} onUpdate={updateUser} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UserRow({ user, onUpdate }: { user: User; onUpdate: (id: string, role: string, locs: string[]) => void }) {
  const [role, setRole]     = useState(user.role)
  const [locs, setLocs]     = useState(user.locations)
  const [dirty, setDirty]   = useState(false)

  return (
    <tr style={{ borderTop: '1px solid var(--border)' }}>
      <td style={{ padding: '8px 12px' }}>{user.firstName} {user.lastName}</td>
      <td style={{ padding: '8px 12px', color: 'var(--gray)' }}>{user.email}</td>
      <td style={{ padding: '8px 12px' }}>
        <select value={role} onChange={e => { setRole(e.target.value); setDirty(true) }} style={{ ...({} as any), background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--white)', padding: '4px 6px', fontSize: 11 }}>
          <option value="viewer">Viewer</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td style={{ padding: '8px 12px' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
          {LOCS.map(l => (
            <label key={l} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, cursor: 'pointer' }}>
              <input type="checkbox" checked={locs.includes(l)} onChange={e => { setLocs(prev => e.target.checked ? [...prev, l] : prev.filter(x => x !== l)); setDirty(true) }} />
              {l}
            </label>
          ))}
        </div>
      </td>
      <td style={{ padding: '8px 12px' }}>
        {dirty && (
          <button onClick={() => { onUpdate(user.id, role, locs); setDirty(false) }} style={{ background: 'var(--teal)', color: 'var(--white)', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>
            Save
          </button>
        )}
      </td>
    </tr>
  )
}
