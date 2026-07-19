import { api } from '@/lib/api'
import type { ApiResponse, ChatAnswer, ChatMessage, ChatSession } from '@/lib/types'

export interface CreateSessionPayload {
  documentIds: number[]
  title: string
}

export async function listSessions(): Promise<ChatSession[]> {
  const { data } = await api.get<ApiResponse<ChatSession[]>>('/chat/sessions')
  return data.data
}

export async function createSession(payload: CreateSessionPayload): Promise<ChatSession> {
  const { data } = await api.post<ApiResponse<ChatSession>>('/chat/sessions', payload)
  return data.data
}

export async function getMessages(sessionId: number): Promise<ChatMessage[]> {
  const { data } = await api.get<ApiResponse<ChatMessage[]>>(`/chat/sessions/${sessionId}/messages`)
  return data.data
}

export async function deleteSession(sessionId: number): Promise<void> {
  await api.delete(`/chat/sessions/${sessionId}`)
}

export async function addDocumentToSession(
  sessionId: number,
  documentId: number,
): Promise<ChatSession> {
  const { data } = await api.post<ApiResponse<ChatSession>>(
    `/chat/sessions/${sessionId}/documents/${documentId}`,
  )
  return data.data
}

export async function sendMessage(sessionId: number, content: string): Promise<ChatAnswer> {
  const { data } = await api.post<ApiResponse<ChatAnswer>>(
    `/chat/sessions/${sessionId}/messages`,
    { content },
  )
  return data.data
}
