import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        expired: '#dc2626',
        expiring: '#facc15',
      },
    },
  },
  plugins: [],
};

export default config;
