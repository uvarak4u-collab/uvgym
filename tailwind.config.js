/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'),
        surface: v('surface'),
        fg: v('fg'),
        muted: v('muted'),
        line: v('line'),
        lime: v('lime'),
        cyan: v('cyan'),
        accent: v('accent'),
        violet: v('violet'),
        danger: v('danger'),
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgb(var(--lime) / 0.25), 0 10px 40px -10px rgb(var(--lime) / 0.45)',
        'glow-cyan': '0 10px 40px -12px rgb(var(--cyan) / 0.5)',
        card: '0 1px 0 0 rgb(255 255 255 / 0.04) inset, 0 20px 50px -24px rgb(0 0 0 / 0.6)',
      },
      backgroundImage: {
        brand: 'linear-gradient(110deg, rgb(var(--lime)) 0%, rgb(var(--cyan)) 100%)',
      },
      keyframes: {
        flicker: {
          '0%,100%': { transform: 'scale(1) rotate(-2deg)', filter: 'drop-shadow(0 0 6px rgb(251 146 60 / .7))' },
          '50%': { transform: 'scale(1.12) rotate(3deg)', filter: 'drop-shadow(0 0 14px rgb(251 146 60 / .9))' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        dash: { to: { strokeDashoffset: '0' } },
      },
      animation: {
        flicker: 'flicker 1.4s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 4s linear infinite',
      },
    },
  },
  plugins: [],
}
