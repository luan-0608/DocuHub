// Bìa minh họa cho card tài liệu khi chưa có thumbnail thật.
// Phong cách mực + màu nước: nét mảnh xanh ghi #4a6fa5, mảng màu loang mềm
// phía sau thay cho khối bóng lệch. Mỗi nhóm loại file một tông màu riêng.

import type { ReactElement } from 'react'

const STROKE = '#4a6fa5'
const SW = 1.75

type CoverKind = 'pdf' | 'word' | 'slide' | 'text' | 'generic'

const KIND_BY_TYPE: Record<string, CoverKind> = {
  pdf: 'pdf',
  doc: 'word',
  docx: 'word',
  ppt: 'slide',
  pptx: 'slide',
  txt: 'text',
}

/** Nền tint màu nước của vùng bìa, ăn theo tông của loại file. */
export const COVER_BG: Record<CoverKind, string> = {
  pdf: 'bg-wash-rose/20',
  word: 'bg-primary/10',
  slide: 'bg-wash-peach/20',
  text: 'bg-wash-teal/20',
  generic: 'bg-muted/60',
}

/** Màu loang phía sau tờ giấy, cùng tông với nền bìa. */
const WASH: Record<CoverKind, string> = {
  pdf: '#c38d94',
  word: '#4a6fa5',
  slide: '#e8a87c',
  text: '#85cdca',
  generic: '#d4a373',
}

export function coverKind(fileType?: string): CoverKind {
  return KIND_BY_TYPE[fileType?.toLowerCase() ?? ''] ?? 'generic'
}

export function DocCoverArt({ kind, className }: { kind: CoverKind; className?: string }) {
  return (
    <svg viewBox="0 0 72 72" fill="none" className={className} aria-hidden="true">
      <defs>
        <filter id="wc-cover-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      {/* mảng màu loang mềm phía sau */}
      <ellipse cx="37" cy="38" rx="24" ry="23" fill={WASH[kind]} opacity=".3" filter="url(#wc-cover-blur)" />
      {/* tờ giấy gấp góc, bo mềm */}
      <path
        d="M21 10h21l14 14v33a5 5 0 0 1-5 5H21a5 5 0 0 1-5-5V15a5 5 0 0 1 5-5Z"
        fill="#fffdf9"
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <path
        d="M42 10v10a4 4 0 0 0 4 4h10"
        fill={WASH[kind]}
        fillOpacity=".4"
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      {CONTENT[kind]}
    </svg>
  )
}

// "Ruột" giả nội dung theo loại file — nét mảnh, điểm nhấn là vệt màu nước
const CONTENT: Record<CoverKind, ReactElement> = {
  // PDF: khối nhãn màu + dòng chữ
  pdf: (
    <>
      <rect x="22" y="26" width="17" height="9" rx="3" fill="#c38d94" fillOpacity=".45" stroke={STROKE} strokeWidth="1.4" />
      <path d="M23 42h24M23 48h24M23 54h14" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" opacity=".6" />
    </>
  ),
  // Word: đoạn văn với ô thụt đầu dòng
  word: (
    <>
      <rect x="22" y="26" width="10" height="10" rx="3" fill="#4a6fa5" fillOpacity=".25" stroke={STROKE} strokeWidth="1.4" />
      <path d="M36 29h10M36 33h10M23 42h24M23 48h24M23 54h14" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" opacity=".6" />
    </>
  ),
  // Slide: biểu đồ cột với các cột màu nước
  slide: (
    <>
      <path d="M25 50V39" stroke="#e8a87c" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M33 50V31" stroke="#85cdca" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M41 50V42" stroke="#c38d94" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M49 50V35" stroke="#d4a373" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M23 55h29" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" opacity=".6" />
      <circle cx="27" cy="26" r="3.5" fill="#e8a87c" fillOpacity=".5" stroke={STROKE} strokeWidth="1.4" />
    </>
  ),
  // Text: các dòng kẻ đơn thuần
  text: (
    <>
      <path d="M23 28h19M23 34h24M23 40h24M23 46h24M23 52h11" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" opacity=".6" />
    </>
  ),
  generic: (
    <>
      <path d="M23 30h15M23 38h24M23 46h24M23 52h9" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" opacity=".6" />
    </>
  ),
}
