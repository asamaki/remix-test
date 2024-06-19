import type { Config } from "tailwindcss";

export default {
  content: [
    './node_modules/preline/preline.js',
    "./app/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('preline/plugin'),
  ],
} satisfies Config;
