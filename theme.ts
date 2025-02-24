import type { Config } from 'tailwindcss'

const theme: Config['theme'] = {
  colors: {
    white: '#F6F6F6',
    green: '#45F1A6',
    'green-alt': '#0DAF69',
    cyan: '#37F3FF',
    light: '#9D97AA',
    orange: '#E5A019',
    mid: '#2E2A37',
    'off-black': '#1E1B23',
    black: '#0A090C',
    transparent: 'transparent',
  },
  extend: {
    fontFamily: {
      sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      xs: '13px',
    },
    backgroundImage: {
      'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
      'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
    },
    screens: {
      'xs-h': { raw: '(max-height: 667px)' },
      '3xl': '1920px',
    },
  },
}

export default theme
