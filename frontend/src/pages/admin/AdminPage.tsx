import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import { useAdminUsers, useAdminDocuments } from '@/features/admin/hooks'
import { DeleteUserDialog } from '@/features/admin/components/DeleteUserDialog'
import { DeleteDocumentDialog } from '@/features/admin/components/DeleteDocumentDialog'
import { useAuthStore } from '@/features/auth/store'
import type { DocumentSummary, User } from '@/lib/types'

const PAGE_SIZE = 10
type Tab = 'users' | 'documents'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('users')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold tracking-tight text-primary">
          <Shield className="size-6" />
          Quản trị
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý người dùng và tài liệu toàn hệ thống.
        </p>
      </div>

      <div className="inline-flex gap-1.5">
        <TabButton active={tab === 'users'} onClick={() => setTab('users')}>
          Người dùng
        </TabButton>
        <TabButton active={tab === 'documents'} onClick={() => setTab('documents')}>
          Tài liệu
        </TabButton>
      </div>

      {tab === 'users' ? <UsersTab /> : <DocumentsTab />}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-1.5 font-display text-sm font-bold transition-all duration-500 ease-in-out active:scale-[0.98]',
        active
          ? 'bg-primary text-primary-foreground shadow-bloom-soft'
          : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function UsersTab() {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useAdminUsers({ page, size: PAGE_SIZE })
  const currentUser = useAuthStore((s) => s.user)
  const [target, setTarget] = useState<User | null>(null)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-primary/15 bg-card shadow-wash">
        <table className="w-full text-sm">
          <thead className="border-b border-primary/15 bg-muted/60 text-left text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-display font-bold">Họ tên</th>
              <th className="px-5 py-3 font-display font-bold">Email</th>
              <th className="px-5 py-3 font-display font-bold">Vai trò</th>
              <th className="px-5 py-3 font-display font-bold">Ngày tạo</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && <SkeletonRows cols={5} />}
            {data?.content.map((u) => (
              <tr
                key={u.id}
                className="border-b border-primary/10 transition-colors duration-500 ease-in-out last:border-0 hover:bg-primary/5"
              >
                <td className="px-5 py-3 font-medium">{u.fullName}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{u.email}</td>
                <td className="px-5 py-3">
                  <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>{u.role}</Badge>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
                <td className="px-5 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={u.id === currentUser?.id}
                    onClick={() => setTarget(u)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && data?.content.length === 0 && (
          <p className="px-5 py-8 text-center text-sm italic text-muted-foreground">Không có người dùng.</p>
        )}
      </div>

      <Pagination page={page} totalPages={data?.totalPages ?? 0} onChange={setPage} />

      {target && (
        <DeleteUserDialog
          id={target.id}
          name={target.fullName}
          open={!!target}
          onOpenChange={(o) => !o && setTarget(null)}
        />
      )}
    </div>
  )
}

function DocumentsTab() {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useAdminDocuments({ page, size: PAGE_SIZE })
  const [target, setTarget] = useState<DocumentSummary | null>(null)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-primary/15 bg-card shadow-wash">
        <table className="w-full text-sm">
          <thead className="border-b border-primary/15 bg-muted/60 text-left text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-display font-bold">Tiêu đề</th>
              <th className="px-5 py-3 font-display font-bold">Môn học</th>
              <th className="px-5 py-3 font-display font-bold">Định dạng</th>
              <th className="px-5 py-3 font-display font-bold">Trạng thái</th>
              <th className="px-5 py-3 font-display font-bold">Ngày tạo</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && <SkeletonRows cols={6} />}
            {data?.content.map((d) => (
              <tr
                key={d.id}
                className="border-b border-primary/10 transition-colors duration-500 ease-in-out last:border-0 hover:bg-primary/5"
              >
                <td className="px-5 py-3 font-medium">
                  <Link to={`/documents/${d.id}`} className="hover:text-primary hover:underline">
                    {d.title}
                  </Link>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{d.subject ?? '-'}</td>
                <td className="px-5 py-3 text-xs uppercase text-muted-foreground">{d.fileType}</td>
                <td className="px-5 py-3">
                  <Badge variant={d.indexed ? 'success' : 'secondary'}>
                    {d.indexed ? 'Đã lập chỉ mục' : 'Chưa'}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{formatDate(d.createdAt)}</td>
                <td className="px-5 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Xóa tài liệu"
                    onClick={() => setTarget(d)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && data?.content.length === 0 && (
          <p className="px-5 py-8 text-center text-sm italic text-muted-foreground">Không có tài liệu.</p>
        )}
      </div>

      <Pagination page={page} totalPages={data?.totalPages ?? 0} onChange={setPage} />

      {target && (
        <DeleteDocumentDialog
          id={target.id}
          title={target.title}
          open={!!target}
          onOpenChange={(o) => !o && setTarget(null)}
        />
      )}
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-4">
      <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => onChange(page - 1)}>
        Trước
      </Button>
      <span className="text-sm font-semibold text-muted-foreground">
        Trang {page + 1} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        Sau
      </Button>
    </div>
  )
}

function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, r) => (
        <tr key={r} className="border-b border-primary/10 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-5 py-3">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
