/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      transitionProperty: {
        'width': 'width'
      },
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
          darkTone: '#18122B',
          darkMidTone: '#393053',
          lightMidTone: '#443C68',
          lightTone: '#635985',
        },
      },
    },
  },
  plugins: [],
};
