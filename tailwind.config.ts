import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0f1e',
        'bg-secondary': '#111827',
        'bg-card': '#1a2235',
        'border-dark': '#1e293b',
        'accent-blue': '#3b82f6',
        'accent-emerald': '#10b981',
        'accent-amber': '#f59e0b',
        'accent-red': '#ef4444',
        'accent-purple': '#8b5cf6',
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
