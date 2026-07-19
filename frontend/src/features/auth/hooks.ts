import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as authApi from './api'
import { useAuthStore } from './store'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => setAuth(data.accessToken, data.user),
  })
}

export function useRegister() {
  return useMutation({ mutationFn: authApi.register })
}

export function useForgotPassword() {
  return useMutation({ mutationFn: authApi.forgotPassword })
}

export function useResetPassword() {
  return useMutation({ mutationFn: authApi.resetPassword })
}

export function useProfile() {
  return useQuery({ queryKey: ['profile'], queryFn: authApi.getMe })
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: authApi.updateMe,
    onSuccess: (user) => {
      setUser(user) // đồng bộ tên hiển thị trên header
      qc.setQueryData(['profile'], user)
    },
  })
}

export function useChangePassword() {
  return useMutation({ mutationFn: authApi.changePassword })
}
