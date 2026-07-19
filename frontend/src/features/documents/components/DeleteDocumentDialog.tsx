import { useNavigate } from 'react-router-dom'
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
import { useDeleteDocument } from '../hooks'
import { getApiError } from '@/lib/api'

interface Props {
  id: number
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteDocumentDialog({ id, title, open, onOpenChange }: Props) {
  const navigate = useNavigate()
  const del = useDeleteDocument()

  const handleDelete = () => {
    del.mutate(id, {
      onSuccess: () => {
        toast.success('Đã xóa tài liệu')
        navigate('/documents', { replace: true })
      },
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Xóa tài liệu?</DialogTitle>
          <DialogDescription>
            Tài liệu “{title}” sẽ bị xóa vĩnh viễn cùng dữ liệu liên quan. Hành động không thể hoàn
            tác.
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
