import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FileText, LogOut, Shield, Sparkles, User } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/Logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/features/auth/store'
import { useChatPanel } from '@/features/chat/panelStore'
import { useCreateSession } from '@/features/chat/hooks'
import { ChatPanel } from '@/features/chat/components/ChatPanel'
import { getDocDrag, hasDocDrag } from '@/features/chat/dragDoc'
import { getApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

const baseNav = [{ to: '/documents', label: 'Tài liệu', icon: FileText }]

// Lấy 2 chữ cái đầu của tên để hiển thị avatar.
function getInitials(name?: string): string {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

// Pill điều hướng dùng chung cho nav desktop + mobile.
const navPill = (isActive: boolean) =>
  cn(
    'flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-500 ease-in-out',
    isActive
      ? 'bg-primary/15 text-primary'
      : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground',
  )

export function AppShell() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const clear = useAuthStore((s) => s.clear)
  const aiOpen = useChatPanel((s) => s.open)
  const togglePanel = useChatPanel((s) => s.togglePanel)
  const setSession = useChatPanel((s) => s.setSession)
  const createSession = useCreateSession()

  // Mục "Quản trị" chỉ hiện với ADMIN.
  const navItems =
    user?.role === 'ADMIN'
      ? [...baseNav, { to: '/admin', label: 'Quản trị', icon: Shield }]
      : baseNav

  const handleLogout = () => {
    clear()
    toast.success('Đã đăng xuất')
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-primary/10 bg-background">
        {/* Dải màu nước mảnh loang ngang — nối tiếp tông trang chủ */}
        <div className="h-1.5 bg-gradient-to-r from-wash-teal/50 via-wash-peach/50 to-wash-rose/50" />
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <Link to="/" title="Về trang chủ">
              <Logo />
            </Link>
            <nav className="hidden items-center gap-1.5 sm:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => navPill(isActive)}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={togglePanel}
                aria-pressed={aiOpen}
                className={navPill(aiOpen)}
              >
                <Sparkles className="size-4" />
                Trợ lý AI
              </button>
            </nav>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <span className="flex size-8 items-center justify-center rounded-full bg-wash-teal/40 text-xs font-bold text-ink">
                  {getInitials(user?.fullName)}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span className="truncate font-display text-primary">{user?.fullName}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {user?.email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <User className="size-4" />
                  Hồ sơ
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="size-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav className="flex items-center gap-1.5 overflow-x-auto border-t border-primary/10 px-4 py-2 sm:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => navPill(isActive)}
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Panel mở thì chừa chỗ bên phải (desktop) để không che nội dung */}
      <main
        className={cn(
          'w-full flex-1 px-4 py-8 transition-[padding] duration-500 ease-in-out',
          aiOpen && 'md:pr-[30rem]',
        )}
      >
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>

      {/* Nút nổi mở Trợ lý AI — luôn trong tầm tay ở mọi trang.
          Là vùng thả: thả tài liệu lên nút → tạo phiên chat và mở panel.
          Không mở panel khi mới rê qua — gỡ nút giữa lúc kéo làm treo thao tác drag. */}
      {!aiOpen && (
        <button
          type="button"
          onClick={togglePanel}
          onDragOver={(e) => {
            if (hasDocDrag(e)) {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'copy'
            }
          }}
          onDrop={(e) => {
            const doc = getDocDrag(e)
            if (!doc) return
            e.preventDefault()
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
          }}
          aria-label="Mở Trợ lý AI"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-bloom-soft transition-all duration-500 ease-in-out hover:shadow-bloom active:scale-[0.98]"
        >
          <Sparkles className="size-4" />
          Trợ lý AI
        </button>
      )}
      <ChatPanel />
    </div>
  )
}
