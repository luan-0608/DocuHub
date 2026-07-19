import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { FileUp, Loader2, Upload } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { uploadSchema, type UploadValues } from '../schema'
import { useUploadDocument } from '../hooks'
import { SubjectInput } from './SubjectInput'
import { getApiError } from '@/lib/api'

// Tên tệp bỏ phần mở rộng: "bai-giang.pdf" → "bai-giang"
function stripExt(name: string): string {
  return name.replace(/\.[^.]+$/, '')
}

// defaultSubject: môn học đang lọc ở trang tài liệu — mở dialog sẽ điền sẵn
// để tài liệu mới vào cùng môn, không phải gõ lại (vẫn sửa được).
export function UploadDialog({ defaultSubject }: { defaultSubject?: string | null }) {
  const [open, setOpen] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const upload = useUploadDocument()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<UploadValues>({ resolver: zodResolver(uploadSchema) })

  // Mở dialog: form sạch + môn học điền sẵn theo bộ lọc đang chọn
  const handleOpenChange = (o: boolean) => {
    setOpen(o)
    if (o) {
      reset({ title: '', description: '', subject: defaultSubject ?? '' })
      setFileName(null)
    }
  }

  // Nhận file kéo thả vào ô chọn tệp: gán vào form như khi chọn qua hộp thoại,
  // và tự điền tiêu đề từ tên file nếu người dùng chưa nhập.
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (!files.length) return
    setValue('file', files, { shouldValidate: true })
    setFileName(files[0].name)
    if (!getValues('title')) {
      setValue('title', stripExt(files[0].name), { shouldValidate: true })
    }
  }

  const onSubmit = (values: UploadValues) => {
    const fd = new FormData()
    fd.append('file', values.file[0])
    // Không nhập tiêu đề → dùng tên tệp (bỏ phần mở rộng)
    fd.append('title', values.title?.trim() || stripExt(values.file[0].name))
    if (values.description) fd.append('description', values.description)
    if (values.subject) fd.append('subject', values.subject)

    upload.mutate(
      { fd, onProgress: setProgress },
      {
        onSuccess: () => {
          toast.success('Tải lên thành công')
          reset()
          setFileName(null)
          setProgress(0)
          setOpen(false)
        },
        onError: (err) => {
          setProgress(0)
          toast.error(getApiError(err))
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Upload className="size-4" />
          Tải lên
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tải lên tài liệu</DialogTitle>
          <DialogDescription>
            Thêm tài liệu vào kho — hệ thống sẽ tự lập chỉ mục cho AI.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Ô chọn tệp đứng đầu và to nhất — hành động chính của dialog */}
          <div className="space-y-2">
            <Label htmlFor="up-file">Tệp</Label>
            <label
              htmlFor="up-file"
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-4 py-10 text-center transition-all duration-500 ease-in-out hover:border-primary/50 hover:bg-primary/5 ${
                isDragging ? 'border-primary/60 bg-primary/10' : 'border-primary/25 bg-muted/50'
              }`}
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FileUp className="size-6" />
              </span>
              {fileName ? (
                <>
                  <span className="max-w-full truncate px-2 font-display text-sm font-bold text-primary">{fileName}</span>
                  <span className="text-xs italic text-muted-foreground">
                    Bấm hoặc thả tệp khác để thay thế
                  </span>
                </>
              ) : (
                <>
                  <span className="font-display text-sm font-bold text-primary">
                    Chọn tệp hoặc kéo thả vào đây
                  </span>
                  <span className="text-xs italic text-muted-foreground">
                    PDF, DOC, DOCX, PPT, PPTX, TXT · tối đa 20MB
                  </span>
                </>
              )}
            </label>
            <Input
              id="up-file"
              type="file"
              className="sr-only"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              {...register('file', {
                onChange: (e) => {
                  const name = e.target.files?.[0]?.name ?? null
                  setFileName(name)
                  // Chọn tệp qua hộp thoại cũng tự điền tiêu đề nếu đang trống
                  if (name && !getValues('title')) {
                    setValue('title', stripExt(name), { shouldValidate: true })
                  }
                },
              })}
            />
            {errors.file && <p className="text-xs text-destructive">{errors.file.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="up-title">Tiêu đề</Label>
            <Input id="up-title" placeholder="Bỏ trống sẽ lấy tên tệp" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="up-subject">Môn học</Label>
            <SubjectInput id="up-subject" placeholder="VD: Toán cao cấp" {...register('subject')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="up-desc">Mô tả</Label>
            <Textarea id="up-desc" rows={3} {...register('description')} />
          </div>
          <DialogFooter>
            <div className="flex w-full flex-col gap-3">
              {upload.isPending && (
                <div className="space-y-1">
                  {/* 100% nghĩa là đã đẩy hết dữ liệu, server còn đang lưu file + ghi DB */}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress < 100 ? 'Đang tải lên…' : 'Đang xử lý trên máy chủ…'}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
              <Button type="submit" disabled={upload.isPending} className="self-end">
                {upload.isPending && <Loader2 className="size-4 animate-spin" />}
                Tải lên
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
