import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './store'

// Chỉ cho ADMIN; người dùng thường bị đẩy về trang tài liệu.
export function AdminRoute() {
  const user = useAuthStore((s) => s.user)
  if (user?.role !== 'ADMIN') return <Navigate to="/documents" replace />
  return <Outlet />
}
