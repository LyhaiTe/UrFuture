import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#080d1a',
          sidebar: '#0b1222',
          surface: '#0f172a',
          card: '#0f182d',
          cardHover: '#14213d',
          cardLight: '#16233f',
          border: '#1b2947',
          borderLight: '#263b63',
          borderSubtle: '#142038',
        },
        brand: {
          cyan: '#00d2ff',
          cyanLight: '#38bdf8',
          cyanHover: '#00b4dc',
          cyanGlow: 'rgba(0, 210, 255, 0.25)',
          emerald: '#10b981',
          mint: '#34d399',
          greenBadge: '#059669',
          greenBadgeBg: '#064e3b',
          blueDark: '#0c4a6e',
          blueAccent: '#0284c7',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 210, 255, 0.15)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.15)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
