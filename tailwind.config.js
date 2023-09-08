/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // backgroundImage: {
      //   'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      //   'gradient-conic':
      //     'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      // },
      keyframes: {
        pushLeft: {
          '0%': {  },
          '100%': { transform: 'rotate(-12deg) translate(-120px,-20px)', opacity:'0.5' },
        },
        pushRight: {
          '0%': {  },
          '100%': { transform: 'rotate(12deg) translate(120px,-20px)', opacity:'0.5' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        fadeOut: {
          '0%': { opacity: 0.5 },
          '100%': { opacity: 0 }
        }
      },
      animation: {
        pushLeft: 'pushLeft 0.5s',
        pushRight: 'pushRight 0.5s',
        fadeIn: 'fadeIn 0.5s',
        fadeOut: 'fadeOut 0.5s'
      }
    },
  },
  plugins: [],
}
