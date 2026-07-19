import { z } from 'zod'

const MAX_SIZE = 20 * 1024 * 1024 // 20MB, khớp spring.servlet.multipart.max-file-size
const ACCEPT = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt']

function ext(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

export const uploadSchema = z.object({
  // Tiêu đề bỏ trống được — khi tải lên sẽ lấy tên tệp làm tiêu đề
  title: z.string().optional(),
  description: z.string().optional(),
  subject: z.string().optional(),
  file: z
    .instanceof(FileList, { message: 'Vui lòng chọn tệp' })
    .refine((f) => f.length === 1, 'Vui lòng chọn một tệp')
    .refine((f) => f[0]?.size <= MAX_SIZE, 'Tệp tối đa 20MB')
    .refine((f) => ACCEPT.includes(ext(f[0]?.name ?? '')), 'Định dạng cho phép: PDF, DOC, DOCX, PPT, PPTX, TXT'),
})

export const updateSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề'),
  description: z.string().optional(),
  subject: z.string().optional(),
})

export type UploadValues = z.infer<typeof uploadSchema>
export type UpdateValues = z.infer<typeof updateSchema>
