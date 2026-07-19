// Dải chữ trôi ngang vô hạn — chậm rãi, dịu như màu loang trên giấy ướt.
// Nội dung nhân đôi (bản 2 aria-hidden) để vòng lặp liền mạch; hover thì dừng.

export function Marquee({ items }: { items: string[] }) {
  const row = (hidden: boolean) => (
    <span className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="px-7 font-serif text-sm italic text-primary">{item}</span>
          <span className="size-1.5 shrink-0 rounded-full bg-wash-peach" />
        </span>
      ))}
    </span>
  )

  return (
    <div className="overflow-hidden bg-wash-teal/20 py-3.5">
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
