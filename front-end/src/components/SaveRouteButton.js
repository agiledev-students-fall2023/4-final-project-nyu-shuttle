import '../css/routesSubpage.css';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import HeartIcon from '../images/heart-svg.svg';
import HeartIconLoaded from '../images/heart-svg-loaded.svg';
import { localStorageSave, localStorageLoad } from '../utils/localStorageSaveLoad';
import SaveRouteDialog from './SaveRouteDialog';

function SaveRouteButton(prop) {
  const [isRouteSaved, setIsRouteSaved] = useState(false);
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);

  const toggleButton = () => {
    console.log(window.nyushuttle.fromLocation.name);
  };
  useEffect(() => {
    setIsRouteSaved(prop.saved);
  }, [prop.saved]);

  const openSaveDialog = () => {
    setIsRouteSaved(!isRouteSaved);
    const location1 = window.nyushuttle.fromLocation;
    const location2 = window.nyushuttle.toLocation;
    if (!isRouteSaved) {
      setSaveDialogOpen(true);
    } else {
      const loadedRoutes = localStorageLoad('routes') || [];
      const updatedRoutes = loadedRoutes.filter(
        (route) => route.from.name !== location1.name || route.to.name !== location2.name
      );
      localStorageSave('routes', updatedRoutes);
    }
  };

  const closeSaveDialog = () => {
    setSaveDialogOpen(false);
  };

  const toggleRouteSaved = (name) => {
    const location1 = window.nyushuttle.fromLocation;
    const location2 = window.nyushuttle.toLocation;
    const loadedRoutes = localStorageLoad('routes') || [];
    const maxId = loadedRoutes.reduce((max, route) => (route._id > max ? route._id : max), 0);
    const newId = maxId + 1;
    const newRoute = {
      _id: newId,
      name: name,
      timestamp: Date.now(),
      from: location1,
      to: location2,
    };
    loadedRoutes.push(newRoute);
    localStorageSave('routes', loadedRoutes);
    setIsRouteSaved(true);
  };

  return (
    <>
      <button>
        <img
          onClick={openSaveDialog}
          src={isRouteSaved ? HeartIconLoaded : HeartIcon}
          alt="Saved Icon"
          className="saved-icon red"
        />
      </button>
      {isSaveDialogOpen && <SaveRouteDialog onClose={closeSaveDialog} onSave={toggleRouteSaved} />}
    </>
  );
}

export default SaveRouteButton;
/*
<Link className={'save '+(!isRouteSaved ? 'halfw' : 'fullw')} to="/saved-routes">
{displayText}
</Link>
{!isRouteSaved &&             
<img
  src={isRouteSaved ? HeartIconLoaded : HeartIcon}
  alt="Saved Icon"
  className="saved-icon red"
  onClick={openSaveDialog}
/>
}*/
