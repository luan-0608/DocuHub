import { scorePassword } from './passwordStrength'

const SEGMENT_COLORS = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']

export function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null

  const { score, label } = scorePassword(password)

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {SEGMENT_COLORS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < score ? SEGMENT_COLORS[score - 1] : 'bg-muted'}`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
