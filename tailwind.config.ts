const sansFallback = ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji']
const monoFallback = ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace']

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        'bg-warm': '#FAF9F6',
        'bg-dark': '#0C0C0E',
        'bg-surface': '#161618',
        foreground: '#1C1C1E',
        'muted-fg': '#6E6E73',
        border: {
          DEFAULT: '#E8E8EA',
          light: '#F0F0F2',
        },
        accent: {
          DEFAULT: '#0D7B78',
          hover: '#0A6562',
        },
        'accent-warm': {
          DEFAULT: '#C8824A',
          light: '#F5EBE0',
        },
        success: '#2D8B4A',
        warning: '#C8824A',
        destructive: '#C8483C',
      },
      fontFamily: {
        heading: ['Instrument Sans', ...sansFallback],
        body: ['Inter', ...sansFallback],
        mono: ['JetBrains Mono', ...monoFallback],
      },
      fontSize: {
        score: ['3.5rem', { lineHeight: '1', fontWeight: '600' }],
        display: ['2.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '14px',
        xl: '18px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04)',
        elevated: '0 4px 12px rgba(0,0,0,0.06)',
        modal: '0 20px 40px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 250ms ease-out',
        'slide-up': 'slideUp 400ms ease-out',
        'count-up': 'countUp 1200ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
