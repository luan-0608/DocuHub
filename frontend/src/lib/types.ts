export type Role = 'USER' | 'ADMIN'

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  errors?: Record<string, string>
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface User {
  id: number
  email: string
  fullName: string
  role: Role
  createdAt?: string
}

export interface AuthData {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface DocumentItem {
  id: number
  title: string
  description?: string
  subject?: string
  fileUrl?: string
  fileType: string
  fileSize?: number
  indexed: boolean
  /** Tóm tắt AI đã lưu (null/undefined = chưa tạo). */
  summary?: string | null
  createdAt: string
}

export interface DocumentSummary {
  id: number
  title: string
  description?: string
  subject?: string
  fileType: string
  fileSize?: number
  indexed: boolean
  createdAt: string
}

export interface DocumentStats {
  totalDocuments: number
  totalSize: number
  subjects: { name: string | null; count: number }[]
}

export type MessageRole = 'USER' | 'ASSISTANT'

export interface ChatSession {
  id: number
  documentIds: number[]
  title: string
  createdAt: string
}

/** Nguồn [S#] mà câu trả lời AI trích dẫn (tên tài liệu + đoạn + trích đoạn ngắn). */
export interface SourceRef {
  label: string
  documentId: number
  documentTitle: string
  chunkIndex: number
  snippet: string
}

export interface ChatMessage {
  id: number
  role: MessageRole
  content: string
  createdAt: string
  /** Chỉ có ở tin nhắn ASSISTANT; rỗng nếu câu trả lời không trích nguồn. */
  sources?: SourceRef[]
}

export interface ChatAnswer {
  userMessage: ChatMessage
  assistantMessage: ChatMessage
}
