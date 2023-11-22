import { React, useState, useEffect } from "react";
import "../css/routesSubpage.css";
import "../css/basicUI.css";
import HeartIcon from "../images/heart-svg.svg";
import HeartIconLoaded from "../images/heart-svg-loaded.svg";
import SaveRouteDialog from "./SaveRouteDialog";
import RouteMap from "./RouteMap";
import { localStorageSave, localStorageLoad } from '../utils/localStorageSaveLoad';

function RoutesSubpage({ location1, location2 }) {
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isRouteSaved, setIsRouteSaved] = useState(false);
  const storedTheme = localStorage.getItem('theme-color');

  useEffect(() => {
    const loadedRoutes = localStorageLoad('routes');
    if (loadedRoutes && loadedRoutes.some((route) => route.from === location1.name && route.to === location2.name)) {
      setIsRouteSaved(true);
    } else {
      setIsRouteSaved(false);
    }
  }, [location1, location2]);

  const openSaveDialog = () => {
    if (!isRouteSaved) {
      setSaveDialogOpen(true);
    } else {
      const loadedRoutes = localStorageLoad('routes') || [];
      const updatedRoutes = loadedRoutes.filter((route) => route.from !== location1.name || route.to !== location2.name);
      localStorageSave('routes', updatedRoutes);
      setIsRouteSaved(false);
    }
  };

  const closeSaveDialog = () => {
    setSaveDialogOpen(false);
  };

  const toggleRouteSaved = (name) => {
      const loadedRoutes = localStorageLoad('routes') || [];
      const maxId = loadedRoutes.reduce((max, route) => (route._id > max ? route._id : max), 0);
      const newId = maxId + 1;
      const newRoute = {
        _id: newId,
        name: name, 
        from: location1.name,
        to: location2.name,
      };
      loadedRoutes.push(newRoute);
      localStorageSave('routes', loadedRoutes);
      setIsRouteSaved(true);
  };
    
  const startNavigation = () => {
    alert("Navigation started!")
    console.log(storedTheme)
  };

  const shuttle = "X";
  const shuttleSchedule = "HH:MM";
  const totalTime = "MM";
  const timeToShuttle = "XX";
  const timeToDestination2 = "YY";

  return (
    <div className="routes-subpage-container">
      <div className="title-container">
        <img
          src={isRouteSaved ? HeartIconLoaded : HeartIcon}
          style={{ fill: storedTheme === 'dark' ? '#FFFFFF' : '#000000' }}
          alt="Saved Icon"
          className="saved-icon"
          onClick={openSaveDialog}
        />
      </div>
      <RouteMap location1={location1} location2={location2} />
      <div className="route-info">
        <div className="route-text">
          <p className="text-lg">
            <strong>{totalTime} min</strong>
          </p>
          <p className="text-sm">
            Shuttle {shuttle} scheduled at <strong>{shuttleSchedule}</strong>
          </p>
          <p className="text-sm">
            {location1.name} to shuttle:{" "}
            <strong>{timeToShuttle} min</strong>
          </p>
          <p className="text-sm">
            Shuttle to {location2.name}:{" "}
            <strong>{timeToDestination2} min</strong>
          </p>
        </div>
        <button className="nav-button" onClick={startNavigation}>
          Start
        </button>
      </div>
      {isSaveDialogOpen && (
        <SaveRouteDialog onClose={closeSaveDialog} onSave={toggleRouteSaved}/>
      )}
    </div>
  );
}

export default RoutesSubpage;