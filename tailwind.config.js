module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        blog: "url('/images/bg-blog.jpg')",
        cta: "url('/images/bg-cta.jpg')",
        'underline-highlight': "url('/images/underline.svg')",
        'wave-1': "url('/images/wave-1.svg')",
        'wave-1-1': "url('/images/wave-1-1.svg')",
        'wave-2': "url('/images/wave-2.svg')",
        'wave-2-1': "url('/images/wave-2-1.svg')",
        'wave-3': "url('/images/wave-3.svg')",
        'wave-4': "url('/images/wave-4.svg')",
        'wave-5': "url('/images/wave-5.svg')",
        'wave-6': "url('/images/wave-6.svg')",
        'asset-1': "url('/images/asset-1.png')",
        'asset-2': "url('/images/asset-2.png')",
        'asset-3': "url('/images/asset-3.png')",
        'asset-4': "url('/images/asset-4.png')",
        'asset-5': "url('/images/asset-5.png')",
        'asset-6': "url('/images/asset-6.png')",
        'asset-7': "url('/images/asset-7.png')",
        'asset-8': "url('/images/asset-8.png')",
        'asset-9': "url('/images/asset-9.png')",
        'asset-10': "url('/images/asset-10.png')",
        'asset-11': "url('/images/asset-11.png')",
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
          100: '#FFFAEE',
          200: '#FDEDC6',
          300: '#FCE19E',
          400: '#FBD477',
          500: '#FAC84F',
          600: '#F8B718',
          700: '#D39706',
          800: '#9C7004',
          900: '#664903',
        },
        water: {
          50: '#FFFFFF',
          100: '#FFFFFF',
          200: '#FFFFFF',
          300: '#FFFFFF',
          400: '#FFFFFF',
          500: '#E2EDF7',
          600: '#B6D2EB',
          700: '#8AB6DF',
          800: '#5E9BD3',
          900: '#3680C3',
        },
      },
      fontFamily: {
        display: ['Atma', 'cursive'],
        sans: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.625rem', // 10px
      },
    },
  },
  plugins: [require('@tailwindcss/aspect-ratio')],
};
