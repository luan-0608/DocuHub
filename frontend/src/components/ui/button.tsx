import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Nút watercolor: bo tròn hoàn toàn, hover nở bóng màu (pigment bloom),
// bấm xuống co nhẹ như ấn lên giấy ẩm — không dịch chuyển, không bóng cứng.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-500 ease-in-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-wash hover:bg-primary/90 hover:shadow-bloom-soft',
        destructive:
          'bg-destructive text-destructive-foreground shadow-wash hover:bg-destructive/90 hover:shadow-[0_8px_32px_rgba(176,79,79,0.3)]',
        outline:
          'border border-primary/25 bg-card/70 text-primary hover:border-primary/40 hover:bg-primary/10',
        secondary:
          'bg-wash-teal/30 text-foreground hover:bg-wash-teal/45 hover:shadow-[0_8px_32px_rgba(133,205,202,0.35)]',
        ghost: 'text-foreground hover:bg-primary/10',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2 text-sm',
        sm: 'h-8 px-3.5 text-xs',
        lg: 'h-12 px-7 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
