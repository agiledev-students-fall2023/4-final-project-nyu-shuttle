/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      /*add more fonts here*/
      fontFamily: {
        mainUI: ['Merriweather', 'sans-serif'],
      },

      /**change color scheme here */
      colors: {
        darkTone: '#57078C',
        darkMidTone: '#998FC7',
        lightMidTone: '#C8B9F0',
        lightTone: '#F0E9FF',

        // Dark mode counterparts
        darkMode: {
          darkTone: '#635985',
          darkMidTone: '#443C68',
          lightMidTone: '#393053',
          lightTone: '#18122B',
        },
      },
    },
  },
  plugins: [],
};
