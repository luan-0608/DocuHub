import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/features/auth/AuthLayout'
import { resetPasswordSchema, type ResetPasswordValues } from '@/features/auth/schema'
import { useResetPassword } from '@/features/auth/hooks'
import { getApiError } from '@/lib/api'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const reset = useResetPassword()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) })

  const onSubmit = (values: ResetPasswordValues) => {
    reset.mutate(
      { token, newPassword: values.newPassword },
      {
        onSuccess: (message) => {
          toast.success(message)
          navigate('/login', { replace: true })
        },
        onError: (err) => toast.error(getApiError(err)),
      },
    )
  }

  if (!token) {
    return (
      <AuthLayout
        title="Liên kết không hợp lệ"
        footer={
          <Link to="/forgot-password" className="font-medium text-primary hover:underline">
            Yêu cầu liên kết mới
          </Link>
        }
      >
        <p className="text-center text-sm text-muted-foreground">
          Liên kết đặt lại mật khẩu thiếu mã token hoặc đã hết hạn.
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Đặt lại mật khẩu" description="Nhập mật khẩu mới cho tài khoản của bạn">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">Mật khẩu mới</Label>
          <PasswordInput id="newPassword" {...register('newPassword')} />
          {errors.newPassword && (
            <p className="text-xs text-destructive">{errors.newPassword.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Nhập lại mật khẩu</Label>
          <PasswordInput id="confirmPassword" {...register('confirmPassword')} />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={reset.isPending}>
          {reset.isPending && <Loader2 className="animate-spin" />}
          Đổi mật khẩu
        </Button>
      </form>
    </AuthLayout>
  )
}
