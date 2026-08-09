import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  canSetCriticalFlag,
  canViewChevra,
  canViewMatargelSummary,
  canViewNote,
  canWriteNote,
} from '../../domain/permissions'
import { useAuth, useData } from '../../data/store'
import type { NoteVisibility } from '../../domain/types'

const trackLabels: Record<string, string> = {
  anchor: 'עוגן',
  growth: 'צמיחה',
  deepening: 'העמקה',
}

export default function ChevraDetail() {
  const { chevraId } = useParams<{ chevraId: string }>()
  const { data, addNote } = useData()
  const { currentUserId } = useAuth()
  const user = data.users.find((u) => u.id === currentUserId)!
  const chevra = data.chevrot.find((c) => c.id === chevraId)

  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState<NoteVisibility>('team_wide')
  const [critical, setCritical] = useState(false)

  if (!chevra) return <p>לא נמצאה חברה כזו.</p>
  if (!canViewChevra(user, chevra.id, data)) {
    return <p>אין לך גישה לכרטיס החברה הזה.</p>
  }

  const plan = data.personalPlans.find((p) => p.chevraId === chevra.id)
  const notes = data.notes
    .filter((n) => n.chevraId === chevra.id)
    .filter((n) => canViewNote(user, n))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  const summaries = data.matargelSummaries.filter(
    (s) => s.chevraId === chevra.id && canViewMatargelSummary(user, s.matargelId),
  )

  const authorName = (id: string) => data.users.find((u) => u.id === id)?.name ?? id

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    addNote({
      chevraId: chevra!.id,
      authorId: user.id,
      content: content.trim(),
      visibility,
      sharedWith: [],
      criticalFlag: critical,
    })
    setContent('')
    setCritical(false)
  }

  return (
    <div>
      <p>
        <Link to="/mentor">← חזרה לרשימת החברות</Link>
      </p>
      <div className="card">
        <h2>{chevra.name}</h2>
        <p className="muted">
          מסלול {trackLabels[chevra.track ?? ''] ?? 'ללא מסלול'} · סטטוס: {chevra.status} · הצטרפ/ה{' '}
          {new Date(chevra.joinedAt).toLocaleDateString('he-IL')}
        </p>
      </div>

      {plan && (
        <div className="card">
          <h3>תוכנית אישית</h3>
          <p>{plan.melaveNotes}</p>
          <ul>
            {Object.entries(plan.layers).map(([layer, note]) => (
              <li key={layer}>
                <strong>{layer}:</strong> {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summaries.length > 0 && (
        <div className="card">
          <h3>סיכומי מפגש מתרגל/ת (גלוי רק לניצן ולכותב/ת)</h3>
          {summaries.map((s) => (
            <div key={s.id} className="note">
              <div className="note-meta">
                {authorName(s.matargelId)} · {new Date(s.createdAt).toLocaleDateString('he-IL')}
              </div>
              <p>
                <strong>מטרת המפגש:</strong> {s.goal}
              </p>
              <p>
                <strong>מה עלה:</strong> {s.whatCameUp}
              </p>
              <p>
                <strong>המלצות המשך:</strong> {s.recommendations}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h3>הערות</h3>
        <div>
          {notes.length === 0 && <p className="muted">אין עדיין הערות שאת/ה יכול/ה לראות על החברה הזו.</p>}
          {notes.map((n) => (
            <div key={n.id} className="note">
              <div className="note-meta">
                <span>{authorName(n.authorId)}</span>
                <span>{new Date(n.createdAt).toLocaleDateString('he-IL')}</span>
                {n.visibility === 'team_wide' && <span className="badge badge-team">כלל-צוותי</span>}
                {n.visibility === 'limited' && <span className="badge badge-limited">מוגבל</span>}
                {n.criticalFlag && <span className="badge badge-critical">קריטי להעברה</span>}
              </div>
              <p>{n.content}</p>
            </div>
          ))}
        </div>

        {canWriteNote(user) && (
          <form onSubmit={handleSubmit}>
            <label>
              הערה חדשה
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="מה עלה בפגישה?" />
            </label>
            <div className="toggle-row">
              <label>
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === 'team_wide'}
                  onChange={() => setVisibility('team_wide')}
                />
                כלל-צוותי
              </label>
              <label>
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === 'limited'}
                  onChange={() => setVisibility('limited')}
                />
                מוגבל
              </label>
              {canSetCriticalFlag(user) && (
                <label>
                  <input type="checkbox" checked={critical} onChange={(e) => setCritical(e.target.checked)} />
                  קריטי להעברה הלאה
                </label>
              )}
            </div>
            <button type="submit" className="primary">
              שמירת הערה
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
