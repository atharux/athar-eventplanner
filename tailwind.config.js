export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'neon-purple': '#8A4DFF',
        'neon-teal': '#00E5C0',
        'glass-bg': 'rgba(255,255,255,0.04)'
      },
      boxShadow: {
        'neon': '0 8px 40px rgba(138,77,255,0.12), 0 0 24px rgba(0,229,192,0.06)'
      },
      backdropBlur: {
        sm: '8px',
        md: '12px'
      }
    }
  },
  plugins: [],
}