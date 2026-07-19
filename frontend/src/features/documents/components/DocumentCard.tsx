import { Link } from 'react-router-dom'
import { formatDate, formatFileSize } from '@/lib/format'
import { subjectPalette } from '@/lib/subjectColor'
import { useDocDrag } from '@/features/chat/dragDoc'
import { cn } from '@/lib/utils'
import type { DocumentSummary } from '@/lib/types'
import { COVER_BG, DocCoverArt, coverKind } from './DocCover'

// Màu loang nhẹ theo loại file để quét mắt nhanh trong lưới.
const FILE_TYPE_BG: Record<string, string> = {
  pdf: 'bg-wash-rose/25',
  doc: 'bg-primary/15',
  docx: 'bg-primary/15',
  ppt: 'bg-wash-peach/30',
  pptx: 'bg-wash-peach/30',
  txt: 'bg-wash-teal/30',
}

// Card đồng nhất: mọi card cùng cấu trúc, cùng chiều cao — lưới luôn thẳng hàng.
export function DocumentCard({ doc }: { doc: DocumentSummary }) {
  const palette = subjectPalette(doc.subject)
  const typeBg = FILE_TYPE_BG[doc.fileType?.toLowerCase()] ?? 'bg-muted'
  const kind = coverKind(doc.fileType)
  const dragProps = useDocDrag({ id: doc.id, title: doc.title })

  return (
    <Link
      to={`/documents/${doc.id}`}
      className="block h-full select-none"
      {...dragProps}
      title="Kéo thả vào panel Trợ lý AI để hỏi về tài liệu này"
    >
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-primary/15 bg-card shadow-wash transition-all duration-500 ease-in-out hover:border-primary/30 hover:shadow-wash-md">
        <div
          className={cn(
            'relative flex h-28 items-center justify-center border-b border-primary/10',
            COVER_BG[kind],
          )}
        >
          <DocCoverArt kind={kind} className="tilt-on-hover size-20" />
          <span
            className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase text-ink ${typeBg}`}
          >
            {doc.fileType}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold leading-snug text-primary line-clamp-1" title={doc.title}>
              {doc.title}
            </h3>
            {/* Giữ chỗ 2 dòng kể cả khi trống để các hàng card đều nhau */}
            <p className="mt-1.5 min-h-10 text-sm text-muted-foreground line-clamp-2">
              {doc.description ?? ''}
            </p>
          </div>

          <div className="mt-auto space-y-2.5">
            <p className="text-xs text-muted-foreground">
              {formatDate(doc.createdAt)}
              {doc.fileSize != null && <> · {formatFileSize(doc.fileSize)}</>}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {doc.subject && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${palette.bg} ${palette.text}`}>
                  {doc.subject}
                </span>
              )}
              <IndexedDot indexed={doc.indexed} />
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

// Chế độ danh sách: một hàng ngang gọn cho lúc cần quét nhanh nhiều tài liệu.
export function DocumentRow({ doc }: { doc: DocumentSummary }) {
  const palette = subjectPalette(doc.subject)
  const kind = coverKind(doc.fileType)
  const typeBg = FILE_TYPE_BG[doc.fileType?.toLowerCase()] ?? 'bg-muted'
  const dragProps = useDocDrag({ id: doc.id, title: doc.title })

  return (
    <Link
      to={`/documents/${doc.id}`}
      className="block select-none"
      {...dragProps}
      title="Kéo thả vào panel Trợ lý AI để hỏi về tài liệu này"
    >
      <article className="group flex items-center gap-4 rounded-xl border border-primary/15 bg-card px-4 py-3 shadow-wash transition-all duration-500 ease-in-out hover:border-primary/30 hover:shadow-wash-md">
        <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', COVER_BG[kind])}>
          <DocCoverArt kind={kind} className="size-8" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-sm font-bold text-primary" title={doc.title}>
            {doc.title}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            {formatDate(doc.createdAt)}
            {doc.fileSize != null && <> · {formatFileSize(doc.fileSize)}</>}
          </p>
        </div>
        {doc.subject && (
          <span className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline ${palette.bg} ${palette.text}`}>
            {doc.subject}
          </span>
        )}
        <span className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase text-ink sm:inline ${typeBg}`}>
          {doc.fileType}
        </span>
        <IndexedDot indexed={doc.indexed} compact />
      </article>
    </Link>
  )
}

function IndexedDot({ indexed, compact }: { indexed: boolean; compact?: boolean }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground"
      title={indexed ? 'Đã lập chỉ mục, sẵn sàng hỏi AI' : 'Đang chờ xử lý'}
    >
      <span className={cn('size-2 rounded-full', indexed ? 'bg-success' : 'bg-wash-sand')} />
      {!compact && (indexed ? 'Sẵn sàng' : 'Chờ xử lý')}
    </span>
  )
}
