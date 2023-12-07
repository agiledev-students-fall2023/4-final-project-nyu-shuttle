import { useState, useEffect } from 'react';

const useDarkMode = () => {
  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem('theme-color');
    // Treat 'dark' as true, and any other value as false
    return storedTheme === 'dark';
  };

  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    localStorage.setItem('theme-color', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return [isDarkMode, setIsDarkMode];
};

export default useDarkMode;
