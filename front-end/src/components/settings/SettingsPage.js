import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../css/settingsPage.css';

const SettingsPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleToggle = () => {
    setIsDarkMode(!isDarkMode);
    // Add app-wide theme toggle here?
  };

  return (
    <div className="settings-container">
      <h1 className="settings-header">Settings</h1>
      <div className="settings-item-wrapper">
        <div onClick={handleToggle} className="settings-item">
          <span>Toggle Dark Mode</span>
          <button className={`button-toggle ${isDarkMode ? 'bg-black' : 'bg-gray-400'}`}>
            <div className={`button-toggle-part ${isDarkMode ? 'translate-x-6' : ''}`}></div>
          </button>
        </div>

        <Link className="settings-item" to="saved-routes">
          Saved Routes
        </Link>

        <a href="#" className="settings-item">
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
