import { useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown, LayoutGrid, List, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useDocuments, useDocumentStats } from '@/features/documents/hooks'
import { DocumentCard, DocumentRow } from '@/features/documents/components/DocumentCard'
import { UploadDialog } from '@/features/documents/components/UploadDialog'
import { useDebounce } from '@/lib/useDebounce'
import { useCountUp } from '@/lib/useCountUp'
import { EmptyBoxArt, NoResultArt } from '@/components/brand/empty-arts'
import { formatFileSize } from '@/lib/format'
import { subjectPalette } from '@/lib/subjectColor'
import { cn } from '@/lib/utils'
import type { DocumentStats, DocumentSummary } from '@/lib/types'

const PAGE_SIZE = 12
const MB = 1024 * 1024

const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Mới nhất' },
  { value: 'createdAt,asc', label: 'Cũ nhất' },
  { value: 'title,asc', label: 'Tên A-Z' },
]

const SIZE_OPTIONS = [
  { value: 'all', label: 'Mọi kích thước', min: undefined, max: undefined },
  { value: 'lt1', label: '< 1 MB', min: undefined, max: MB },
  { value: '1to10', label: '1 - 10 MB', min: MB, max: 10 * MB },
  { value: 'gt10', label: '> 10 MB', min: 10 * MB, max: undefined },
]

// Giá trị gửi thẳng cho backend (?type=), backend tự mở rộng word → doc+docx...
const TYPE_OPTIONS = [
  { value: 'all', label: 'Mọi định dạng' },
  { value: 'pdf', label: 'PDF' },
  { value: 'word', label: 'Word' },
  { value: 'ppt', label: 'PowerPoint' },
  { value: 'txt', label: 'TXT' },
]

// Giá trị đặc biệt backend hiểu là "lọc tài liệu chưa gắn môn học".
const UNTAGGED = '__untagged__'

type ViewMode = 'grid' | 'list'
const VIEW_KEY = 'docuhub.documents.view'

