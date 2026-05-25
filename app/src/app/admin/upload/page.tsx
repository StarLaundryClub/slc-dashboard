import { requireAdmin } from '@/lib/access'
import UploadForm from './UploadForm'

export default async function UploadPage() {
  await requireAdmin()
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 28px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <a href="/" style={{ color: 'var(--teal-mid)', fontSize: 12, textDecoration: 'none' }}>← Back</a>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>Upload Monthly Data</h1>
          <p style={{ color: 'var(--gray)', fontSize: 12, marginTop: 4 }}>Upload CSV files to update dashboard data. Re-uploading a location+month overwrites existing data.</p>
        </div>
        <UploadForm />
      </div>
    </main>
  )
}
