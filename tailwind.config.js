/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-dark': 'var(--primary-dark)',
        'primary-light': 'var(--primary-light)',
        secondary: 'var(--secondary)',
        'secondary-light': 'var(--secondary-light)',
        accent: 'var(--accent)',
        'bg-base': 'var(--bg-base)',
        'bg-white': 'var(--bg-white)',
        'bg-subtle': 'var(--bg-subtle)',
        border: 'var(--border)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        error: 'var(--error)',
        success: 'var(--success)',
        warning: 'var(--warning)',
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
