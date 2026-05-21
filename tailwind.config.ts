const sansFallback = ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji']

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FCFAF7',
        white: '#FFFFFF',
        black: '#1A1817',
        'muted-fg': '#8C8883',
        border: '#EBE7E0',
        coral: {
          DEFAULT: '#E45B3C',
          hover: '#C94A2E',
          light: '#FFF0EC',
        },
      },
      fontFamily: {
        heading: ['Inter', ...sansFallback],
        body: ['Inter', ...sansFallback],
      },
      fontSize: {
        score: ['5.5rem', { lineHeight: '0.92', fontWeight: '700' }],
        display: ['2.75rem', { lineHeight: '1.05', fontWeight: '700' }],
      },
      borderRadius: {
        DEFAULT: '10px',
        sm: '6px',
        md: '12px',
        lg: '16px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)',
        elevated: '0 4px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
        modal: '0 16px 40px rgba(0,0,0,0.10)',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-up': 'slideUp 400ms cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
