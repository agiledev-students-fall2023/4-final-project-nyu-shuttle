import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { localStorageSave, localStorageLoad } from '../utils/localStorageSaveLoad';
import SavedRoute from './SavedRoute';
import '../css/settingsPage.css';

const SavedRoutesPage = () => {
  const [routes, setRoutes] = useState([]);

  

  useEffect(() => {
    const loadedRoutes = localStorageLoad('routes');
    if (loadedRoutes) {
      setRoutes(loadedRoutes);
    }
  }, []);

  return (
    <div className="settings-container">
      <Link className="settings-item" to="/routes">
        &lt; Route
      </Link>
      <div>
        <h1 className="settings-header">Saved Routes</h1>
      </div>
      <div className="settings-item-wrapper">
        {routes.map((savedRoute) => (
          <SavedRoute key={savedRoute._id} savedRoute={savedRoute} />
        ))}
      </div>
    </div>
  );
};

export default SavedRoutesPage;
