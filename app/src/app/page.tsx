import { getUserAccess } from '@/lib/access'
import Link from 'next/link'

const ALL_LOCATIONS = [
  { slug: 'global',   href: '/dashboard/global',   icon: '🌐', title: 'All Locations — Global Overview', sub: 'KPI Operational Dashboard' },
  { slug: 'brighton', href: '/dashboard/brighton', icon: '🏙️', title: 'Brighton — Boston, MA',           sub: 'KPI Operational Dashboard' },
  { slug: 'nashua',   href: '/dashboard/nashua',   icon: '🏢', title: 'Nashua, NH',                     sub: 'KPI Operational Dashboard' },
  { slug: 'orem',     href: '/dashboard/orem',     icon: '⛰️', title: 'Orem, UT',                       sub: 'KPI Operational Dashboard' },
]

export default async function HomePage() {
  const access = await getUserAccess()
  const visible = ALL_LOCATIONS.filter(l =>
    access.role === 'admin' || access.locations.includes(l.slug as 'global' | 'brighton' | 'nashua' | 'orem')
  )

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(10,146,120,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(10,146,120,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 640 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <img src="/logo.png" alt="Star Laundry Club" style={{ height: 90, width: 'auto', marginBottom: 16, filter: 'drop-shadow(0 0 12px rgba(30,225,219,0.2))' }} />
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--teal-mid)' }}>Operations Dashboards</div>
        </div>

        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--teal), transparent)', marginBottom: 36, opacity: 0.5 }} />
        <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--teal-mid)', marginBottom: 14 }}>— Locations</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
          {visible.map(loc => (
            <Link key={loc.slug} href={loc.href} style={{ display: 'flex', alignItems: 'center', gap: 18, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px', textDecoration: 'none', color: 'var(--white)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'linear-gradient(180deg, var(--teal), var(--teal-bright))', borderRadius: '3px 0 0 3px' }} />
              <div style={{ fontSize: 22, flexShrink: 0, width: 40, textAlign: 'center' }}>{loc.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{loc.title}</div>
                <div style={{ fontSize: 10, color: 'var(--gray)', letterSpacing: 0.5 }}>{loc.sub}</div>
              </div>
              <div style={{ color: 'var(--teal-mid)', fontSize: 16 }}>→</div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--border)', letterSpacing: 1 }}>
          <span style={{ color: 'var(--teal-mid)' }}>Star Laundry Club</span> · Boston Home Service Company
        </div>
      </div>
    </main>
  )
}
