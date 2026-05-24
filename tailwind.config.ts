import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        surface: {
          DEFAULT: '#f4f4f5',
          card: '#ffffff',
          muted: '#f4f4f5',
        },
        ink: {
          DEFAULT: '#18181b',
          muted: '#71717a',
          subtle: '#a1a1aa',
        },
        paper: {
          bg: '#faf9f7',
          border: '#e8e4df',
          ink: '#1a1a1a',
          muted: '#6b6560',
        },
      },
      fontFamily: {
        display: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        nav: '0 1px 3px rgba(0,0,0,0.06)',
        fab: '0 4px 14px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
