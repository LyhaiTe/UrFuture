import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: 'rgb(var(--color-bg) / <alpha-value>)',
          sidebar: 'rgb(var(--color-sidebar) / <alpha-value>)',
          surface: 'rgb(var(--color-surface) / <alpha-value>)',
          card: 'rgb(var(--color-card) / <alpha-value>)',
          cardHover: 'rgb(var(--color-card-hover) / <alpha-value>)',
          cardLight: 'rgb(var(--color-card-hover) / <alpha-value>)',
          border: 'rgb(var(--color-border) / <alpha-value>)',
          borderLight: 'rgb(var(--color-border-light) / <alpha-value>)',
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
          textOnBrand: 'rgb(var(--color-text-on-brand) / <alpha-value>)',
        },
        brand: {
          cyan: 'rgb(var(--color-primary) / <alpha-value>)',
          cyanLight: 'rgb(var(--color-primary) / <alpha-value>)',
          cyanHover: 'rgb(var(--color-primary) / <alpha-value>)',
          cyanBright: 'rgb(var(--color-primary) / <alpha-value>)',
          cyanDeep: 'rgb(var(--color-primary) / <alpha-value>)',
          cyanDeepHover: 'rgb(var(--color-primary) / <alpha-value>)',
          cyanGlow: 'rgb(var(--color-primary) / 0.25)',
          emerald: 'rgb(var(--color-secondary) / <alpha-value>)',
          mint: 'rgb(var(--color-secondary) / <alpha-value>)',
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