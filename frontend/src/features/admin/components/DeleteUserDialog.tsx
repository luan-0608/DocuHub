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
import { useDeleteUser } from '../hooks'
import { getApiError } from '@/lib/api'

interface Props {
  id: number
  name: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteUserDialog({ id, name, open, onOpenChange }: Props) {
  const del = useDeleteUser()

  const handleDelete = () => {
    del.mutate(id, {
      onSuccess: () => {
        toast.success('Đã xóa người dùng')
        onOpenChange(false)
      },
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Xóa người dùng?</DialogTitle>
          <DialogDescription>
            Tài khoản “{name}” cùng dữ liệu liên quan sẽ bị xóa vĩnh viễn. Hành động không thể hoàn
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
