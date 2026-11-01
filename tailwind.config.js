/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './App.tsx', './index.tsx', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        serif: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
      },
      colors: {
        // Ink-tinted neutral scale (replaces flat zinc greys with a cool, deep indigo-black)
        zinc: {
          50: '#f6f9f8',
          100: '#eef3f1',
          200: '#dde5e2',
          300: '#bcc8c4',
          400: '#93a19c',
          500: '#697671',
          600: '#46524e',
          700: '#27302d',
          800: '#171e1c',
          900: '#0c1110',
          950: '#050807',
        },
        // Brighter, more luminous brand greens
        emerald: {
          50: '#ecfff7',
          100: '#d0ffec',
          200: '#a4fbd9',
          300: '#6ff3c1',
          400: '#38e5a6',
          500: '#12d28f',
          600: '#09a872',
          700: '#0a845d',
          800: '#0d674c',
          900: '#0c5440',
          950: '#032f24',
        },
        ink: '#020605',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        glass: '0 1px 0 0 rgba(255,255,255,0.08) inset, 0 20px 50px -20px rgba(0,0,0,0.6)',
        glow: '0 0 40px -8px rgba(18,210,143,0.55)',
        'glow-violet': '0 0 40px -8px rgba(16,185,129,0.55)',
      },
      keyframes: {
        drift: {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(4%,-6%,0) scale(1.08)' },
          '66%': { transform: 'translate3d(-5%,4%,0) scale(0.96)' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(2deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        gradientShift: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        viewIn: {
          '0%': { opacity: '0', transform: 'translateY(14px)', filter: 'blur(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
      },
      animation: {
        drift: 'drift 22s ease-in-out infinite',
        'drift-slow': 'drift 34s ease-in-out infinite reverse',
        floaty: 'floaty 7s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        marquee: 'marquee 40s linear infinite',
        gradient: 'gradientShift 8s ease infinite',
        pop: 'pop 0.28s cubic-bezier(.2,.9,.3,1.2) both',
        'view-in': 'viewIn 0.6s cubic-bezier(.2,.8,.2,1) both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
