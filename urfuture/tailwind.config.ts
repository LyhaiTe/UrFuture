import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d9edff',
          400: '#3b9dfb',
          500: '#0f7ef2',
          600: '#0a63c2',
          700: '#0c4f97',
          900: '#0d2c4f',
        },
        angkor: {
          gold: '#c9a24b',
          maroon: '#7a1f2b',
        },
      },
    },
  },
  plugins: [],
};
export default config;
