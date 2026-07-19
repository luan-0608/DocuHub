import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { getMe } from './api'
import { useAuthStore } from './store'

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token)
  const setUser = useAuthStore((s) => s.setUser)

  // Làm mới user từ server mỗi lần vào app: tên/vai trò đổi ở backend
  // (sửa tên, nâng quyền admin...) không bị kẹt bản cũ trong localStorage.
  useEffect(() => {
    if (!token) return
    getMe()
      .then(setUser)
      .catch(() => {}) // token hết hạn đã có interceptor xử lý
  }, [token, setUser])

  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}
