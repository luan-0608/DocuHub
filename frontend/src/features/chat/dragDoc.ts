import { useState } from 'react'
import type { DragEvent, MouseEvent } from 'react'

// Định dạng dữ liệu khi kéo một tài liệu (từ card/hàng) thả vào panel chat.
export const DOC_DRAG_TYPE = 'application/x-docuhub-doc'

export interface DocDragPayload {
  id: number
  title: string
}

export function setDocDrag(e: DragEvent, doc: DocDragPayload) {
  e.dataTransfer.setData(DOC_DRAG_TYPE, JSON.stringify(doc))
  e.dataTransfer.effectAllowed = 'copy'
}

export function hasDocDrag(e: DragEvent): boolean {
  return e.dataTransfer.types.includes(DOC_DRAG_TYPE)
}

export function getDocDrag(e: DragEvent): DocDragPayload | null {
  const raw = e.dataTransfer.getData(DOC_DRAG_TYPE)
  if (!raw) return null
  try {
    return JSON.parse(raw) as DocDragPayload
  } catch {
    return null
  }
}

// Props kéo-thả cho một tài liệu. draggable mặc định FALSE và chỉ bật khi
// nhấn-giữ chuột trái đơn (detail === 1): double-click trên phần tử draggable
// khiến Chromium mở phiên kéo "ma" không bao giờ kết thúc → cả trang trơ chuột
// cho tới khi reload. Tắt draggable lúc double-click chặn tận gốc lỗi đó.
export function useDocDrag(doc: DocDragPayload) {
  const [draggable, setDraggable] = useState(false)
  return {
    draggable,
    onMouseDown: (e: MouseEvent) => setDraggable(e.button === 0 && e.detail === 1),
    onMouseUp: () => setDraggable(false),
    onDragStart: (e: DragEvent) => {
      if (!draggable) {
        e.preventDefault()
        return
      }
      setDocDrag(e, doc)
    },
    onDragEnd: () => setDraggable(false),
  }
}
