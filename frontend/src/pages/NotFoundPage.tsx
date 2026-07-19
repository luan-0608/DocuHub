import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/Logo'
import { NotFoundArt } from '@/components/brand/empty-arts'

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-background px-4 text-center">
      <div className="wc-blob -left-20 top-16 size-80 bg-wash-teal/35" />
      <div className="wc-blob -right-24 bottom-10 size-96 bg-wash-peach/30" />
      <Logo />
      <NotFoundArt className="size-40" />
      <div className="space-y-2">
        <h1 className="font-display text-4xl font-bold text-primary">404</h1>
        <p className="max-w-sm text-sm italic text-muted-foreground">
          Trang bạn tìm không tồn tại hoặc đã bị di chuyển.
        </p>
      </div>
      <Button asChild>
        <Link to="/">Về trang chủ</Link>
      </Button>
    </div>
  )
}
