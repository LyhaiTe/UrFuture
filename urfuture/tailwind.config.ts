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
          // Added while tokenizing the landing page / auth modal — consolidates a handful
          // of near-duplicate one-off navy shades that had crept in as arbitrary values.
          panel: '#0c1424',
          panelAlt: '#090f1d',
          chip: '#0d1628',
          navSurface: '#0d172a',
          borderPanel: '#1b2b48',
          borderPanelHover: '#233a63',
          divider: '#172540',
          ctaFrom: '#0a2540',
          ctaVia: '#0d3a5c',
          textOnBrand: '#070d1a',
        },
        brand: {
          cyan: '#00d2ff',
          cyanLight: '#38bdf8',
          cyanHover: '#00b4dc',
          cyanBright: '#38dfff',
          cyanDeep: '#00a8e8',
          cyanDeepHover: '#00b9ff',
          cyanGlow: 'rgba(0, 210, 255, 0.25)',
          emerald: '#10b981',
          mint: '#34d399',
          greenBadge: '#059669',
          greenBadgeBg: '#064e3b',
          blueDark: '#0c4a6e',
          blueAccent: '#0284c7',
          blueAmbient: '#3b82f6',
          amber: '#f59e0b',
          amberLight: '#fbbf24',
          violet: '#8b5cf6',
          violetLight: '#a78bfa',
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