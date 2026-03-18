import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg:       '#0d1117',
          sidebar:  '#161b27',
          card:     '#1e2535',
          hover:    '#252d40',
          border:   '#2d3748',
          primary:  '#e2e8f0',
          secondary:'#94a3b8',
          muted:    '#64748b',
        },
        accent: {
          blue:   '#3b82f6',
          green:  '#10b981',
          amber:  '#f59e0b',
          red:    '#ef4444',
          purple: '#8b5cf6',
          cyan:   '#06b6d4',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderColor: {
        DEFAULT: '#2d3748',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