export default function DocumentsPage() {
  const [q, setQ] = useState('')
  const [subject, setSubject] = useState<string | null>(null)
  const [sort, setSort] = useState(SORT_OPTIONS[0].value)
  const [sizeFilter, setSizeFilter] = useState(SIZE_OPTIONS[0].value)
  const [typeFilter, setTypeFilter] = useState(TYPE_OPTIONS[0].value)
  const [page, setPage] = useState(0)
  const [view, setView] = useState<ViewMode>(
    () => (localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid'),
  )
  const debouncedQ = useDebounce(q)

  const changeView = (v: ViewMode) => {
    setView(v)
    localStorage.setItem(VIEW_KEY, v)
  }

  const sizeOpt = SIZE_OPTIONS.find((o) => o.value === sizeFilter) ?? SIZE_OPTIONS[0]

  const { data, isLoading, isError } = useDocuments({
    q: debouncedQ || undefined,
    subject: subject ?? undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    minSize: sizeOpt.min,
    maxSize: sizeOpt.max,
    page,
    size: PAGE_SIZE,
    sort,
  })
  const stats = useDocumentStats().data

  const docs = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const hasFilter = Boolean(q || subject || typeFilter !== 'all' || sizeOpt.min || sizeOpt.max)

  const selectSubject = (s: string | null) => {
    setSubject(s)
    setPage(0)
  }

  // Đưa mọi bộ lọc về mặc định — dùng ở trạng thái "không tìm thấy".
  const clearFilters = () => {
    setQ('')
    setSubject(null)
    setSizeFilter(SIZE_OPTIONS[0].value)
    setTypeFilter(TYPE_OPTIONS[0].value)
    setPage(0)
  }

  return (
    <div className="space-y-8">
      {/* Đầu trang: tiêu đề lớn + thống kê dạng chữ; nút Tải lên là điểm nhấn duy nhất */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-primary">Tài liệu</h1>
          <p className="mt-2 text-sm italic text-muted-foreground">
            {stats ? <StatsLine stats={stats} /> : 'Quản lý kho tài liệu của bạn'}
          </p>
        </div>
        {/* Đang lọc môn nào thì tải lên điền sẵn môn đó (trừ "Chưa phân loại") */}
        <UploadDialog defaultSubject={subject !== UNTAGGED ? subject : null} />
      </div>

      {/* Hàng công cụ: thấp, yên tĩnh. Mobile: tìm kiếm + nút xem, rồi lưới 2 cột cho
          3 select (sắp xếp chiếm cả hàng); từ sm select dàn ngang; lg trải lại thành
          1 hàng duy nhất qua lg:contents + order. */}
      <div className="flex flex-col gap-2 lg:flex-row">
        <div className="flex gap-2 lg:contents">
          <div className="relative min-w-0 flex-1 lg:order-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-10 rounded-full pl-10"
              placeholder="Tìm theo tiêu đề, mô tả..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setPage(0)
              }}
            />
          </div>
          <ViewToggle view={view} onChange={changeView} className="lg:order-5" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex lg:contents">
          <ToolbarSelect
            className="lg:order-2"
            value={typeFilter}
            onChange={(v) => {
              setTypeFilter(v)
              setPage(0)
            }}
            options={TYPE_OPTIONS}
            ariaLabel="Lọc theo định dạng file"
          />
          <ToolbarSelect
            className="lg:order-3"
            value={sizeFilter}
            onChange={(v) => {
              setSizeFilter(v)
              setPage(0)
            }}
            options={SIZE_OPTIONS}
            ariaLabel="Lọc theo kích thước"
          />
          <ToolbarSelect
            className="col-span-2 sm:col-span-1 lg:order-4"
            value={sort}
            onChange={(v) => {
              setSort(v)
              setPage(0)
            }}
            options={SORT_OPTIONS}
            ariaLabel="Sắp xếp"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[210px_1fr]">
        <SubjectNav
          subjects={stats?.subjects ?? []}
          total={stats?.totalDocuments ?? 0}
          selected={subject}
          onSelect={selectSubject}
        />

        <div className="min-w-0 space-y-6">
          {isLoading ? (
            view === 'grid' ? (
              <GridSkeleton />
            ) : (
              <ListSkeleton />
            )
          ) : isError ? (
            <EmptyState title="Không tải được danh sách" desc="Vui lòng thử lại sau." art="none" />
          ) : docs.length === 0 ? (
            <EmptyState
              title={hasFilter ? 'Không tìm thấy tài liệu phù hợp' : 'Chưa có tài liệu'}
              desc={hasFilter ? 'Thử từ khóa hoặc bộ lọc khác.' : 'Tải lên tài liệu đầu tiên để bắt đầu.'}
              art={hasFilter ? 'search' : 'box'}
              action={
                hasFilter ? (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Xóa bộ lọc
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              {view === 'grid' ? <DocGrid docs={docs} /> : <DocList docs={docs} />}
              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Dòng thống kê với số đếm tăng dần khi vừa tải xong
function StatsLine({ stats }: { stats: DocumentStats }) {
  const docs = useCountUp(stats.totalDocuments)
  const subjects = useCountUp(stats.subjects.filter((s) => s.name).length)
  const size = useCountUp(stats.totalSize)
  return (
    <>
      {docs} tài liệu · {subjects} môn học · {formatFileSize(size)}
    </>
  )
}

// Select dạng viên thuốc, viền mảnh — công cụ phụ không tranh chú ý.
function ToolbarSelect({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  ariaLabel: string
  className?: string
}) {
  return (
    <div className={cn('relative min-w-0 flex-1 lg:w-40 lg:flex-none', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full cursor-pointer appearance-none rounded-full border border-primary/20 bg-card px-4 pr-9 text-sm text-muted-foreground transition-all duration-500 ease-in-out hover:border-primary/40 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-label={ariaLabel}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

// Sidebar không hộp, không bóng — chỉ mục đang chọn được nhấn màu loang.
function SubjectNav({
  subjects,
  total,
  selected,
  onSelect,
}: {
  subjects: { name: string | null; count: number }[]
  total: number
  selected: string | null
  onSelect: (s: string | null) => void
}) {
  const named = subjects.filter((s) => s.name)
  const untaggedCount = subjects.find((s) => !s.name)?.count ?? 0

  const item = (
    key: string,
    label: string,
    count: number,
    value: string | null,
    dot?: string,
  ) => {
    const active = selected === value
    return (
      <button
        key={key}
        type="button"
        onClick={() => onSelect(value)}
        className={cn(
          'flex shrink-0 items-center justify-between gap-2 rounded-full px-3.5 py-1.5 text-left text-sm transition-all duration-500 ease-in-out lg:w-full',
          active
            ? 'bg-primary/15 font-semibold text-primary'
            : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground',
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className={cn('size-2.5 shrink-0 rounded-full', dot ?? 'bg-wash-teal')} />
          <span className="truncate">{label}</span>
        </span>
        <span className="shrink-0 text-xs opacity-60">{count}</span>
      </button>
    )
  }

  return (
    // Desktop: dính theo màn hình khi cuộn danh sách dài — bộ lọc luôn trong tầm tay
    <nav
      aria-label="Lọc theo môn học"
      className="flex gap-1 overflow-x-auto pb-1 lg:sticky lg:top-24 lg:h-fit lg:max-h-[calc(100svh-7rem)] lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto"
    >
      <p className="hidden px-3.5 pb-2 font-display text-sm font-bold text-primary lg:block">
        Môn học
      </p>
      {item('all', 'Tất cả', total, null, 'bg-primary/60')}
      {named.map((s) => item(s.name!, s.name!, s.count, s.name, subjectPalette(s.name!).dot))}
      {untaggedCount > 0 && item(UNTAGGED, 'Chưa phân loại', untaggedCount, UNTAGGED, 'bg-muted-foreground/40')}
    </nav>
  )
}

// Phân trang dạng số: « 1 … 4 [5] 6 … 20 »
function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  const pages: (number | '...')[] = []
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
      <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onChange(page - 1)}>
        «
      </Button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={cn(
              'flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-500 ease-in-out active:scale-[0.98]',
              p === page
                ? 'bg-primary text-primary-foreground shadow-bloom-soft'
                : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground',
            )}
            aria-current={p === page ? 'page' : undefined}
          >
            {p + 1}
          </button>
        ),
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        »
      </Button>
    </div>
  )
}

// Nút chuyển Grid ⇄ List, cùng ngôn ngữ "yên tĩnh" với các select bên cạnh.
function ViewToggle({
  view,
  onChange,
  className,
}: {
  view: ViewMode
  onChange: (v: ViewMode) => void
  className?: string
}) {
  const btn = (v: ViewMode, Icon: typeof LayoutGrid, label: string) => (
    <button
      key={v}
      type="button"
      onClick={() => onChange(v)}
      aria-label={label}
      aria-pressed={view === v}
      className={cn(
        'flex h-8 w-9 items-center justify-center rounded-full transition-all duration-500 ease-in-out',
        view === v ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="size-4" />
    </button>
  )
  return (
    <div
      className={cn(
        'flex h-10 shrink-0 items-center gap-0.5 rounded-full border border-primary/20 bg-card px-1',
        className,
      )}
    >
      {btn('grid', LayoutGrid, 'Xem dạng lưới')}
      {btn('list', List, 'Xem dạng danh sách')}
    </div>
  )
}

/** Lưới đều: mọi card cùng kích thước, thẳng hàng — thêm tài liệu không vỡ bố cục. */
function DocGrid({ docs }: { docs: DocumentSummary[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {docs.map((doc, i) => (
        <div key={doc.id} className="card-enter h-full" style={{ animationDelay: `${Math.min(i, 9) * 60}ms` }}>
          <DocumentCard doc={doc} />
        </div>
      ))}
    </div>
  )
}

/** Danh sách hàng ngang: nén thông tin để quét nhanh khi nhiều tài liệu. */
function DocList({ docs }: { docs: DocumentSummary[] }) {
  return (
    <div className="space-y-2">
      {docs.map((doc, i) => (
        <div key={doc.id} className="card-enter" style={{ animationDelay: `${Math.min(i, 9) * 40}ms` }}>
          <DocumentRow doc={doc} />
        </div>
      ))}
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-64" />
      ))}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }, (_, i) => (
        <Skeleton key={i} className="h-[4.25rem] rounded-xl" />
      ))}
    </div>
  )
}

function EmptyState({
  title,
  desc,
  art,
  action,
}: {
  title: string
  desc: string
  art: 'box' | 'search' | 'none'
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-primary/25 bg-card/60 py-16 text-center">
      {art === 'box' && <EmptyBoxArt className="size-28" />}
      {art === 'search' && <NoResultArt className="size-28" />}
      <div className="space-y-1">
        <p className="font-display text-lg font-bold text-primary">{title}</p>
        <p className="text-sm italic text-muted-foreground">{desc}</p>
      </div>
      {action}
    </div>
  )
}
