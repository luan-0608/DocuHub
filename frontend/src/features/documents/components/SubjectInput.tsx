import { forwardRef, useId, type ComponentPropsWithoutRef } from 'react'
import { Input } from '@/components/ui/input'
import { useDocumentStats } from '../hooks'

// Ô nhập môn học có gợi ý các môn user đã dùng (qua native datalist):
// gõ vài chữ là chọn lại đúng tên cũ, tránh sinh môn trùng do gõ lệch.
export const SubjectInput = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<typeof Input>>(
  function SubjectInput(props, ref) {
    const listId = useId()
    const subjects = useDocumentStats().data?.subjects.filter((s) => s.name) ?? []

    return (
      <>
        <Input ref={ref} list={listId} autoComplete="off" {...props} />
        <datalist id={listId}>
          {subjects.map((s) => (
            <option key={s.name} value={s.name!} />
          ))}
        </datalist>
      </>
    )
  },
)
