import { requireAdmin } from '@/lib/access'
import { clerkClient } from '@clerk/nextjs/server'
import UsersClient from './UsersClient'

export default async function UsersPage() {
  await requireAdmin()

  const client = await clerkClient()
  const { data: users } = await client.users.getUserList({ limit: 100 })
  const serialized = users.map(u => ({
    id: u.id,
    email: u.emailAddresses[0]?.emailAddress ?? '',
    firstName: u.firstName ?? '',
    lastName: u.lastName ?? '',
    role: (u.publicMetadata?.role as string) ?? 'viewer',
    locations: (u.publicMetadata?.locations as string[]) ?? [],
  }))

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 28px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <a href="/" style={{ color: 'var(--teal-mid)', fontSize: 12, textDecoration: 'none' }}>← Back</a>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>User Management</h1>
          <p style={{ color: 'var(--gray)', fontSize: 12, marginTop: 4 }}>Invite users and manage their access. Role + locations are stored in Clerk user metadata.</p>
        </div>
        <UsersClient users={serialized} />
      </div>
    </main>
  )
}
