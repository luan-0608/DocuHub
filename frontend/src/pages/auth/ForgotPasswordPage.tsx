import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/features/auth/AuthLayout'
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/features/auth/schema'
import { useForgotPassword } from '@/features/auth/hooks'
import { getApiError } from '@/lib/api'

export default function ForgotPasswordPage() {
  const forgot = useForgotPassword()
  // Email gõ dở ở trang đăng nhập được chuyển sang qua router state để điền sẵn
  const location = useLocation()
  const prefillEmail = (location.state as { email?: string } | null)?.email ?? ''
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: prefillEmail },
  })

  const onSubmit = (values: ForgotPasswordValues) => {
    forgot.mutate(values.email, {
      onSuccess: (message) => toast.success(message),
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  return (
    <AuthLayout
      title="Quên mật khẩu"
      description="Nhập email để nhận hướng dẫn đặt lại mật khẩu"
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">
          Quay lại đăng nhập
        </Link>
      }
    >
      {forgot.isSuccess ? (
        <p className="text-center text-sm text-muted-foreground">
          Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp
          thư.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="ban@example.com"
              autoComplete="off"
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={forgot.isPending}>
            {forgot.isPending && <Loader2 className="animate-spin" />}
            Gửi hướng dẫn
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
