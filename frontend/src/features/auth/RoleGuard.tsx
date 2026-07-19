import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './store'

export function RoleGuard({ role }: { role: 'ADMIN' | 'USER' }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to="/documents" replace />
  return <Outlet />
}
