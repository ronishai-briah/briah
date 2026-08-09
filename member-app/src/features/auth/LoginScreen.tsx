import BriahMark from '../../components/BriahMark'
import { useAuth, useData } from '../../data/store'

const roleLabels: Record<string, string> = {
  owner: 'Owner',
  melave: 'מלווה',
  matargel: 'מתרגל/ת 1:1',
  workshop_facilitator: 'מנחה סדנה',
}

export default function LoginScreen() {
  const { data } = useData()
  const { setCurrentUserId } = useAuth()

  return (
    <div className="app-shell">
      <div className="app-header">
        <div className="brand-lockup">
          <BriahMark size={36} />
          <h1>בריא.ה — אפליקציית חברות ומלוות</h1>
        </div>
      </div>
      <div className="demo-banner">
        זהו מסך כניסה זמני להדגמה בלבד — אין עדיין התחברות אמיתית (Supabase Auth יחליף את זה). בחר/י באיזה משתמש/ת להיכנס כדי לראות
        איך ההרשאות משתנות בין תפקידים.
      </div>
      <div className="card">
        <h2>מי נכנס/ת?</h2>
        <div className="login-grid">
          {data.users.map((u) => (
            <div key={u.id} className="login-card" onClick={() => setCurrentUserId(u.id)}>
              <div style={{ fontWeight: 700 }}>{u.name}</div>
              <div className="muted">{u.email}</div>
              <div className="roles">
                {u.roles.map((r) => (
                  <span key={r} className="role-pill">
                    {roleLabels[r] ?? r}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
