import type { Config } from "tailwindcss";

export default {
  content: [
    './node_modules/preline/preline.js',
    "./app/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e4f1ff',
          100: '#cfe4ff',
          200: '#a8ccff',
          300: '#74a9ff',
          400: '#3e72ff',
          500: '#133cff',
          600: '#0026ff',
          700: '#0026ff',
          800: '#0022e4',
          900: '#0014b0',
          950: '#00053a',
        },
        secondary: {
          50: '#f3f0ff',
          100: '#e9e4ff',
          200: '#d6ccff',
          300: '#b8a4ff',
          400: '#9770ff',
          500: '#7937ff',
          600: '#6c0fff',
          700: '#5e00ff',
          800: '#4e00da',
          900: '#4000ad',
          950: '#25007a',
        },
      },
    },

  },
  plugins: [
    require('preline/plugin'),
  ],
} satisfies Config;
