import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as docApi from './api'
import type { ListParams, UpdatePayload } from './api'

export function useDocuments(params: ListParams) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => docApi.listDocuments(params),
  })
}

// Key bắt đầu bằng 'documents' để các mutation invalidate chung là tự làm mới.
export function useDocumentStats() {
  return useQuery({
    queryKey: ['documents', 'stats'],
    queryFn: docApi.getDocumentStats,
  })
}

export function useDocument(id: number) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => docApi.getDocument(id),
    enabled: Number.isFinite(id),
  })
}

export function useUploadDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ fd, onProgress }: { fd: FormData; onProgress?: (percent: number) => void }) =>
      docApi.uploadDocument(fd, onProgress),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  })
}

export function useUpdateDocument(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdatePayload) => docApi.updateDocument(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: docApi.deleteDocument,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  })
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => docApi.downloadDocument(id, name),
  })
}

// Tóm tắt có thể mất chục giây (gọi LLM nhiều lần với tài liệu dài) — UI cần loading rõ.
export function useSummarizeDocument(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => docApi.summarizeDocument(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents', id] }),
  })
}
