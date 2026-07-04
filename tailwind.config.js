export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent:      'var(--accent)',
        'surface-1': 'var(--surface-1)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        'text-1':    'var(--text-1)',
        'text-2':    'var(--text-2)',
        'ef-green':  'var(--color-green)',
        'ef-amber':  'var(--color-amber)',
        'ef-red':    'var(--color-red)',
        'ef-blue':   'var(--color-blue)',
      },
      boxShadow: {
        glow:   'var(--glow-md)',
        'glow-sm': 'var(--glow-sm)',
      },
      backdropBlur: {
        sm: '8px',
        md: '12px',
      },
      fontFamily: {
        mono:    ['"Space Mono"', 'monospace'],
        display: ['"Syne"', 'sans-serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
