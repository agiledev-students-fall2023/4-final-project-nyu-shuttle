import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { localStorageSave, localStorageLoad } from '../../utils/localStorageSaveLoad';
import SavedRoute from './SavedRoute';
import '../../css/settingsPage.css';

const SavedRoutesPage = () => {
  const [routes, setRoutes] = useState([]);

  // Only for DEMO remove later

  localStorageSave('routes', [
    { _id: 1, name: 'Sample Favorite route 1', from: 'Sample Starting Point A', to: 'Sample Destination C' },
    { _id: 2, name: 'Sample Favorite route 2', from: 'Sample Starting Point D', to: 'Sample Destination K' },
    { _id: 3, name: 'Sample Favorite route 3', from: 'Sample Starting Point B', to: 'Sample Destination D' },
    { _id: 4, name: 'Sample Favorite route 4', from: 'Sample Starting Point G', to: 'Sample Destination A' },
    { _id: 5, name: 'Sample Favorite route 5', from: 'Sample Starting Point E', to: 'Sample Destination T' },
    { _id: 6, name: 'Sample Favorite route 6', from: 'Sample Starting Point U', to: 'Sample Destination H' },
    { _id: 7, name: 'Sample Favorite route 7', from: 'Sample Starting Point H', to: 'Sample Destination U' },
  ]);

  // --------------------------

  useEffect(() => {
    const loadedRoutes = localStorageLoad('routes');
    if (loadedRoutes) {
      setRoutes(loadedRoutes);
    }
  }, []);

  return (
    <div className="settings-container">
      <Link className="settings-item" to="/settings">
        &lt; Settings
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
