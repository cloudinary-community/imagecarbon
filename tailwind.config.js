/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  corePlugins: {
    container: false,
  },
  theme: {
    extend: {
      keyframes: {
        'spin-grow': {
          '0%': { transform: 'translateZ(0) translateY(-20vh) rotate(0deg) scale(2)' },
          '50%': { transform: 'translateZ(0) translateY(20vh) rotate(180deg) scale(5)' },
          '100%': { transform: 'translateZ(0) translateY(-20vh) rotate(360deg) scale(2)' },
        },
        'spin-icon': {
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'spin-grow': 'spin-grow 8s linear infinite',
        'spin-icon': 'spin-icon 0.5s linear infinite',
      },
      boxShadow: {
        input: '0 2px 10px rgba(36, 36, 35, 0.8)',
        'input-focus': '0 2px 10px rgba(238, 204, 110, 0.6)',
        button: '0 2px 10px rgba(36, 36, 35, 0.8)',
      },
      colors: {
        brand: {
          eggshell: '#E9EDE0',
          yellow: '#EECC6E',
          'gray-light': '#D1DBD5',
          'gray-dark': '#333533',
          'gray-darker': '#242423',
        },
        ui: {
          blue: '#2b6cb0',
          red: '#D93535',
          green: '#258901',
          note: '#9aaa9f',
        },
      },
      maxWidth: {
        page: '80rem',
        narrow: '70rem',
        content: '54rem',
      },
    },
  },
  plugins: [],
};
