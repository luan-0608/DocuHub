import { createBrowserRouter, Navigate, Outlet, ScrollRestoration } from 'react-router-dom'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { AdminRoute } from '@/features/auth/AdminRoute'
import { AppShell } from '@/components/layout/AppShell'
import HomePage from '@/pages/home/HomePage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import DocumentsPage from '@/pages/documents/DocumentsPage'
import DocumentDetailPage from '@/pages/documents/DocumentDetailPage'
import ProfilePage from '@/pages/profile/ProfilePage'
import AdminPage from '@/pages/admin/AdminPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Cuộn về đầu trang khi điều hướng sang trang mới, giữ nguyên vị trí khi bấm Back.
function RootLayout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  )
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: '/documents', element: <DocumentsPage /> },
              { path: '/documents/:id', element: <DocumentDetailPage /> },
              // Chat đã gộp vào panel Trợ lý AI — link cũ đưa về trang tài liệu
              { path: '/chat', element: <Navigate to="/documents" replace /> },
              { path: '/chat/:sessionId', element: <Navigate to="/documents" replace /> },
              { path: '/profile', element: <ProfilePage /> },
              {
                element: <AdminRoute />,
                children: [{ path: '/admin', element: <AdminPage /> }],
              },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
