// useDarkMode.js
import { useState, useEffect } from 'react';

const useDarkMode = () => {
  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem('theme-color');
    return storedTheme || 'light'; 
  };

  const [colorTheme, setColorTheme] = useState(getInitialTheme);

  useEffect(() => {
    localStorage.setItem('theme-color', colorTheme);

    if (colorTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [colorTheme]);

  return [colorTheme, setColorTheme];
};

export default useDarkMode;
