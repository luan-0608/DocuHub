import { FileText, Layers } from 'lucide-react'

// count = 0 nghĩa phiên hỏi trên toàn bộ tài liệu của user
export function DocCountBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-wash-teal/30 px-2 py-0.5 text-[11px] font-semibold text-ink">
      {count === 0 ? <Layers className="size-3" /> : <FileText className="size-3" />}
      {count === 0 ? 'Tất cả' : count}
    </span>
  )
}
