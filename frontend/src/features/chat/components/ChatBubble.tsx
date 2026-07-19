import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { Bot, FileText, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatMessage, SourceRef } from '@/lib/types'

const chipClass =
  'inline-flex items-center justify-center rounded-md bg-primary/10 px-1.5 text-[0.7rem] font-semibold leading-5 text-primary ring-1 ring-inset ring-primary/20'

// Chuyển [S1] / [4] trong văn xuôi thành link nội bộ #src-N để renderer bắt và vẽ chip.
// Bỏ qua vùng code (```khối``` và `inline`) và link markdown sẵn có kiểu [1](url).
const CITE = /\[S?(\d{1,2})](?!\()/g
function linkifyCitations(md: string): string {
  const parts = md.split(/(```[\s\S]*?```|`[^`]*`)/g)
  return parts
    .map((seg, i) => (i % 2 === 1 ? seg : seg.replace(CITE, (_m, n) => `[S${n}](#src-${n})`)))
    .join('')
}

function CitationChip({ n, source }: { n: number; source?: SourceRef }) {
  return (
    <span className="group/cite relative inline-flex align-super">
      <span className={cn(chipClass, 'cursor-default text-[0.65rem]')}>S{n}</span>
      {source && (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden w-64 -translate-x-1/2 rounded-xl border border-primary/10 bg-popover p-3 text-left shadow-lg group-hover/cite:block">
          <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
            <FileText className="size-3 shrink-0" />
            <span className="truncate">{source.documentTitle}</span>
            <span className="shrink-0 font-normal text-muted-foreground">
              · đoạn {source.chunkIndex}
            </span>
          </span>
          <span className="mt-1 line-clamp-4 text-xs italic text-muted-foreground">
            “{source.snippet}”
          </span>
        </span>
      )}
    </span>
  )
}

function SourceList({ sources }: { sources: SourceRef[] }) {
  return (
    <details className="mt-1 border-t border-primary/10 pt-2">
      <summary className="cursor-pointer select-none text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
        Nguồn trích dẫn ({sources.length})
      </summary>
      <ul className="mt-2 space-y-2.5">
        {sources.map((s) => (
          <li key={s.label} className="flex gap-2 text-xs">
            <span className={cn(chipClass, 'mt-0.5 shrink-0')}>{s.label}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1 font-medium text-foreground">
                <FileText className="size-3 shrink-0" />
                <span className="truncate">{s.documentTitle}</span>
                <span className="shrink-0 text-muted-foreground">· đoạn {s.chunkIndex}</span>
              </div>
              <p className="mt-0.5 line-clamp-2 italic text-muted-foreground">“{s.snippet}”</p>
            </div>
          </li>
        ))}
      </ul>
    </details>
  )
}

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'USER'
  const sources = message.sources ?? []
  const bySource = useMemo(
    () => new Map(sources.map((s) => [Number(s.label.replace(/^S/, '')), s])),
    [sources],
  )
  const body = useMemo(() => linkifyCitations(message.content), [message.content])

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-wash-peach/40 text-ink',
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>
      <div
        className={cn(
          'max-w-[80%] px-4 py-2.5 text-sm shadow-wash',
          isUser
            ? 'rounded-2xl rounded-tr-md bg-primary text-primary-foreground'
            : 'rounded-2xl rounded-tl-md border border-primary/10 bg-background',
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="space-y-2 break-words leading-relaxed [&_a]:text-primary [&_a]:underline [&_code]:rounded-md [&_code]:bg-primary/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_li]:ml-4 [&_li]:list-disc [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-muted [&_pre]:p-3 [&_strong]:font-bold [&_strong]:text-primary">
            <ReactMarkdown
              components={{
                a({ href, children }) {
                  const m = /^#src-(\d+)$/.exec(href ?? '')
                  if (!m) {
                    return (
                      <a href={href} target="_blank" rel="noreferrer">
                        {children}
                      </a>
                    )
                  }
                  const n = Number(m[1])
                  return <CitationChip n={n} source={bySource.get(n)} />
                },
              }}
            >
              {body}
            </ReactMarkdown>
            {sources.length > 0 && <SourceList sources={sources} />}
          </div>
        )}
      </div>
    </div>
  )
}
