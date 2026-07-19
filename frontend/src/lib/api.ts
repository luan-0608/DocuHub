import axios, { AxiosError } from 'axios'
import type { ApiResponse } from '@/lib/types'
import { useAuthStore } from '@/features/auth/store'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clear()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

// Lấy message lỗi từ ApiResponse để hiển thị toast.
export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse<unknown> | undefined
    if (data?.message) return data.message
    // Không có response = request không tới được backend (server tắt, mất mạng, timeout)
    if (!error.response) {
      return 'Không kết nối được máy chủ — kiểm tra backend đã chạy chưa hoặc kết nối mạng'
    }
  }
  return 'Đã có lỗi xảy ra, vui lòng thử lại'
}
