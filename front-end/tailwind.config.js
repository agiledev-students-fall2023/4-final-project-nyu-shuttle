/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      /**change color scheme here */
      colors: {
        darkTone : '#57078C',
        darkMidTone: '#998FC7',
        lightMidTone: '#C8B9F0',
        lightTone: '#F0E9FF',
      }
    },
  },
  plugins: [],
};
