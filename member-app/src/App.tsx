import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { hasRole, isOwner } from './domain/permissions'
import type { User } from './domain/types'
import { useAuth, useData } from './data/store'
import LoginScreen from './features/auth/LoginScreen'
import ChevraDetail from './features/mentor/ChevraDetail'
import MentorDashboard from './features/mentor/MentorDashboard'
import OwnerAdmin from './features/owner/OwnerAdmin'
import PractitionerHome from './features/practitioner/PractitionerHome'

function defaultRouteFor(user: User): string {
  if (hasRole(user, 'melave') || isOwner(user)) return '/mentor'
  if (hasRole(user, 'matargel') || hasRole(user, 'workshop_facilitator')) return '/practitioner'
  return '/owner'
}

export default function App() {
  const { currentUserId } = useAuth()
  const { data } = useData()
  const user = data.users.find((u) => u.id === currentUserId)

  if (!user) return <LoginScreen />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to={defaultRouteFor(user)} replace />} />
        <Route path="/mentor" element={<MentorDashboard />} />
        <Route path="/mentor/:chevraId" element={<ChevraDetail />} />
        <Route path="/practitioner" element={<PractitionerHome />} />
        <Route path="/owner" element={<OwnerAdmin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
