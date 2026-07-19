import { api } from '@/lib/api'
import type { ApiResponse, AuthData, User } from '@/lib/types'

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<ApiResponse<User>>('/auth/register', payload)
  return data.data
}

export async function login(payload: LoginPayload): Promise<AuthData> {
  const { data } = await api.post<ApiResponse<AuthData>>('/auth/login', payload)
  return data.data
}

export async function forgotPassword(email: string): Promise<string> {
  const { data } = await api.post<ApiResponse<null>>('/auth/forgot-password', { email })
  return data.message
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<string> {
  const { data } = await api.post<ApiResponse<null>>('/auth/reset-password', payload)
  return data.message
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<ApiResponse<User>>('/users/me')
  return data.data
}

export async function updateMe(fullName: string): Promise<User> {
  const { data } = await api.put<ApiResponse<User>>('/users/me', { fullName })
  return data.data
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export async function changePassword(payload: ChangePasswordPayload): Promise<string> {
  const { data } = await api.post<ApiResponse<null>>('/users/me/password', payload)
  return data.message
}
