export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4
  label: 'Quá yếu' | 'Yếu' | 'Trung bình' | 'Khá' | 'Mạnh'
}

const LABELS: PasswordStrength['label'][] = ['Quá yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh']

// Chấm điểm độ mạnh mật khẩu: mỗi tiêu chí đạt được cộng 1 điểm.
export function scorePassword(pw: string): PasswordStrength {
  if (pw.length < 6) return { score: 0, label: LABELS[0] }

  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  return { score: score as PasswordStrength['score'], label: LABELS[score] }
}
