import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDeleteSession } from '../hooks'
import { useChatPanel } from '../panelStore'
import { getApiError } from '@/lib/api'

interface Props {
  id: number
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteSessionDialog({ id, title, open, onOpenChange }: Props) {
  const activeId = useChatPanel((s) => s.sessionId)
  const setSession = useChatPanel((s) => s.setSession)
  const del = useDeleteSession()

  const handleDelete = () => {
    del.mutate(id, {
      onSuccess: () => {
        toast.success('Đã xóa phiên chat')
        onOpenChange(false)
        // Đang mở đúng phiên vừa xóa → quay về danh sách phiên trong panel
        if (activeId === id) setSession(null)
      },
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Xóa phiên chat?</DialogTitle>
          <DialogDescription>
            Phiên “{title}” cùng toàn bộ tin nhắn sẽ bị xóa vĩnh viễn. Hành động không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={del.isPending}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={del.isPending}>
            {del.isPending && <Loader2 className="size-4 animate-spin" />}
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
