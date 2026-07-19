// Bộ icon SVG tùy chỉnh theo phong cách mực + màu nước: nét mảnh #4a6fa5,
// mảng màu loang mềm phía sau, fill bán trong suốt — không khối bóng cứng.
// Dùng cho lưới tính năng và 3 bước ở trang chủ.

type IconProps = { className?: string }

const STROKE = '#4a6fa5'
const SW = 1.75

// Mảng màu loang tròn phía sau mỗi icon
function Wash({ color, id }: { color: string; id: string }) {
  return (
    <>
      <defs>
        <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <ellipse cx="28" cy="29" rx="20" ry="19" fill={color} opacity=".3" filter={`url(#${id})`} />
    </>
  )
}

// 1. Tải lên & lưu trữ — đám mây với tờ giấy bay vào
export function UploadArt({ className }: IconProps) {
  return (
    <svg viewBox="0 0 56 56" fill="none" className={className} aria-hidden="true">
      <Wash color="#85cdca" id="wc-ic-up" />
      <path
        d="M16 38a9 9 0 0 1-2-17.8A12 12 0 0 1 37 16a8.5 8.5 0 0 1 9 8.5A8.5 8.5 0 0 1 39.5 38H16Z"
        fill="#85cdca" fillOpacity=".35" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round"
      />
      <rect x="22" y="30" width="12" height="16" rx="2.5" fill="#fffdf9" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M28 42v-8m0 0-3 3m3-3 3 3" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// 2. Tìm kiếm tức thì — kính lúp trên tờ giấy
export function SearchArt({ className }: IconProps) {
  return (
    <svg viewBox="0 0 56 56" fill="none" className={className} aria-hidden="true">
      <Wash color="#c38d94" id="wc-ic-search" />
      <rect x="11" y="9" width="24" height="32" rx="3.5" fill="#fffdf9" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M16 17h13M16 23h14M16 29h9" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" opacity=".55" />
      <circle cx="35" cy="33" r="9" fill="#c38d94" fillOpacity=".4" stroke={STROKE} strokeWidth={SW} />
      <circle cx="35" cy="33" r="4" fill="#fffdf9" stroke={STROKE} strokeWidth={SW} />
      <path d="m42 40 6 6" stroke={STROKE} strokeWidth={SW + 1} strokeLinecap="round" />
    </svg>
  )
}

// 3. Hỏi đáp bằng AI — hai bong bóng chat với tia sáng
export function ChatArt({ className }: IconProps) {
  return (
    <svg viewBox="0 0 56 56" fill="none" className={className} aria-hidden="true">
      <Wash color="#e8a87c" id="wc-ic-chat" />
      <path
        d="M9 10h22a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H16l-6 6v-6h-1a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3Z"
        fill="#85cdca" fillOpacity=".4" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round"
      />
      <path d="M12 17h16M12 23h11" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" opacity=".55" />
      <path
        d="M47 26H31a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h9l6 6v-6h1a3 3 0 0 0 3-3V29a3 3 0 0 0-3-3Z"
        fill="#fffdf9" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round"
      />
      <path d="m39 30 1.6 3.4 3.4 1.6-3.4 1.6L39 40l-1.6-3.4L34 35l3.4-1.6L39 30Z" fill="#e8a87c" fillOpacity=".7" stroke={STROKE} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

// 4. Quản lý theo môn học — thư mục mở với nhãn màu
export function FolderArt({ className }: IconProps) {
  return (
    <svg viewBox="0 0 56 56" fill="none" className={className} aria-hidden="true">
      <Wash color="#d4a373" id="wc-ic-folder" />
      <rect x="14" y="8" width="8" height="10" rx="2" fill="#85cdca" fillOpacity=".6" stroke={STROKE} strokeWidth="1.4" />
      <rect x="25" y="6" width="8" height="12" rx="2" fill="#c38d94" fillOpacity=".6" stroke={STROKE} strokeWidth="1.4" />
      <rect x="36" y="9" width="8" height="9" rx="2" fill="#e8a87c" fillOpacity=".6" stroke={STROKE} strokeWidth="1.4" />
      <path
        d="M8 16a3 3 0 0 1 3-3h10l4 5h20a3 3 0 0 1 3 3v19a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V16Z"
        fill="#d4a373" fillOpacity=".45" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round"
      />
      <path d="M14 32h20" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" opacity=".55" />
    </svg>
  )
}

// 5. Bảo mật theo tài khoản — khiên với ổ khóa
export function ShieldArt({ className }: IconProps) {
  return (
    <svg viewBox="0 0 56 56" fill="none" className={className} aria-hidden="true">
      <Wash color="#4a6fa5" id="wc-ic-shield" />
      <path
        d="M28 8 44 14v12c0 11-7 18-16 22-9-4-16-11-16-22V14l16-6Z"
        fill="#4a6fa5" fillOpacity=".2" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round"
      />
      <rect x="21" y="24" width="14" height="11" rx="3" fill="#fffdf9" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M24 24v-3a4 4 0 0 1 8 0v3" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      <circle cx="28" cy="29" r="1.6" fill={STROKE} />
    </svg>
  )
}

// 6. Chỉ mục tự động — tia sét trên chồng tài liệu
export function IndexArt({ className }: IconProps) {
  return (
    <svg viewBox="0 0 56 56" fill="none" className={className} aria-hidden="true">
      <Wash color="#85cdca" id="wc-ic-index" />
      <rect x="16" y="18" width="20" height="26" rx="3" fill="#fffdf9" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round" />
      <rect x="10" y="12" width="20" height="26" rx="3" fill="#85cdca" fillOpacity=".4" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M15 19h10M15 24h11M15 29h7" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" opacity=".6" />
      <path d="M40 22 32 35h6l-2 10 9-14h-6l1-9Z" fill="#e8a87c" fillOpacity=".7" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round" />
    </svg>
  )
}

// Bước 1 — form đăng ký với dấu tick
export function StepSignupArt({ className }: IconProps) {
  return (
    <svg viewBox="0 0 56 56" fill="none" className={className} aria-hidden="true">
      <Wash color="#e8a87c" id="wc-ic-signup" />
      <rect x="12" y="9" width="26" height="34" rx="3.5" fill="#fffdf9" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round" />
      <circle cx="25" cy="19" r="4" fill="#c38d94" fillOpacity=".5" stroke={STROKE} strokeWidth="1.4" />
      <path d="M17 32c1-4 4-6 8-6s7 2 8 6" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      <path d="M17 38h16" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" opacity=".55" />
      <circle cx="40" cy="40" r="8" fill="#85cdca" fillOpacity=".6" stroke={STROKE} strokeWidth={SW} />
      <path d="m36.5 40 2.5 2.5 4.5-5" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Bước 2 — kéo thả file lên
export function StepUploadArt({ className }: IconProps) {
  return (
    <svg viewBox="0 0 56 56" fill="none" className={className} aria-hidden="true">
      <Wash color="#85cdca" id="wc-ic-stepup" />
      <rect x="8" y="23" width="34" height="20" rx="4" fill="#85cdca" fillOpacity=".35" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round" strokeDasharray="5 4" />
      <rect x="19" y="10" width="14" height="18" rx="2.5" fill="#fffdf9" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M26 34v-8m0 0-3.5 3.5M26 26l3.5 3.5" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M44 12l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z" fill="#e8a87c" fillOpacity=".7" stroke={STROKE} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

// Bước 3 — hỏi và nhận câu trả lời
export function StepAskArt({ className }: IconProps) {
  return (
    <svg viewBox="0 0 56 56" fill="none" className={className} aria-hidden="true">
      <Wash color="#c38d94" id="wc-ic-ask" />
      <path
        d="M11 11h18a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H18l-6 5v-5h-1a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3Z"
        fill="#c38d94" fillOpacity=".4" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round"
      />
      <path d="M14 17h13M14 23h8" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" opacity=".55" />
      <path
        d="M45 28H29a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h7l6 5v-5h3a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3Z"
        fill="#85cdca" fillOpacity=".45" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round"
      />
      <path d="m31 35 3 3 6-6" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
