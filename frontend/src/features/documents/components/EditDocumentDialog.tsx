import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateSchema, type UpdateValues } from '../schema'
import { useUpdateDocument } from '../hooks'
import { SubjectInput } from './SubjectInput'
import { getApiError } from '@/lib/api'
import type { DocumentItem } from '@/lib/types'

interface Props {
  doc: DocumentItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditDocumentDialog({ doc, open, onOpenChange }: Props) {
  const update = useUpdateDocument(doc.id)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateValues>({
    resolver: zodResolver(updateSchema),
    // `values` đồng bộ lại form mỗi khi tài liệu thay đổi.
    values: {
      title: doc.title,
      description: doc.description ?? '',
      subject: doc.subject ?? '',
    },
  })

  const onSubmit = (vals: UpdateValues) => {
    update.mutate(vals, {
      onSuccess: () => {
        toast.success('Cập nhật thành công')
        onOpenChange(false)
      },
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa tài liệu</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ed-title">Tiêu đề</Label>
            <Input id="ed-title" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ed-subject">Môn học</Label>
            <SubjectInput id="ed-subject" {...register('subject')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ed-desc">Mô tả</Label>
            <Textarea id="ed-desc" rows={3} {...register('description')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending && <Loader2 className="size-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
