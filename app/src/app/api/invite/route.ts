import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { getApiUserAccess } from '@/lib/access'

export async function POST(req: NextRequest) {
  const access = await getApiUserAccess()
  if (!access) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (access.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { email, role, locations } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const client = await clerkClient()
  await client.invitations.createInvitation({
    emailAddress: email,
    publicMetadata: { role: role ?? 'viewer', locations: locations ?? [] },
    redirectUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/',
  })

  return NextResponse.json({ ok: true })
}
