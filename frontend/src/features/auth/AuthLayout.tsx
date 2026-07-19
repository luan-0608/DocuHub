import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo, LogoMark } from '@/components/brand/Logo'
import { ChatWelcomeArt } from '@/components/brand/empty-arts'
import { DocCoverArt } from '@/features/documents/components/DocCover'

interface AuthLayoutProps {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

// Layout trang xác thực: desktop chia 2 cột — cột trái là mảng màu loang
// (đồng bộ với hero trang chủ) chứa logo + minh họa + tagline, cột phải là form.
// Mobile gọn lại còn 1 cột.
export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      {/* Cột trái: chỉ hiện trên desktop */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-primary/10 p-10 lg:flex">
        <div className="wc-blob blob-drift -left-24 -top-20 size-96 bg-wash-teal/40" />
        <div className="wc-blob -right-24 top-1/3 size-80 bg-wash-peach/35" />
        <div className="wc-blob blob-drift -bottom-28 left-1/4 size-96 bg-wash-rose/30 [animation-delay:-6s]" />

        <Link to="/" className="relative">
          <Logo />
        </Link>

        <div className="relative mx-auto w-full max-w-md">
          <div className="relative flex items-center justify-center py-6">
            <div className="absolute left-4 top-2 -rotate-6 rounded-2xl border border-primary/15 bg-card p-3 shadow-wash">
              <DocCoverArt kind="pdf" className="size-14" />
            </div>
            <div className="absolute bottom-0 right-4 rotate-6 rounded-2xl border border-primary/15 bg-card p-3 shadow-wash">
              <DocCoverArt kind="word" className="size-14" />
            </div>
            <ChatWelcomeArt className="relative size-56" />
          </div>
          <p className="mt-6 text-center font-display text-2xl italic leading-relaxed text-ink">
            “Một nơi lưu tài liệu học tập. Một trợ lý AI hiểu chúng.”
          </p>
        </div>

        <p className="relative text-xs italic text-muted-foreground">DocuHub</p>
      </div>

      {/* Cột phải: form */}
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <Link
              to="/"
              className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 lg:hidden"
            >
              <LogoMark className="size-10" />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-primary">{title}</h1>
              {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-primary/15 bg-card p-6 shadow-wash-lg">{children}</div>

          {footer && <div className="text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
