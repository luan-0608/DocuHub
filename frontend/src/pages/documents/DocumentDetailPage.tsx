import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Download, Eye, EyeOff, Loader2, NotebookPen, Pencil, Sparkles, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDocument, useDownloadDocument, useSummarizeDocument } from '@/features/documents/hooks'
import { useCreateSession } from '@/features/chat/hooks'
import { useChatPanel } from '@/features/chat/panelStore'
import { EditDocumentDialog } from '@/features/documents/components/EditDocumentDialog'
import { DeleteDocumentDialog } from '@/features/documents/components/DeleteDocumentDialog'
import { DocumentPreview } from '@/features/documents/components/DocumentPreview'
import { formatDate, formatFileSize } from '@/lib/format'
import { subjectPalette } from '@/lib/subjectColor'
import { getApiError } from '@/lib/api'

export default function DocumentDetailPage() {
  const { id } = useParams()
  const docId = Number(id)
  const { data: doc, isLoading, isError } = useDocument(docId)
  const download = useDownloadDocument()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const createSession = useCreateSession()
  const setSession = useChatPanel((s) => s.setSession)

  // Tạo phiên chat gắn riêng tài liệu này rồi mở panel Trợ lý AI
  const handleAskAi = () => {
    if (!doc) return
    createSession.mutate(
      { title: doc.title, documentIds: [doc.id] },
      {
        onSuccess: (session) => setSession(session.id),
        onError: (err) => toast.error(getApiError(err)),
      },
    )
  }

  const handleDownload = () => {
    if (!doc) return
    download.mutate(
      { id: doc.id, name: `${doc.title}.${doc.fileType}` },
      { onError: (err) => toast.error(getApiError(err)) },
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (isError || !doc) {
    return (
      <div className="space-y-4">
        <BackLink />
        <p className="text-muted-foreground">Không tìm thấy tài liệu.</p>
      </div>
    )
  }

  const palette = subjectPalette(doc.subject)

  return (
    <div className="space-y-6">
      <BackLink />

      <div className="overflow-hidden rounded-3xl border border-primary/15 bg-card shadow-wash-md">
        <div className={`flex flex-col gap-3 border-b border-primary/10 p-6 ${palette.bg}`}>
          <div className="flex flex-wrap items-center gap-2">
            {doc.subject && (
              <span className="rounded-full bg-card/80 px-2.5 py-1 text-xs font-semibold text-ink">
                {doc.subject}
              </span>
            )}
            <span className="rounded-full bg-card/80 px-2.5 py-1 text-xs font-bold uppercase text-ink">
              {doc.fileType}
            </span>
            {doc.indexed ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                <Sparkles className="size-3" />
                Đã lập chỉ mục
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-card/80 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                <span className="size-1.5 rounded-full bg-wash-sand" />
                Chờ xử lý
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{doc.title}</h1>
        </div>

        <div className="space-y-6 p-6">
          {doc.description && (
            <div>
              <h3 className="mb-1 text-sm font-bold text-primary">Mô tả</h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{doc.description}</p>
            </div>
          )}

          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <Stat label="Dung lượng" value={formatFileSize(doc.fileSize)} />
            <Stat label="Định dạng" value={doc.fileType.toUpperCase()} />
            <Stat label="Ngày tải lên" value={formatDate(doc.createdAt)} />
          </dl>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAskAi} disabled={createSession.isPending || !doc.indexed}
              title={doc.indexed ? undefined : 'Tài liệu chưa lập chỉ mục xong'}>
              {createSession.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Hỏi AI về tài liệu này
            </Button>
            <Button variant="secondary" onClick={() => setShowPreview((v) => !v)}>
              {showPreview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {showPreview ? 'Ẩn xem trước' : 'Xem trước'}
            </Button>
            <Button onClick={handleDownload} disabled={download.isPending}>
              {download.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Tải xuống
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              Sửa
            </Button>
            <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-4" />
              Xóa
            </Button>
          </div>

          {showPreview && <DocumentPreview doc={doc} />}

          <SummarySection docId={doc.id} summary={doc.summary} indexed={doc.indexed} />
        </div>
      </div>

      <EditDocumentDialog doc={doc} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteDocumentDialog
        id={doc.id}
        title={doc.title}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/60 px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-display font-bold text-primary">{value}</dd>
    </div>
  )
}

// Tóm tắt AI: sinh 1 lần rồi lưu ở backend, các lần vào sau hiển thị ngay.
function SummarySection({
  docId,
  summary,
  indexed,
}: {
  docId: number
  summary?: string | null
  indexed: boolean
}) {
  const summarize = useSummarizeDocument(docId)
  // Hiện kết quả vừa sinh ngay cả khi query chưa refetch xong
  const text = summarize.data ?? summary

  const run = () =>
    summarize.mutate(undefined, { onError: (err) => toast.error(getApiError(err)) })

  return (
    <div className="rounded-3xl border border-primary/15 bg-wash-teal/15 p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="inline-flex items-center gap-1.5 font-display text-sm font-bold text-primary">
          <NotebookPen className="size-4" />
          Tóm tắt AI
        </h3>
        <Button
          variant={text ? 'ghost' : 'default'}
          size="sm"
          onClick={run}
          disabled={summarize.isPending || !indexed}
          title={indexed ? undefined : 'Tài liệu chưa lập chỉ mục xong'}
        >
          {summarize.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {text ? 'Tóm tắt lại' : 'Tạo tóm tắt'}
        </Button>
      </div>
      {summarize.isPending ? (
        <p className="text-sm italic text-muted-foreground">
          Đang đọc và tóm tắt tài liệu... Tài liệu dài có thể mất khoảng một phút.
        </p>
      ) : text ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{text}</p>
      ) : (
        <p className="text-sm italic text-muted-foreground">
          {indexed
            ? 'Chưa có tóm tắt. Bấm "Tạo tóm tắt" để AI đọc toàn bộ tài liệu và rút ra các ý chính.'
            : 'Tài liệu chưa lập chỉ mục xong — đợi vài phút rồi quay lại để tạo tóm tắt.'}
        </p>
      )}
    </div>
  )
}

function BackLink() {
  return (
    <Link
      to="/documents"
      className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors duration-500 ease-in-out hover:text-primary"
    >
      <ArrowLeft className="size-4" />
      Tất cả tài liệu
    </Link>
  )
}
