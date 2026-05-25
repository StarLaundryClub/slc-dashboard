'use client'
import { useState } from 'react'

const LOCATIONS = ['brighton', 'nashua', 'orem']
const TEMPLATE_TYPES = [
  { value: 'metrics',     label: 'Monthly Metrics (a)' },
  { value: 'customers',  label: 'Top Customers / Products (b)' },
  { value: 'dimensions', label: 'Machine / Payment Breakdown (c)' },
]

const INPUT = { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--white)', padding: '8px 12px', fontSize: 13, width: '100%' }
const LABEL = { fontSize: 11, color: 'var(--teal-mid)', letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 5, display: 'block' as const }

export default function UploadForm() {
  const [location, setLocation]       = useState('orem')
  const [templateType, setTemplate]   = useState('metrics')
  const [file, setFile]               = useState<File | null>(null)
  const [status, setStatus]           = useState<{ type: 'idle'|'loading'|'ok'|'error'; msg?: string }>({ type: 'idle' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setStatus({ type: 'loading' })
    const fd = new FormData()
    fd.append('location', location)
    fd.append('templateType', templateType)
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) setStatus({ type: 'ok', msg: `Imported ${data.rowCount} rows for ${location} (${templateType})` })
      else setStatus({ type: 'error', msg: data.error || 'Upload failed' })
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gap: 20 }}>
        <div>
          <label style={LABEL}>Location</label>
          <select value={location} onChange={e => setLocation(e.target.value)} style={INPUT}>
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label style={LABEL}>Template Type</label>
          <select value={templateType} onChange={e => setTemplate(e.target.value)} style={INPUT}>
            {TEMPLATE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label style={LABEL}>CSV File</label>
          <input type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] ?? null)} style={INPUT} />
        </div>

        {status.type !== 'idle' && (
          <div style={{ padding: '10px 14px', borderRadius: 6, fontSize: 12, background: status.type === 'ok' ? 'rgba(10,146,120,0.15)' : status.type === 'error' ? 'rgba(255,107,107,0.15)' : 'rgba(245,158,11,0.1)', color: status.type === 'ok' ? 'var(--teal-bright)' : status.type === 'error' ? 'var(--neg)' : 'var(--amber)', border: `1px solid ${status.type === 'ok' ? 'var(--teal)' : status.type === 'error' ? 'var(--neg)' : 'var(--amber)'}` }}>
            {status.type === 'loading' ? '⏳ Uploading...' : status.msg}
          </div>
        )}

        <button type="submit" disabled={!file || status.type === 'loading'} style={{ background: 'var(--teal)', color: 'var(--white)', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: (!file || status.type === 'loading') ? 0.5 : 1 }}>
          Upload
        </button>

        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--gray)' }}>
          <strong style={{ color: 'var(--teal-mid)' }}>Template (a) — Monthly Metrics</strong><br />
          Columns: <code>period_label,metric_key,value,is_partial,days_complete,days_in_month,is_ratio</code><br /><br />
          <strong style={{ color: 'var(--teal-mid)' }}>Template (b) — Top Customers / Products</strong><br />
          Columns: <code>period_label,list_type,rank,name,value,secondary_value</code><br /><br />
          <strong style={{ color: 'var(--teal-mid)' }}>Template (c) — Machine / Payment Breakdown</strong><br />
          Columns: <code>period_label,dimension_type,dimension_key,value,is_ratio</code>
        </div>
      </div>
    </form>
  )
}
