// Sinh một cặp màu nước ổn định theo tên môn học: nền tint bán trong suốt
// (đúng tinh thần watercolor) + chữ mực đậm — mọi cặp đều đạt tương phản AA
// vì chữ luôn là màu mực, chỉ hơi màu phía sau thay đổi.
const PALETTE = [
  { bg: 'bg-wash-teal/30', text: 'text-ink', dot: 'bg-wash-teal' },
  { bg: 'bg-wash-peach/30', text: 'text-ink', dot: 'bg-wash-peach' },
  { bg: 'bg-wash-rose/25', text: 'text-ink', dot: 'bg-wash-rose' },
  { bg: 'bg-wash-sand/30', text: 'text-ink', dot: 'bg-wash-sand' },
  { bg: 'bg-primary/15', text: 'text-ink', dot: 'bg-primary/60' },
]

export function subjectPalette(subject?: string) {
  if (!subject) return { bg: 'bg-muted', text: 'text-ink', dot: 'bg-muted-foreground/40' }
  let hash = 0
  for (let i = 0; i < subject.length; i++) hash = (hash * 31 + subject.charCodeAt(i)) >>> 0
  return PALETTE[hash % PALETTE.length]
}
