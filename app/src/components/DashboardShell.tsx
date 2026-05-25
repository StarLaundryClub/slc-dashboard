import Link from 'next/link'

interface Props {
  title: string
  subtitle: string
  lastUpdated?: string
  children: React.ReactNode
}

export default function DashboardShell({ title, subtitle, lastUpdated, children }: Props) {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--white)', fontFamily: 'Arial, sans-serif', fontSize: 13 }}>
      {/* header */}
      <div style={{ background: 'linear-gradient(135deg,#1C1F26 0%,#1a2832 100%)', borderBottom: '2px solid var(--teal)', padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 18, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
        <Link href="/">
          <img src="/logo.png" alt="Star Laundry Club" style={{ height: 52, width: 'auto', filter: 'drop-shadow(0 0 8px rgba(30,225,219,0.3))' }} />
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 0.5 }}>{title}</div>
          <div style={{ fontSize: 11, color: 'var(--teal-mid)', marginTop: 2, letterSpacing: 1, textTransform: 'uppercase' }}>{subtitle}</div>
        </div>
        {lastUpdated && (
          <div style={{ textAlign: 'right', color: 'var(--gray)', fontSize: 11, lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--teal-bright)', fontSize: 12 }}>{lastUpdated}</strong>
          </div>
        )}
      </div>

      <div style={{ padding: '14px 28px 10px' }}>
        {children}
      </div>
    </div>
  )
}
