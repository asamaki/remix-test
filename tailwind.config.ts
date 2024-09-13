import type { Config } from "tailwindcss";

export default {
    darkMode: ['class'],
    content: [
    './node_modules/preline/preline.js',
    "./app/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				'50': '#e4f1ff',
  				'100': '#cfe4ff',
  				'200': '#a8ccff',
  				'300': '#74a9ff',
  				'400': '#3e72ff',
  				'500': '#133cff',
  				'600': '#0026ff',
  				'700': '#0026ff',
  				'800': '#0022e4',
  				'900': '#0014b0',
  				'950': '#00053a',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'50': '#f3f0ff',
  				'100': '#e9e4ff',
  				'200': '#d6ccff',
  				'300': '#b8a4ff',
  				'400': '#9770ff',
  				'500': '#7937ff',
  				'600': '#6c0fff',
  				'700': '#5e00ff',
  				'800': '#4e00da',
  				'900': '#4000ad',
  				'950': '#25007a',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [
    require('preline/plugin'),
      require("tailwindcss-animate")
],
} satisfies Config;
