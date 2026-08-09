import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { hasRole, isOwner } from '../domain/permissions'
import { useAuth, useData } from '../data/store'
import BriahMark from './BriahMark'

export default function Layout({ children }: { children: ReactNode }) {
  const { data } = useData()
  const { currentUserId, setCurrentUserId } = useAuth()
  const user = data.users.find((u) => u.id === currentUserId)
  if (!user) return null

  return (
    <div className="app-shell">
      <div className="app-header">
        <div className="brand-lockup">
          <BriahMark size={30} />
          <h1>בריא.ה</h1>
        </div>
        <div className="user-chip">
          <span>{user.name}</span>
          <button onClick={() => setCurrentUserId(null)}>החלפת משתמש/ת (דמו)</button>
        </div>
      </div>

      <nav className="nav-tabs">
        {(hasRole(user, 'melave') || isOwner(user)) && (
          <NavLink to="/mentor" className={({ isActive }) => (isActive ? 'active' : '')}>
            לוח מלווה
          </NavLink>
        )}
        {(hasRole(user, 'matargel') || hasRole(user, 'workshop_facilitator')) && (
          <NavLink to="/practitioner" className={({ isActive }) => (isActive ? 'active' : '')}>
            דיווח ותנאי העסקה
          </NavLink>
        )}
        {isOwner(user) && (
          <NavLink to="/owner" className={({ isActive }) => (isActive ? 'active' : '')}>
            ניהול (רוני/ניצן)
          </NavLink>
        )}
      </nav>

      {children}
    </div>
  )
}
