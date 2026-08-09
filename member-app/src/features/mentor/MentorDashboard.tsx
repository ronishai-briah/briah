import { Link } from 'react-router-dom'
import { needsAttention, visibleChevraIds } from '../../domain/permissions'
import { useAuth, useData } from '../../data/store'

const trackLabels: Record<string, string> = {
  anchor: 'עוגן',
  growth: 'צמיחה',
  deepening: 'העמקה',
}

export default function MentorDashboard() {
  const { data } = useData()
  const { currentUserId } = useAuth()
  const user = data.users.find((u) => u.id === currentUserId)!

  const ids = visibleChevraIds(user, data)
  const chevrot = data.chevrot
    .filter((c) => ids.has(c.id))
    .slice()
    .sort((a, b) => Number(needsAttention(b, data.notes)) - Number(needsAttention(a, data.notes)))

  return (
    <div>
      <div className="card">
        <h2>החברות שלי</h2>
        <p className="muted">
          ממוין כך שמי ש"כדאי להתעדכן" איתה — כי לא נכתבה עליה הערה יותר מ-3 שבועות — מופיעה קודם.
        </p>
      </div>
      <div className="card-list">
        {chevrot.length === 0 && <p className="muted">אין כרגע חברות משובצות אליך.</p>}
        {chevrot.map((c) => {
          const attention = needsAttention(c, data.notes)
          return (
            <Link key={c.id} to={`/mentor/${c.id}`} className="chevra-row">
              <div>
                <div className="name">{c.name}</div>
                <div className="meta">
                  מסלול {trackLabels[c.track ?? ''] ?? 'ללא מסלול'} · הצטרפ/ה{' '}
                  {new Date(c.joinedAt).toLocaleDateString('he-IL')}
                </div>
              </div>
              {attention && <span className="badge badge-attention">כדאי להתעדכן</span>}
              {!attention && <span className="badge badge-ok">מעודכן</span>}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
