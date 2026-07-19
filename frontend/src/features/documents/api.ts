import { api } from '@/lib/api'
import type { ApiResponse, DocumentItem, DocumentStats, DocumentSummary, PageResponse } from '@/lib/types'

export interface ListParams {
  q?: string
  subject?: string
  /** Nhóm định dạng file: pdf | word | ppt | txt. */
  type?: string
  /** Lọc theo kích thước file (byte). */
  minSize?: number
  maxSize?: number
  page?: number
  size?: number
  /** Định dạng Spring: "field,asc|desc". Mặc định mới nhất trước. */
  sort?: string
}

export interface UpdatePayload {
  title: string
  description?: string
  subject?: string
}

export async function listDocuments(params: ListParams): Promise<PageResponse<DocumentSummary>> {
  const { data } = await api.get<ApiResponse<PageResponse<DocumentSummary>>>('/documents', {
    params: { sort: 'createdAt,desc', ...params },
  })
  return data.data
}

export async function getDocumentStats(): Promise<DocumentStats> {
  const { data } = await api.get<ApiResponse<DocumentStats>>('/documents/stats')
  return data.data
}

export async function getDocument(id: number): Promise<DocumentItem> {
  const { data } = await api.get<ApiResponse<DocumentItem>>(`/documents/${id}`)
  return data.data
}

export async function uploadDocument(
  formData: FormData,
  onProgress?: (percent: number) => void,
): Promise<DocumentItem> {
  const { data } = await api.post<ApiResponse<DocumentItem>>('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    // Tiến trình đẩy dữ liệu từ trình duyệt lên server (0–100)
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
    },
  })
  return data.data
}

export async function updateDocument(id: number, payload: UpdatePayload): Promise<DocumentItem> {
  const { data } = await api.put<ApiResponse<DocumentItem>>(`/documents/${id}`, payload)
  return data.data
}

export async function deleteDocument(id: number): Promise<void> {
  await api.delete(`/documents/${id}`)
}

// Sinh tóm tắt AI cho tài liệu (backend lưu lại, các lần xem sau đọc từ DB).
export async function summarizeDocument(id: number): Promise<string> {
  const { data } = await api.post<ApiResponse<string>>(`/documents/${id}/summary`)
  return data.data
}

// Lấy nội dung file (kèm JWT) để xem trước inline; gọi URL.revokeObjectURL sau khi dùng.
export async function getDocumentBlob(id: number): Promise<Blob> {
  const res = await api.get(`/documents/${id}/download`, { responseType: 'blob' })
  return res.data as Blob
}

// Tải file qua endpoint stream rồi kích hoạt download phía trình duyệt.
export async function downloadDocument(id: number, fallbackName: string): Promise<void> {
  const res = await api.get(`/documents/${id}/download`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data as Blob)
  const a = document.createElement('a')
  a.href = url
  a.download = parseFilename(res.headers['content-disposition']) ?? fallbackName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function parseFilename(disposition?: string): string | null {
  if (!disposition) return null
  const match = /filename="?([^"]+)"?/.exec(disposition)
  return match ? match[1] : null
}
