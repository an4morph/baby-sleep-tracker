import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6c5ce7',
          dark: '#a29bfe',
        },
        card: {
          header: '#6c63d5',
          'header-dark': '#4a4490',
        },
        nap: '#54c8c8',
        'nap-dark': '#3aafaf',
        wb: '#f5c842',
        'wb-dark': '#d4a820',
        ns: '#3a3a6a',
        'ns-dark': '#23235a',
      },
    },
  },
  plugins: [],
} satisfies Config
