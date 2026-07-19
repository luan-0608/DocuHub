import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as chatApi from './api'
import type { CreateSessionPayload } from './api'
import type { ChatMessage } from '@/lib/types'

const sessionsKey = ['chat', 'sessions']
const messagesKey = (id: number) => ['chat', 'messages', id]

export function useSessions() {
  return useQuery({ queryKey: sessionsKey, queryFn: chatApi.listSessions })
}

export function useMessages(sessionId: number) {
  return useQuery({
    queryKey: messagesKey(sessionId),
    queryFn: () => chatApi.getMessages(sessionId),
    enabled: Number.isFinite(sessionId),
  })
}

export function useCreateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSessionPayload) => chatApi.createSession(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionsKey }),
  })
}

export function useDeleteSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: chatApi.deleteSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionsKey }),
  })
}

// Gắn thêm tài liệu vào phiên (kéo-thả card tài liệu vào panel chat)
export function useAddDocumentToSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionId, documentId }: { sessionId: number; documentId: number }) =>
      chatApi.addDocumentToSession(sessionId, documentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionsKey }),
  })
}

// Gửi câu hỏi: hiển thị ngay tin của user (optimistic), rollback nếu lỗi,
// đồng bộ lại lịch sử thật (kèm câu trả lời AI) khi hoàn tất.
export function useSendMessage(sessionId: number) {
  const qc = useQueryClient()
  const key = messagesKey(sessionId)
  return useMutation({
    mutationFn: (content: string) => chatApi.sendMessage(sessionId, content),
    onMutate: async (content) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<ChatMessage[]>(key) ?? []
      const optimistic: ChatMessage = {
        id: Date.now(),
        role: 'USER',
        content,
        createdAt: new Date().toISOString(),
      }
      qc.setQueryData<ChatMessage[]>(key, [...prev, optimistic])
      return { prev }
    },
    onError: (_err, _content, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
}
