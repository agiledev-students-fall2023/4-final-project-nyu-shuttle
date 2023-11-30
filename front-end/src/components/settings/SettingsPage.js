import { useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import useDarkMode from '../../hooks/darkMode';
import '../../css/settingsPage.css';

const SettingsPage = () => {
  const [colorTheme, setTheme] = useDarkMode();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(colorTheme === 'dark');
  }, [colorTheme]);

  const toggleDarkTheme = () => {
    const nextTheme = colorTheme === 'dark' ? 'light' : 'dark';
    setIsDarkMode(nextTheme === 'dark');
    setTheme(nextTheme);
  };

  return (
    <div className="settings-container">
      <h1 className="settings-header">Settings</h1>
      <div className="settings-item-wrapper">
        <div onClick={toggleDarkTheme} className="settings-item">
          <span>Toggle Dark Mode</span>
          <button className={`button-toggle ${isDarkMode ? 'bg-black' : 'bg-gray-400'}`}>
            <div className={`button-toggle-part ${isDarkMode ? 'translate-x-6' : ''}`}></div>
          </button>
        </div>

        <a href="https://nyu.passiogo.com/" className="settings-item">
          Visit Data Source
        </a>

        <Link className="settings-item" to="privacypolicy">
          Privacy Policy
        </Link>

        <Link className="settings-item" to="feedback-support">
          Feedback / Support
        </Link>

        <Link className="settings-item" to="view-schedule">
          View Schedule In Spreadsheet
        </Link>
      </div>
    </div>
  );
};

export default SettingsPage;
