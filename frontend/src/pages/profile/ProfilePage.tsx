import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordValues,
  type ProfileValues,
} from '@/features/auth/schema'
import { useChangePassword, useProfile, useUpdateProfile } from '@/features/auth/hooks'
import { PasswordStrengthBar } from '@/features/auth/PasswordStrengthBar'
import { formatDate } from '@/lib/format'
import { getApiError } from '@/lib/api'

function getInitials(name?: string): string {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(-2).map((p) => p[0]).join('').toUpperCase()
}

export default function ProfilePage() {
  const { data: user, isLoading, isError } = useProfile()
  const update = useUpdateProfile()
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { fullName: user?.fullName ?? '' },
  })

  const onSubmit = (vals: ProfileValues) => {
    update.mutate(vals.fullName, {
      onSuccess: () => toast.success('Cập nhật hồ sơ thành công'),
      onError: (err) => toast.error(getApiError(err)),
    })
  }

  const changePassword = useChangePassword()
  const {
    register: registerPw,
    handleSubmit: handleSubmitPw,
    watch: watchPw,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) })
  const newPassword = watchPw('newPassword') ?? ''

  const onSubmitPassword = (vals: ChangePasswordValues) => {
    changePassword.mutate(
      { currentPassword: vals.currentPassword, newPassword: vals.newPassword },
      {
        onSuccess: (message) => {
          toast.success(message)
          resetPw()
        },
        onError: (err) => toast.error(getApiError(err)),
      },
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (isError || !user) {
    return <p className="text-muted-foreground">Không tải được hồ sơ.</p>
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-primary">Hồ sơ</h1>
        <p className="mt-1 text-sm italic text-muted-foreground">Quản lý thông tin tài khoản của bạn</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-primary/15 bg-card shadow-wash-md">
        <div className="flex items-center gap-4 border-b border-primary/10 bg-wash-teal/20 p-6">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-wash">
            {getInitials(user.fullName)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold text-ink">{user.fullName}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ và tên</Label>
            <Input id="fullName" {...register('fullName')} />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled />
            <p className="text-xs italic text-muted-foreground">Email không thể thay đổi.</p>
          </div>
          <div className="flex flex-wrap gap-8 text-sm">
            <div>
              <p className="text-muted-foreground">Vai trò</p>
              <Badge variant="secondary" className="mt-1">
                {user.role}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Ngày tham gia</p>
              <p className="mt-1 font-bold text-primary">{formatDate(user.createdAt)}</p>
            </div>
          </div>
          <Button type="submit" disabled={update.isPending || !isDirty}>
            {update.isPending && <Loader2 className="size-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </form>
      </div>

      <div className="overflow-hidden rounded-3xl border border-primary/15 bg-card shadow-wash-md">
        <div className="border-b border-primary/10 bg-wash-teal/20 p-6">
          <p className="font-display text-lg font-bold text-ink">Đổi mật khẩu</p>
          <p className="mt-1 text-sm text-muted-foreground">Cập nhật mật khẩu đăng nhập của bạn</p>
        </div>
        <form onSubmit={handleSubmitPw(onSubmitPassword)} className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
            <PasswordInput id="currentPassword" {...registerPw('currentPassword')} />
            {pwErrors.currentPassword && (
              <p className="text-xs text-destructive">{pwErrors.currentPassword.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <PasswordInput id="newPassword" {...registerPw('newPassword')} />
            <PasswordStrengthBar password={newPassword} />
            {pwErrors.newPassword && (
              <p className="text-xs text-destructive">{pwErrors.newPassword.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Nhập lại mật khẩu mới</Label>
            <PasswordInput id="confirmPassword" {...registerPw('confirmPassword')} />
            {pwErrors.confirmPassword && (
              <p className="text-xs text-destructive">{pwErrors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending && <Loader2 className="size-4 animate-spin" />}
            Đổi mật khẩu
          </Button>
        </form>
      </div>
    </div>
  )
}
