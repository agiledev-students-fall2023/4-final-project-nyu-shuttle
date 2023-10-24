import { Link } from 'react-router-dom';
import '../../css/settingsPage.css';

const TimeSpreadsheetPage = () => {
  return (
    <div className="settings-container">
      <Link className="settings-item" to="/settings">
        &lt; Settings
      </Link>
      <div>
        <h1 className="settings-header">Time Spreadsheets</h1>
      </div>
      <div className="settings-item-wrapper">
        <div className="settings-item">
          <span className="font-semibold">Route A</span>
          <a href="#">Mon-Thu</a>
          <a href="#">Fri</a>
          <a href="#">Sat/Sun</a>
        </div>
        <div className="settings-item">
          <span className="font-semibold">Route B</span>
          <a href="#">Mon-Thu</a>
          <a href="#">Fri</a>
          <a href="#">Sat/Sun</a>
        </div>
        <div className="settings-item">
          <span className="font-semibold">Route C</span>
          <a href="#">Mon-Thu</a>
          <a href="#">Fri</a>
          <a href="#">Sat/Sun</a>
        </div>
        <div className="settings-item">
          <span className="font-semibold">Route E</span>
          <a href="#">Mon-Thu</a>
          <a href="#">Fri</a>
          <a href="#">Sat/Sun</a>
        </div>
        <div className="settings-item">
          <span className="font-semibold">Route F</span>
          <a href="#">Mon-Thu</a>
          <a href="#">Fri</a>
          <a href="#">Sat/Sun</a>
        </div>
        <div className="settings-item">
          <span className="font-semibold">Route G</span>
          <a href="#">Mon-Thu</a>
          <a href="#">Fri</a>
          <a href="#">Sat/Sun</a>
        </div>
        <div className="settings-item">
          <span className="font-semibold">Route W</span>
          <a href="#">Mon-Thu</a>
          <a href="#">Fri</a>
          <a href="#">Sat/Sun</a>
        </div>
      </div>
    </div>
  );
};

export default TimeSpreadsheetPage;
