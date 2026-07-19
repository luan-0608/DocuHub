import { useEffect, useState } from 'react'
import type { DragEvent } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, AlertCircle, FileText, FilePlus2, MessageSquare, RotateCcw, Sparkles, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatWelcomeArt } from '@/components/brand/empty-arts'
import { useDocuments } from '@/features/documents/hooks'
import { getApiError } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { ChatSession } from '@/lib/types'
import { useAddDocumentToSession, useCreateSession, useMessages, useSendMessage, useSessions } from '../hooks'
import { getDocDrag, hasDocDrag } from '../dragDoc'
import { useChatPanel } from '../panelStore'
import { MessageList } from './MessageList'
import { MessageComposer } from './MessageComposer'
import { NewSessionDialog } from './NewSessionDialog'
import { DeleteSessionDialog } from './DeleteSessionDialog'

// Panel Trợ lý AI trượt từ cạnh phải — dùng được ở mọi trang trong app,
// vừa xem tài liệu vừa hỏi mà không phải rời trang.
export function ChatPanel() {
  const { open, sessionId, closePanel, setSession } = useChatPanel()
  const { data: sessions } = useSessions()
  const addDoc = useAddDocumentToSession()
  const createSession = useCreateSession()
  const [dragOver, setDragOver] = useState(false)

  // Esc để đóng panel
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closePanel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closePanel])

  // Dù thả ở đâu (hoặc hủy kéo), luôn tắt lớp báo vùng thả — tránh kẹt overlay
  useEffect(() => {
    const reset = () => setDragOver(false)
    window.addEventListener('dragend', reset)
    window.addEventListener('drop', reset)
    return () => {
      window.removeEventListener('dragend', reset)
      window.removeEventListener('drop', reset)
    }
  }, [])

  const onDragOver = (e: DragEvent) => {
    if (!hasDocDrag(e)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setDragOver(true)
  }

  // Thả tài liệu: đang trong hội thoại → gắn thêm vào phiên;
  // đang ở danh sách → tạo phiên mới cho đúng tài liệu đó.
  const onDrop = (e: DragEvent) => {
    setDragOver(false)
    const doc = getDocDrag(e)
    if (!doc) return
    e.preventDefault()
    if (sessionId != null) {
      const session = sessions?.find((s) => s.id === sessionId)
      if (session?.documentIds.includes(doc.id)) {
        toast.info('Tài liệu đã có trong phiên này')
        return
      }
      addDoc.mutate(
        { sessionId, documentId: doc.id },
        {
          onSuccess: () => toast.success(`Đã thêm “${doc.title}” vào phiên chat`),
          onError: (err) => toast.error(getApiError(err)),
        },
      )
    } else {
      createSession.mutate(
        { title: doc.title, documentIds: [doc.id] },
        {
          onSuccess: (session) => {
            toast.success('Đã tạo phiên chat cho tài liệu')
            setSession(session.id)
          },
          onError: (err) => toast.error(getApiError(err)),
        },
      )
    }
  }

  return (
    <>
      {/* Lớp phủ mờ trên mobile để tập trung vào panel */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/25 md:hidden"
          onClick={closePanel}
          aria-hidden
        />
      )}
      <aside
        aria-label="Trợ lý AI"
        onDragOver={onDragOver}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-hidden bg-card transition-transform duration-500 ease-in-out md:rounded-l-3xl',
          open ? 'translate-x-0 shadow-[-16px_0_50px_rgba(74,111,165,0.16)]' : 'translate-x-full',
        )}
      >
        {/* Lớp báo vùng thả khi đang kéo tài liệu vào panel */}
        {dragOver && (
          <div className="pointer-events-none absolute inset-2 z-10 flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-primary/50 bg-background/95 text-primary">
            <FilePlus2 className="size-8" />
            <p className="font-display text-sm font-bold">
              {sessionId != null ? 'Thả để thêm vào phiên chat này' : 'Thả để hỏi về tài liệu này'}
            </p>
          </div>
        )}
        <header className="flex items-center gap-2 border-b border-primary/10 bg-wash-teal/20 px-4 py-3">
          {sessionId != null && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Quay lại danh sách phiên"
              onClick={() => setSession(null)}
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </span>
          <h2 className="min-w-0 flex-1 truncate font-display font-bold text-primary">Trợ lý AI</h2>
          <Button variant="ghost" size="icon" className="size-8" aria-label="Đóng" onClick={closePanel}>
            <X className="size-4" />
          </Button>
        </header>

        {/* key reset composer/scroll khi đổi phiên */}
        {sessionId != null ? (
          <PanelConversation key={sessionId} sessionId={sessionId} />
        ) : (
          <PanelSessionList />
        )}
      </aside>
    </>
  )
}

