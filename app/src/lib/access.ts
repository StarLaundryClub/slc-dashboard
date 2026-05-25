import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export type UserRole = 'admin' | 'viewer'
export type LocationSlug = 'brighton' | 'nashua' | 'orem' | 'global'

export interface UserAccess {
  userId: string
  role: UserRole
  locations: LocationSlug[]
}

export async function getUserAccess(): Promise<UserAccess> {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const meta = (user.publicMetadata ?? {}) as Record<string, unknown>
  const role = (meta.role as UserRole) ?? 'viewer'
  const locations = (meta.locations as LocationSlug[]) ?? []

  return { userId: user.id, role, locations }
}

// For API routes: returns access without redirecting (null if signed out).
export async function getApiUserAccess(): Promise<UserAccess | null> {
  const user = await currentUser()
  if (!user) return null
  const meta = (user.publicMetadata ?? {}) as Record<string, unknown>
  const role = (meta.role as UserRole) ?? 'viewer'
  const locations = (meta.locations as LocationSlug[]) ?? []
  return { userId: user.id, role, locations }
}

export async function requireAdmin(): Promise<UserAccess> {
  const access = await getUserAccess()
  if (access.role !== 'admin') redirect('/')
  return access
}

export async function requireLocationAccess(location: LocationSlug): Promise<UserAccess> {
  const access = await getUserAccess()
  if (access.role === 'admin') return access
  if (!access.locations.includes(location)) redirect('/')
  return access
}
