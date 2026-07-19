import { create } from 'zustand'

// Trạng thái panel Trợ lý AI dùng chung toàn app: mở/đóng và phiên đang xem.
// sessionId = null nghĩa là đang ở màn danh sách phiên trong panel.
interface ChatPanelState {
  open: boolean
  sessionId: number | null
  openPanel: (sessionId?: number) => void
  closePanel: () => void
  togglePanel: () => void
  setSession: (sessionId: number | null) => void
}

export const useChatPanel = create<ChatPanelState>()((set) => ({
  open: false,
  sessionId: null,
  openPanel: (sessionId) =>
    set((s) => ({ open: true, sessionId: sessionId ?? s.sessionId })),
  closePanel: () => set({ open: false }),
  togglePanel: () => set((s) => ({ open: !s.open })),
  setSession: (sessionId) => set({ sessionId, open: true }),
}))
