/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  safelist: [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'text-blue-700',
    'text-emerald-700',
    'text-violet-700',
    'text-amber-700',
    'text-rose-700',
    'text-cyan-700',
    'bg-emerald-100',
    'bg-amber-100',
    'bg-red-100',
    'bg-indigo-100',
    'text-red-700',
    'text-indigo-700',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.25rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '2rem',
      },
    },
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          soft: 'hsl(var(--primary-soft))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        destructive: 'hsl(var(--destructive))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        DEFAULT: 'var(--radius)',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.06)',
        card: '0 12px 30px rgba(15, 23, 42, 0.08)',
        float: '0 18px 45px rgba(79, 70, 229, 0.16)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.72' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.35s ease-out',
        'soft-pulse': 'soft-pulse 2.4s ease-in-out infinite',
        shimmer: 'shimmer 2.8s linear infinite',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at top left, rgba(99, 102, 241, 0.18), transparent 32%), radial-gradient(circle at top right, rgba(6, 182, 212, 0.15), transparent 26%), linear-gradient(180deg, #ffffff, #f8fafc)',
        'shimmer-line': 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.55) 50%, rgba(255,255,255,0) 100%)',
      },
      gridTemplateColumns: {
        app: '18rem minmax(0, 1fr)',
      },
      minHeight: {
        screend: '100dvh',
      },
    },
  },
  plugins: [],
};
