import { useState } from 'react'
import { hasRole } from '../../domain/permissions'
import { useAuth, useData } from '../../data/store'
import type { AgreementType, PaymentStatus, PractitionerAgreement } from '../../domain/types'

const agreementTypeLabels: Record<AgreementType, string> = {
  per_session: 'לפי טיפול/סדנה',
  retainer: 'ריטיינר',
  revenue_share: 'אחוז מהכנסה',
  other: 'אחר',
}

const statusLabels: Record<PaymentStatus, string> = {
  paid: 'שולם',
  unpaid: 'לא שולם',
  partial: 'שולם חלקית',
}

function AgreementRow({ practitionerId, practitionerName }: { practitionerId: string; practitionerName: string }) {
  const { data, upsertAgreement } = useData()
  const existing = data.agreements.find((a) => a.practitionerId === practitionerId)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<PractitionerAgreement>(
    existing ?? {
      id: `ag_${practitionerId}`,
      practitionerId,
      agreementType: 'per_session',
      rate: null,
      currency: 'ILS',
      paymentTerms: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: null,
      notes: '',
    },
  )

  function save() {
    upsertAgreement(form)
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="chevra-row" style={{ cursor: 'default' }}>
        <div>
          <div className="name">{practitionerName}</div>
          <div className="meta">
            {existing
              ? `${agreementTypeLabels[existing.agreementType]} · ${existing.rate ?? '—'} ${existing.currency} · ${existing.paymentTerms || '—'}`
              : 'אין עדיין תנאי העסקה'}
          </div>
        </div>
        <button className="secondary" onClick={() => setEditing(true)}>
          {existing ? 'עריכה' : 'הגדרת תנאים'}
        </button>
      </div>
    )
  }

  return (
    <div className="card">
      <h3>תנאי העסקה — {practitionerName}</h3>
      <label>
        סוג הסכם
        <select
          value={form.agreementType}
          onChange={(e) => setForm({ ...form, agreementType: e.target.value as AgreementType })}
        >
          {Object.entries(agreementTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        תעריף/סכום (₪)
        <input
          type="number"
          value={form.rate ?? ''}
          onChange={(e) => setForm({ ...form, rate: e.target.value ? Number(e.target.value) : null })}
        />
      </label>
      <label>
        תנאי תשלום
        <input type="text" value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} />
      </label>
      <label>
        תאריך התחלה
        <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
      </label>
      <label>
        הערות
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="primary" onClick={save}>
          שמירה
        </button>
        <button className="secondary" onClick={() => setEditing(false)}>
          ביטול
        </button>
      </div>
    </div>
  )
}

function PaymentRow({ submissionId }: { submissionId: string }) {
  const { data, markPayment } = useData()
  const { currentUserId } = useAuth()
  const submission = data.submissions.find((s) => s.id === submissionId)!
  const practitioner = data.users.find((u) => u.id === submission.practitionerId)
  const [note, setNote] = useState(submission.ownerNote)

  return (
    <div className="note">
      <div className="note-meta">
        <span>{practitioner?.name}</span>
        <span>
          {submission.month}/{submission.year}
        </span>
        <span className={`badge badge-${submission.paymentStatus}`}>{statusLabels[submission.paymentStatus]}</span>
      </div>
      <ul>
        {submission.items.map((it) => (
          <li key={it.id}>
            {new Date(it.date).toLocaleDateString('he-IL')} — {it.kind} {it.note && `(${it.note})`}
          </li>
        ))}
      </ul>
      <label>
        הערה
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <div className="toggle-row">
        {(['unpaid', 'partial', 'paid'] as PaymentStatus[]).map((status) => (
          <button
            key={status}
            className={status === submission.paymentStatus ? 'primary' : 'secondary'}
            onClick={() => markPayment(submission.id, status, currentUserId!, note)}
            type="button"
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function OwnerAdmin() {
  const { data } = useData()
  const { currentUserId } = useAuth()
  const user = data.users.find((u) => u.id === currentUserId)!
  const practitioners = data.users.filter((u) => hasRole(u, 'matargel') || hasRole(u, 'workshop_facilitator'))
  const submissions = data.submissions.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  if (!hasRole(user, 'finance')) {
    return <p>המסך הזה (תנאי העסקה ותשלומים) חשוף רק לרוני.</p>
  }

  return (
    <div>
      <div className="card">
        <h2>תנאי העסקה למתרגלים/מנחים</h2>
        <p className="muted">רק רוני עורכת. המתרגל/ת רואה את שלו/ה בלבד, בקריאה בלבד.</p>
        <div className="card-list">
          {practitioners.map((p) => (
            <AgreementRow key={p.id} practitionerId={p.id} practitionerName={p.name} />
          ))}
        </div>
      </div>

      <div className="card">
        <h2>דיווחים ותשלומים</h2>
        {submissions.length === 0 && <p className="muted">אין עדיין דיווחים.</p>}
        {submissions.map((s) => (
          <PaymentRow key={s.id} submissionId={s.id} />
        ))}
      </div>
    </div>
  )
}
