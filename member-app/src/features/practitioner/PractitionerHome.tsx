import { useState } from 'react'
import { canCreateSubmission, canViewAgreement } from '../../domain/permissions'
import { useAuth, useData } from '../../data/store'
import type { ReceiptFile, SubmissionItem } from '../../domain/types'

const agreementTypeLabels: Record<string, string> = {
  per_session: 'לפי טיפול/סדנה',
  retainer: 'ריטיינר',
  revenue_share: 'אחוז מהכנסה',
  other: 'אחר',
}

const statusLabels: Record<string, string> = {
  paid: 'שולם',
  unpaid: 'לא שולם',
  partial: 'שולם חלקית',
}

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function PractitionerHome() {
  const { data, createSubmission } = useData()
  const { currentUserId } = useAuth()
  const user = data.users.find((u) => u.id === currentUserId)!

  const agreement = data.agreements.find((a) => a.practitionerId === user.id)
  const mySubmissions = data.submissions
    .filter((s) => s.practitionerId === user.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  const now = new Date()
  const [items, setItems] = useState<SubmissionItem[]>([{ id: uid('item'), date: '', kind: '', note: '' }])
  const [receipts, setReceipts] = useState<ReceiptFile[]>([])

  const canSubmit = canCreateSubmission(user)

  function updateItem(id: string, patch: Partial<SubmissionItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }

  function addItemRow() {
    setItems((prev) => [...prev, { id: uid('item'), date: '', kind: '', note: '' }])
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    setReceipts((prev) => [...prev, { id: uid('receipt'), fileName: file.name, dataUrl, uploadedAt: new Date().toISOString() }])
    e.target.value = ''
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validItems = items.filter((it) => it.date && it.kind)
    if (validItems.length === 0) return
    createSubmission({
      practitionerId: user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      items: validItems,
      receipts,
    })
    setItems([{ id: uid('item'), date: '', kind: '', note: '' }])
    setReceipts([])
  }

  return (
    <div>
      <div className="card">
        <h2>תנאי ההעסקה שלי</h2>
        {agreement && canViewAgreement(user, agreement) ? (
          <div>
            <p>
              <strong>סוג הסכם:</strong> {agreementTypeLabels[agreement.agreementType]}
            </p>
            <p>
              <strong>תעריף:</strong> {agreement.rate ?? '—'} {agreement.currency}
            </p>
            <p>
              <strong>תנאי תשלום:</strong> {agreement.paymentTerms || '—'}
            </p>
            <p className="muted">
              בתוקף מ-{new Date(agreement.startDate).toLocaleDateString('he-IL')}
              {agreement.endDate ? ` עד ${new Date(agreement.endDate).toLocaleDateString('he-IL')}` : ' (ללא תאריך סיום)'}
            </p>
            <p className="muted">קריאה בלבד — רק רוני עורכת את תנאי ההעסקה.</p>
          </div>
        ) : (
          <p className="muted">עדיין לא הוגדרו תנאי העסקה עבורך — פני/ה לרוני.</p>
        )}
      </div>

      {canSubmit && (
        <div className="card">
          <h2>דיווח חודשי חדש</h2>
          <form onSubmit={handleSubmit}>
            {items.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <label>
                  תאריך
                  <input type="date" value={item.date} onChange={(e) => updateItem(item.id, { date: e.target.value })} />
                </label>
                <label>
                  סוג טיפול/סדנה
                  <input type="text" value={item.kind} onChange={(e) => updateItem(item.id, { kind: e.target.value })} />
                </label>
                <label>
                  הערה חופשית
                  <input type="text" value={item.note} onChange={(e) => updateItem(item.id, { note: e.target.value })} />
                </label>
              </div>
            ))}
            <button type="button" className="secondary" onClick={addItemRow}>
              + שורה נוספת
            </button>

            <label>
              צירוף קבלה
              <input type="file" onChange={handleFile} />
            </label>
            {receipts.length > 0 && (
              <ul>
                {receipts.map((r) => (
                  <li key={r.id}>{r.fileName}</li>
                ))}
              </ul>
            )}

            <button type="submit" className="primary">
              שליחת דיווח לרוני
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>הדיווחים שלי</h2>
        {mySubmissions.length === 0 && <p className="muted">עדיין לא הוגשו דיווחים.</p>}
        {mySubmissions.map((s) => (
          <div key={s.id} className="note">
            <div className="note-meta">
              <span>
                {s.month}/{s.year}
              </span>
              <span className={`badge badge-${s.paymentStatus}`}>{statusLabels[s.paymentStatus]}</span>
            </div>
            <ul>
              {s.items.map((it) => (
                <li key={it.id}>
                  {new Date(it.date).toLocaleDateString('he-IL')} — {it.kind} {it.note && `(${it.note})`}
                </li>
              ))}
            </ul>
            {s.ownerNote && <p className="muted">הערת רוני: {s.ownerNote}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
