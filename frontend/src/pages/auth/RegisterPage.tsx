import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/features/auth/AuthLayout'
import { registerSchema, type RegisterValues } from '@/features/auth/schema'
import { PasswordStrengthBar } from '@/features/auth/PasswordStrengthBar'
import { useRegister } from '@/features/auth/hooks'
import { getApiError } from '@/lib/api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const registerMutation = useRegister()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })
  const password = watch('password') ?? ''

  const onSubmit = (values: RegisterValues) => {
    registerMutation.mutate(values, {
      onSuccess: () => {
        toast.success('Đăng ký thành công, vui lòng đăng nhập')
        navigate('/login', { replace: true })
      },
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  return (
    <AuthLayout
      title="Tạo tài khoản"
      description="Bắt đầu lưu trữ và hỏi đáp tài liệu cùng AI"
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Họ và tên</Label>
          <Input id="fullName" placeholder="Nguyễn Văn A" {...register('fullName')} />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          )}
        </div>
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
        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <PasswordInput id="password" autoComplete="new-password" {...register('password')} />
          <PasswordStrengthBar password={password} />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
          {registerMutation.isPending && <Loader2 className="animate-spin" />}
          Đăng ký
        </Button>
      </form>
    </AuthLayout>
  )
}
