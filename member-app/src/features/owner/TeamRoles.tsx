import { canManageRoles, hasRole } from '../../domain/permissions'
import { allRoles, roleLabels } from '../../domain/roleLabels'
import { useAuth, useData } from '../../data/store'
import type { Role } from '../../domain/types'

export default function TeamRoles() {
  const { data, updateUserRoles } = useData()
  const { currentUserId } = useAuth()
  const currentUser = data.users.find((u) => u.id === currentUserId)!

  if (!canManageRoles(currentUser)) {
    return null
  }

  function toggle(userId: string, role: Role, checked: boolean) {
    const user = data.users.find((u) => u.id === userId)
    if (!user) return
    // הגנה בסיסית מפני נעילה עצמית — אי אפשר להוריד לעצמך את 'finance'.
    if (userId === currentUser.id && role === 'finance' && !checked) return
    const roles = checked ? [...user.roles, role] : user.roles.filter((r) => r !== role)
    updateUserRoles(userId, roles)
  }

  return (
    <div className="card">
      <h2>ניהול צוות והרשאות</h2>
      <p className="muted">
        חשוף רק לרוני. שינוי כאן משפיע מיד על מה שכל אחד/ת רואה ויכול/ה לעשות באפליקציה — כולל הרשאות
        &quot;פיננסים&quot; ו-&quot;Owner&quot;, אז שווה זהירות.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>שם</th>
              {allRoles.map((role) => (
                <th key={role}>{roleLabels[role]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                {allRoles.map((role) => (
                  <td key={role}>
                    <input
                      type="checkbox"
                      checked={hasRole(u, role)}
                      disabled={u.id === currentUser.id && role === 'finance'}
                      onChange={(e) => toggle(u.id, role, e.target.checked)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