// Màn danh sách phiên: tạo mới + lịch sử chat, chọn để mở hội thoại.
function PanelSessionList() {
  const { data: sessions, isLoading } = useSessions()
  const setSession = useChatPanel((s) => s.setSession)
  const [target, setTarget] = useState<ChatSession | null>(null)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
      <NewSessionDialog />
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {isLoading && <p className="px-1 text-sm italic text-muted-foreground">Đang tải...</p>}
        {sessions?.length === 0 && (
          <div className="flex flex-col items-center gap-3 pt-10 text-center">
            <ChatWelcomeArt className="size-28" />
            <p className="max-w-xs text-sm italic text-muted-foreground">
              Chưa có cuộc trò chuyện nào. Tạo mới để hỏi AI về tài liệu của bạn.
            </p>
          </div>
        )}
        {sessions?.map((s) => (
          <div key={s.id} className="group flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSession(s.id)}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-500 ease-in-out hover:bg-primary/10"
            >
              <MessageSquare className="size-4 shrink-0 text-primary/70" />
              <span className="min-w-0 flex-1 truncate">{s.title}</span>
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {s.documentIds.length === 0 ? 'Tất cả' : s.documentIds.length}
              </span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-500 hover:text-destructive group-hover:opacity-100"
              aria-label="Xóa phiên chat"
              onClick={() => setTarget(s)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      {target && (
        <DeleteSessionDialog
          id={target.id}
          title={target.title}
          open={!!target}
          onOpenChange={(o) => !o && setTarget(null)}
        />
      )}
    </div>
  )
}

// Màn hội thoại: ngữ cảnh tài liệu + tin nhắn + ô nhập.
function PanelConversation({ sessionId }: { sessionId: number }) {
  const { data: messages, isLoading } = useMessages(sessionId)
  const { data: sessions } = useSessions()
  const { data: docs } = useDocuments({ size: 100 })
  const send = useSendMessage(sessionId)
  const session = sessions?.find((s) => s.id === sessionId)

  const nameById = new Map(docs?.content.map((d) => [d.id, d.title]))
  const names = session?.documentIds.map((id) => nameById.get(id) ?? `#${id}`) ?? []

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {session && (
        <div className="flex flex-col gap-1.5 border-b border-primary/10 px-4 py-3">
          <h3 className="truncate font-display text-sm font-bold text-primary">{session.title}</h3>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="size-3.5 shrink-0" />
            {names.length === 0 ? (
              <span className="italic">Đang hỏi trên tất cả tài liệu</span>
            ) : (
              names.map((n, i) => (
                <span key={i} className="max-w-40 truncate rounded-full bg-wash-teal/30 px-2.5 py-0.5 text-ink">
                  {n}
                </span>
              ))
            )}
          </div>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <p className="text-sm italic text-muted-foreground">Đang tải...</p>
        ) : (
          <MessageList messages={messages ?? []} pending={send.isPending} />
        )}
      </div>
      {/* Báo lỗi gửi tin (API chưa cấu hình, máy chủ AI mất kết nối...) —
          tin nhắn optimistic đã rollback nên kèm nút gửi lại câu hỏi vừa rồi */}
      {send.isError && (
        <div className="mx-3 mb-1 flex items-start gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p className="min-w-0 flex-1">{getApiError(send.error)}</p>
          {send.variables && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 shrink-0 gap-1 rounded-full px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => send.mutate(send.variables)}
            >
              <RotateCcw className="size-3.5" />
              Gửi lại
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label="Đóng thông báo lỗi"
            onClick={() => send.reset()}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}
      <div className="border-t border-primary/10 p-3">
        <MessageComposer onSend={(content) => send.mutate(content)} disabled={send.isPending} />
      </div>
    </div>
  )
}
