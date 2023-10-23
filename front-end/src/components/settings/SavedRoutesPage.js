import { Link } from 'react-router-dom';
import '../../css/settingsPage.css';

const SavedRoutesPage = () => {
  return (
    <div className="settings-container">
      <Link className="settings-item" to="/settings">
        &lt; Settings
      </Link>
      <div>
        <h1 className="settings-header">Saved Routes</h1>
      </div>
    </div>
  );
};

export default SavedRoutesPage;
