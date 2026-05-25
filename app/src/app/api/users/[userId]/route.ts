import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { getApiUserAccess } from '@/lib/access'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const access = await getApiUserAccess()
  if (!access) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (access.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId: targetUserId } = await params
  const { role, locations } = await req.json()
  const client = await clerkClient()
  await client.users.updateUserMetadata(targetUserId, {
    publicMetadata: { role, locations },
  })

  return NextResponse.json({ ok: true })
}
