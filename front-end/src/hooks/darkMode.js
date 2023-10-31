import { useState, useEffect } from 'react';

const useDarkMode = () => {
  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem('theme-color');
    if (storedTheme) {
      return storedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    } else {
      return 'light';
    }
  };

  const [colorTheme, setColorTheme] = useState(getInitialTheme);

  useEffect(() => {
    localStorage.setItem('theme-color', colorTheme);

    // Setting theme using class
    if (colorTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [colorTheme]);

  return [colorTheme, setColorTheme];
};

export default useDarkMode;
