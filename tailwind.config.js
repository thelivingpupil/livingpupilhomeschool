module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        'underline-highlight': "url('/images/underline.svg')",
        'wave-1': "url('/images/wave-1.svg')",
        'wave-1-1': "url('/images/wave-1-1.svg')",
        'wave-2': "url('/images/wave-2.svg')",
        'wave-3': "url('/images/wave-3.svg')",
        'wave-4': "url('/images/wave-4.svg')",
      },
      colors: {
        primary: {
          50: '#9A9EE0',
          100: '#8A8FDB',
          200: '#6B71D1',
          300: '#4C53C7',
          400: '#383FB3',
          500: '#2E3494',
          600: '#212569',
          700: '#13163E',
          800: '#060714',
          900: '#000000',
        },
        secondary: {
          50: '#FFFFFF',
          100: '#FFFEFA',
          200: '#FEF4D2',
          300: '#FEEAAA',
          400: '#FDE081',
          500: '#FDD659',
          600: '#FCC822',
          700: '#E3AE03',
          800: '#AC8302',
          900: '#745901',
        },
      },
      fontFamily: {
        display: ['Luckiest Guy', 'cursive'],
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
