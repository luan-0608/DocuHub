import { api } from '@/lib/api'
import type { ApiResponse, DocumentSummary, PageResponse, User } from '@/lib/types'

export interface AdminListParams {
  page?: number
  size?: number
}

export async function listUsers(params: AdminListParams): Promise<PageResponse<User>> {
  const { data } = await api.get<ApiResponse<PageResponse<User>>>('/admin/users', {
    params: { ...params, sort: 'createdAt,desc' },
  })
  return data.data
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/admin/users/${id}`)
}

export async function listDocuments(params: AdminListParams): Promise<PageResponse<DocumentSummary>> {
  const { data } = await api.get<ApiResponse<PageResponse<DocumentSummary>>>('/admin/documents', {
    params: { ...params, sort: 'createdAt,desc' },
  })
  return data.data
}
