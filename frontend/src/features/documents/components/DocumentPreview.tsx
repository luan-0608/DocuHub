import { useEffect, useState } from 'react'
import mammoth from 'mammoth'
import { FileQuestion, Loader2 } from 'lucide-react'
import { getDocumentBlob } from '../api'
import type { DocumentItem } from '@/lib/types'

type Kind = 'pdf' | 'image' | 'text' | 'docx' | 'unsupported'

// Backend trả octet-stream → phải gán đúng MIME để trình duyệt render thay vì tải về
const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
}

function kindOf(fileType: string): Kind {
  const t = fileType.toLowerCase()
  if (t === 'pdf') return 'pdf'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(t)) return 'image'
  if (['txt', 'md', 'csv', 'json'].includes(t)) return 'text'
  // .docx chuyển sang HTML bằng mammoth; .doc cũ (định dạng binary) mammoth không đọc được
  if (t === 'docx') return 'docx'
  return 'unsupported'
}

export function DocumentPreview({ doc }: { doc: DocumentItem }) {
  const kind = kindOf(doc.fileType)
  const [url, setUrl] = useState<string | null>(null)
  const [text, setText] = useState<string | null>(null)
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (kind === 'unsupported') return
    let objectUrl: string | null = null
    let active = true
    getDocumentBlob(doc.id)
      .then(async (blob) => {
        if (!active) return
        if (kind === 'text') {
          setText(await blob.text())
        } else if (kind === 'docx') {
          const result = await mammoth.convertToHtml({ arrayBuffer: await blob.arrayBuffer() })
          if (active) setHtml(result.value)
        } else {
          const typed = new Blob([blob], { type: MIME[doc.fileType.toLowerCase()] ?? blob.type })
          objectUrl = URL.createObjectURL(typed)
          setUrl(objectUrl)
        }
      })
      .catch(() => active && setError(true))
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [doc.id, kind])

  if (kind === 'unsupported') {
    return (
      <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-primary/25 bg-card/60 py-12 text-center text-muted-foreground">
        <FileQuestion className="size-10 text-primary/60" />
        <p className="text-sm italic">
          Không hỗ trợ xem trước định dạng .{doc.fileType}. Vui lòng tải xuống để mở.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <p className="rounded-3xl border border-dashed border-destructive/30 py-12 text-center text-sm italic text-destructive">
        Không tải được nội dung xem trước.
      </p>
    )
  }

  if (!url && text === null && html === null) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm italic text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Đang tải bản xem trước...
      </div>
    )
  }

  if (kind === 'docx') {
    return (
      <div
        className="max-h-[70vh] overflow-auto rounded-2xl border border-primary/15 bg-card p-6 text-sm leading-relaxed [&_a]:text-primary [&_a]:underline [&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_img]:max-w-full [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_table]:w-full [&_td]:border [&_td]:border-primary/15 [&_td]:p-2 [&_th]:border [&_th]:border-primary/15 [&_th]:p-2 [&_ul]:list-disc"
        dangerouslySetInnerHTML={{ __html: html! }}
      />
    )
  }

  if (kind === 'text') {
    return (
      <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-2xl border border-primary/15 bg-muted/60 p-4 font-mono text-sm">
        {text}
      </pre>
    )
  }

  if (kind === 'image') {
    return (
      <img
        src={url!}
        alt={doc.title}
        className="max-h-[70vh] w-full rounded-2xl border border-primary/15 object-contain"
      />
    )
  }

  return (
    <iframe
      src={url!}
      title={doc.title}
      className="h-[70vh] w-full rounded-2xl border border-primary/15"
    />
  )
}
