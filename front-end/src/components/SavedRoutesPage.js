import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { localStorageSave, localStorageLoad } from '../utils/localStorageSaveLoad';
import SavedRoute from './SavedRoute';
import '../css/savedRoutesPage.css';
import EditIcon from '../images/edit_svg.svg';
import EditRouteDialog from './editRouteDialog';

const SavedRoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [editingRouteId, setEditingRouteId] = useState(null);

  useEffect(() => {
    const loadedRoutes = localStorageLoad('routes');
    if (loadedRoutes) {
      setRoutes(loadedRoutes);
    }
  }, []);

  const handleDeleteRoute = (id) => {
    const updatedRoutes = routes.filter((route) => route._id !== id);
    localStorageSave('routes', updatedRoutes);
    setRoutes(updatedRoutes);
  }

  const handleEditRoute = (id) => {
    setEditingRouteId(id);
  }

  const handleSaveEdit = (newName) => {
    const updatedRoutes = routes.map((route) => {
      if (route._id === editingRouteId) {
        route.name = newName;
      }
      return route;
    });
    localStorageSave('routes', updatedRoutes);
    setRoutes(updatedRoutes);
    setEditingRouteId(null);
  }

  const handleCancelEdit = () => {
    setEditingRouteId(null);
  }


  return (
    <div className="savedroutes-container">
      <Link className="saved-button" to="/routes">
        &lt; Route
      </Link>
      <div>
        <h1 className="savedroutes-header">Saved Routes</h1>
      </div>
      <div className="savedroutes-item-wrapper" >
        {routes.map((savedRoute) => (
          <div key={savedRoute._id} className="saved-routes-button">
            <SavedRoute savedRoute={savedRoute} />
            <div className="savedroutes-buttons">
              <img
                onClick={() => handleEditRoute(savedRoute._id)}
                className="change-button"
                src={EditIcon}
                alt="Edit Icon"
              />
              <button
                onClick={() => handleDeleteRoute(savedRoute._id)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

    {editingRouteId !== null && (
      <div className="edit-route-popup">
        <EditRouteDialog
          initialValue={routes.find((route) => route._id === editingRouteId).name}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      </div>
    )}
  </div>
  );
};

export default SavedRoutesPage;
