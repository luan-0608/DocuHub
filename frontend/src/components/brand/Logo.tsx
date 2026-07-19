import { cn } from '@/lib/utils'

// Logo DocuHub: tập tài liệu góc gập + bong bóng chat, vẽ theo phong cách
// mực + màu nước: nét mảnh xanh ghi, mảng màu loang mềm phía sau.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <defs>
        <filter id="wc-logo-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      {/* mảng màu loang phía sau */}
      <ellipse cx="25" cy="26" rx="18" ry="17" fill="#85cdca" opacity=".35" filter="url(#wc-logo-blur)" />
      {/* tờ giấy chính với góc gập, bo mềm */}
      <path
        d="M14 8h13l7 7v24a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3Z"
        fill="#fffdf9"
        stroke="#4a6fa5"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M27 8v7h7" fill="#85cdca" fillOpacity=".5" stroke="#4a6fa5" strokeWidth="2" strokeLinejoin="round" />
      {/* dòng chữ giả */}
      <path d="M16 20h10M16 25h12M16 30h8" stroke="#4a6fa5" strokeWidth="2" strokeLinecap="round" opacity=".55" />
      {/* bong bóng chat màu hồng đá đè lên góc */}
      <path
        d="M27 29h10a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-3l-4 4v-4h-3a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3Z"
        fill="#c38d94"
        fillOpacity=".85"
        stroke="#4a6fa5"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="30.5" cy="34.5" r="1.3" fill="#fffdf9" />
      <circle cx="35.5" cy="34.5" r="1.3" fill="#fffdf9" />
    </svg>
  )
}

// Logo kèm ô nền tint mềm + tên, dùng ở header. `boxClassName` chỉnh kích thước ô.
export function Logo({
  boxClassName = 'size-9',
  textClassName = 'text-lg',
  showText = true,
}: {
  boxClassName?: string
  textClassName?: string
  showText?: boolean
}) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={cn(
          'flex items-center justify-center rounded-2xl bg-primary/10',
          boxClassName,
        )}
      >
        <LogoMark className="size-[82%]" />
      </span>
      {showText && (
        <span className={cn('font-display font-bold text-primary', textClassName)}>DocuHub</span>
      )}
    </span>
  )
}
