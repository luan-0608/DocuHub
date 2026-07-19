import type { KeyboardEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { messageSchema, type MessageValues } from '../schema'

interface Props {
  onSend: (content: string) => void
  disabled?: boolean
}

export function MessageComposer({ onSend, disabled }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageValues>({ resolver: zodResolver(messageSchema) })

  const submit = handleSubmit((vals) => {
    onSend(vals.content.trim())
    reset()
  })

  // Enter để gửi, Shift+Enter để xuống dòng
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form onSubmit={submit} className="flex items-end gap-2">
      <div className="flex-1">
        <Textarea
          rows={1}
          placeholder="Nhập câu hỏi..."
          onKeyDown={onKeyDown}
          {...register('content')}
        />
        {errors.content && <p className="mt-1 text-xs text-destructive">{errors.content.message}</p>}
      </div>
      <Button type="submit" size="icon" className="shrink-0" disabled={disabled}>
        <Send className="size-4" />
      </Button>
    </form>
  )
}
