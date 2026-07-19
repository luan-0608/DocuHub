import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as adminApi from './api'
import type { AdminListParams } from './api'
import { deleteDocument as deleteDocumentApi } from '@/features/documents/api'

export function useAdminUsers(params: AdminListParams) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.listUsers(params),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useAdminDocuments(params: AdminListParams) {
  return useQuery({
    queryKey: ['admin', 'documents', params],
    queryFn: () => adminApi.listDocuments(params),
  })
}

// Dùng lại endpoint DELETE /documents/{id} (backend đã cho ADMIN xóa bất kỳ tài liệu)
export function useDeleteAdminDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteDocumentApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'documents'] }),
  })
}
