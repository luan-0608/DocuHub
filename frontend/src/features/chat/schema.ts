import { z } from 'zod'

export const createSessionSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề'),
})

export const messageSchema = z.object({
  content: z.string().min(1, 'Nhập câu hỏi'),
})

export type CreateSessionValues = z.infer<typeof createSessionSchema>
export type MessageValues = z.infer<typeof messageSchema>
