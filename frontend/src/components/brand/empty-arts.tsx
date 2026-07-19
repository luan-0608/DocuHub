// Minh họa cho các trạng thái trống / lỗi, phong cách mực + màu nước:
// nét mảnh xanh ghi #4a6fa5, mảng màu loang mềm phía sau, không khối bóng cứng.

type ArtProps = { className?: string }

const STROKE = '#4a6fa5'
const SW = 1.75

// Hộp giấy mở nắp trống — dùng cho "Chưa có tài liệu"
export function EmptyBoxArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 96 96" fill="none" className={className} aria-hidden="true">
      <defs>
        <filter id="wc-box-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <ellipse cx="48" cy="56" rx="33" ry="26" fill="#d4a373" opacity=".28" filter="url(#wc-box-blur)" />
      <path
        d="M24 42h48v30a4 4 0 0 1-4 4H28a4 4 0 0 1-4-4V42Z"
        fill="#d4a373"
        fillOpacity=".4"
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <path d="M24 42 13 31l26-4 10 12-25 3Z" fill="#faf8f5" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M72 42l11-11-26-4-10 12 25 3Z" fill="#faf8f5" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M32 54h20M32 61h13" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" opacity=".4" />
      {/* vài hạt màu lơ lửng */}
      <circle cx="48" cy="19" r="3" fill="#c38d94" opacity=".6" />
      <circle cx="62" cy="13" r="2.4" fill="#85cdca" opacity=".7" />
      <circle cx="36" cy="13" r="2" fill="#e8a87c" opacity=".7" />
    </svg>
  )
}

// Kính lúp soi tờ giấy — dùng cho "Không tìm thấy kết quả"
export function NoResultArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 96 96" fill="none" className={className} aria-hidden="true">
      <defs>
        <filter id="wc-search-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <ellipse cx="46" cy="46" rx="32" ry="30" fill="#85cdca" opacity=".26" filter="url(#wc-search-blur)" />
      <path
        d="M28 14h22l10 10v34a4 4 0 0 1-4 4H28a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4Z"
        fill="#fffdf9"
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <path d="M50 14v7a3 3 0 0 0 3 3h7" fill="#85cdca" fillOpacity=".4" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M30 32h18M30 39h20" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" opacity=".4" />
      <circle cx="58" cy="58" r="14" fill="#c38d94" fillOpacity=".35" stroke={STROKE} strokeWidth={SW} />
      <circle cx="58" cy="58" r="7.5" fill="#fffdf9" stroke={STROKE} strokeWidth={SW} />
      {/* dấu hỏi nhỏ trong lòng kính */}
      <path
        d="M56.5 56.2c0-1.6 1.2-2.4 2.3-3 1-.6 1.7-1.3 1.7-2.4 0-1.5-1.2-2.5-2.8-2.5-1.5 0-2.6.8-2.9 2.2"
        stroke={STROKE}
        strokeWidth="1.6"
        strokeLinecap="round"
        transform="translate(1 6)"
      />
      <circle cx="57.5" cy="64.5" r="1.2" fill={STROKE} />
      <path d="m68.5 68.5 10 10" stroke={STROKE} strokeWidth={SW + 1.5} strokeLinecap="round" />
    </svg>
  )
}

// Bong bóng chat mỉm cười với tia sáng — màn hình chat trống
export function ChatWelcomeArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 96 96" fill="none" className={className} aria-hidden="true">
      <defs>
        <filter id="wc-chat-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <ellipse cx="44" cy="42" rx="32" ry="26" fill="#c38d94" opacity=".26" filter="url(#wc-chat-blur)" />
      <path
        d="M20 20h40a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6H33l-10 9v-9h-3a6 6 0 0 1-6-6V26a6 6 0 0 1 6-6Z"
        fill="#c38d94"
        fillOpacity=".4"
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      {/* mắt + miệng cười */}
      <circle cx="32" cy="36" r="2.2" fill={STROKE} />
      <circle cx="48" cy="36" r="2.2" fill={STROKE} />
      <path d="M32 45c3.5 3.5 10.5 3.5 14.5 0" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {/* tia sáng AI — chấm màu nước mềm */}
      <path
        d="m76 46 2.6 5.6L84 54l-5.4 2.4L76 62l-2.6-5.6L68 54l5.4-2.4L76 46Z"
        fill="#e8a87c"
        fillOpacity=".7"
        stroke={STROKE}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="m68 12 1.8 3.8 3.7 1.6-3.7 1.7L68 22.5l-1.8-3.4-3.7-1.7 3.7-1.6L68 12Z"
        fill="#85cdca"
        fillOpacity=".7"
        stroke={STROKE}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Tờ giấy rách đôi — trang 404
export function NotFoundArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 96 96" fill="none" className={className} aria-hidden="true">
      <defs>
        <filter id="wc-404-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <ellipse cx="48" cy="46" rx="30" ry="32" fill="#e8a87c" opacity=".26" filter="url(#wc-404-blur)" />
      {/* nửa trái, nghiêng nhẹ */}
      <path
        d="M24 14a2 2 0 0 1 2-2h20l-3 12 4 10-4 10 3 12-2 16H26a2 2 0 0 1-2-2V14Z"
        fill="#fffdf9"
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
        transform="rotate(-4 34 42)"
      />
      {/* nửa phải, nghiêng ngược lại */}
      <path
        d="M46 12h18a2 2 0 0 1 2 2v56a2 2 0 0 1-2 2H44l2-16-3-12 4-10-4-10 3-12Z"
        fill="#fffdf9"
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
        transform="rotate(4 56 42)"
      />
      <path d="M28 26h10M28 34h11" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" opacity=".4" transform="rotate(-4 34 42)" />
      <path d="M52 30h10M52 38h9" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" opacity=".4" transform="rotate(4 56 42)" />
      {/* giọt màu cảm thán */}
      <circle cx="48" cy="85" r="4.5" fill="#c38d94" opacity=".6" />
    </svg>
  )
}
