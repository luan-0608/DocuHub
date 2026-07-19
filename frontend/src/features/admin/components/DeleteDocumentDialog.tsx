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
import { useDeleteAdminDocument } from '../hooks'
import { getApiError } from '@/lib/api'

interface Props {
  id: number
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteDocumentDialog({ id, title, open, onOpenChange }: Props) {
  const del = useDeleteAdminDocument()

  const handleDelete = () => {
    del.mutate(id, {
      onSuccess: () => {
        toast.success('Đã xóa tài liệu')
        onOpenChange(false)
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
            Tài liệu “{title}” cùng file và dữ liệu liên quan sẽ bị xóa vĩnh viễn. Hành động không
            thể hoàn tác.
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
