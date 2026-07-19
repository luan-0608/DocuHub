import { useEffect, useRef } from 'react'
import { Bot, Sparkles } from 'lucide-react'
import { ChatBubble } from './ChatBubble'
import type { ChatMessage } from '@/lib/types'

interface Props {
  messages: ChatMessage[]
  pending: boolean
}

export function MessageList({ messages, pending }: Props) {
  const endRef = useRef<HTMLDivElement>(null)

  // Tự cuộn xuống cuối khi có tin mới hoặc khi AI đang trả lời
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, pending])

  if (messages.length === 0 && !pending) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-wash-peach/40 text-ink">
          <Sparkles className="size-5" />
        </span>
        <p className="max-w-xs text-sm italic text-muted-foreground">
          Hãy đặt câu hỏi đầu tiên về tài liệu của bạn.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((m) => (
        <ChatBubble key={m.id} message={m} />
      ))}
      {pending && (
        <div className="flex gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-wash-peach/40 text-ink">
            <Bot className="size-4" />
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-primary/10 bg-background px-4 py-3 shadow-wash">
            <span className="size-2 animate-pulse rounded-full bg-primary/70 [animation-delay:-0.3s]" />
            <span className="size-2 animate-pulse rounded-full bg-primary/70 [animation-delay:-0.15s]" />
            <span className="size-2 animate-pulse rounded-full bg-primary/70" />
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  )
}
