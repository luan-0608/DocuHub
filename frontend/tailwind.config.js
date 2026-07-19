/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        display: ['Lora', 'Georgia', 'serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(0 0% 100%)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Bảng màu nước — luôn dùng bán trong suốt (/15–/35) làm nền, không dùng làm màu chữ
        wash: {
          peach: '#e8a87c',
          teal: '#85cdca',
          rose: '#c38d94',
          sand: '#d4a373',
        },
        ink: '#2f3b4d',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 0.25rem)',
        sm: 'calc(var(--radius) - 0.5rem)',
      },
      boxShadow: {
        // Bóng màu mềm — thay hoàn toàn bóng cứng lệch góc của phong cách cũ
        wash: '0 4px 20px rgba(74, 111, 165, 0.10)',
        'wash-md': '0 8px 30px rgba(74, 111, 165, 0.16)',
        'wash-lg': '0 20px 60px rgba(74, 111, 165, 0.18)',
        // Pigment bloom: hover → bóng cùng tông lan rộng như màu thấm giấy ướt
        bloom: '0 10px 40px rgba(74, 111, 165, 0.35)',
        'bloom-soft': '0 8px 32px rgba(74, 111, 165, 0.22)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.3s ease-in-out',
        'accordion-up': 'accordion-up 0.3s ease-in-out',
        'rise-in': 'rise-in 0.5s ease-in-out both',
        blink: 'blink 1.2s step-end infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
