import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSessionSchema, type CreateSessionValues } from '../schema'
import { useCreateSession } from '../hooks'
import { useChatPanel } from '../panelStore'
import { useDocuments } from '@/features/documents/hooks'
import { getApiError } from '@/lib/api'

export function NewSessionDialog() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<number[]>([])
  const setSession = useChatPanel((s) => s.setSession)
  const create = useCreateSession()
  const { data: docs } = useDocuments({ size: 100 })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSessionValues>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: { title: 'Cuộc trò chuyện mới' },
  })

  const toggle = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const onSubmit = (vals: CreateSessionValues) => {
    create.mutate(
      { title: vals.title, documentIds: selected },
      {
        onSuccess: (session) => {
          toast.success('Đã tạo cuộc trò chuyện')
          reset()
          setSelected([])
          setOpen(false)
          setSession(session.id)
        },
        onError: (err) => toast.error(getApiError(err)),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="size-4" />
          Cuộc trò chuyện mới
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo cuộc trò chuyện</DialogTitle>
          <DialogDescription>
            Chọn một hoặc nhiều tài liệu để hỏi theo ngữ cảnh, hoặc bỏ trống để hỏi trên tất cả tài
            liệu.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cs-title">Tiêu đề</Label>
            <Input id="cs-title" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Tài liệu (bỏ trống = hỏi tất cả)</Label>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-2xl border border-primary/15 bg-muted/50 p-2">
              {docs?.content.length === 0 && (
                <p className="px-1 text-sm italic text-muted-foreground">Chưa có tài liệu.</p>
              )}
              {docs?.content.map((d) => (
                <label
                  key={d.id}
                  className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition-colors duration-500 ease-in-out hover:bg-primary/10"
                >
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={selected.includes(d.id)}
                    onChange={() => toggle(d.id)}
                  />
                  <span className="truncate">{d.title}</span>
                </label>
              ))}
            </div>
            {selected.length > 0 && (
              <p className="text-xs text-muted-foreground">Đã chọn {selected.length} tài liệu</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="size-4 animate-spin" />}
              Tạo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
