import { React, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import mapImage from "../images/subpage_map.png";
import "../css/routesSubpage.css";
import "../css/basicUI.css";
import HeartIcon from "../images/heart-svg.svg";
import HeartIconLoaded from "../images/heart-svg-loaded.svg";
import SaveRouteDialog from "./SaveRouteDialog";
import { localStorageSave, localStorageLoad } from '../utils/localStorageSaveLoad';

function RoutesSubpage({ location1, location2 }) {
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isRouteSaved, setIsRouteSaved] = useState(false);

  useEffect(() => {
    const loadedRoutes = localStorageLoad('routes');
    if (loadedRoutes && loadedRoutes.includes(location1) && loadedRoutes.includes(location2)) {
      setIsRouteSaved(true);
    } else {
      setIsRouteSaved(false);
    }
  }, [location1, location2]);

  const openSaveDialog = () => {
    setSaveDialogOpen(true);
  };

  const closeSaveDialog = () => {
    setSaveDialogOpen(false);
  };

  const toggleRouteSaved = (name) => {
    if (isRouteSaved) {
      setIsRouteSaved(false);
      const loadedRoutes = localStorageLoad('routes') || [];
      const updatedRoutes = loadedRoutes.filter((route) => route.from !== location1 && route.to !== location2);
      localStorageSave('routes', updatedRoutes);
    } else {
      const loadedRoutes = localStorageLoad('routes') || [];
      const maxId = loadedRoutes.reduce((max, route) => (route._id > max ? route._id : max), 0);
      const newId = maxId + 1;

      const newRoute = {
        _id: newId,
        name: name, 
        from: location1,
        to: location2,
      };

      loadedRoutes.push(newRoute);

      localStorageSave('routes', loadedRoutes);

      setIsRouteSaved(true);
    }
  };
    

  const startNavigation = () => {
    alert("Navigation started!");
  };

  const shuttle = "X";
  const shuttleSchedule = "HH:MM";
  const totalTime = "MM";
  const timeToShuttle = "XX";
  const timeToDestination2 = "YY";

  return (
    <div className="container">
      <div className="title-container">
        <h1>Route</h1>
        <img
          src={isRouteSaved ? HeartIconLoaded : HeartIcon}
          alt="Saved Icon"
          className="saved-icon"
          onClick={openSaveDialog}
        />
      </div>
      <img src={mapImage} alt="NYC MAP" />
      <div className="route-info">
        <div className="route-text">
          <p className="text-lg">
            <strong>{totalTime} min</strong>
          </p>
          <p className="text-sm">
            Shuttle {shuttle} scheduled at <strong>{shuttleSchedule}</strong>
          </p>
          <p className="text-sm">
            Time from {location1} to shuttle:{" "}
            <strong>{timeToShuttle} min</strong>
          </p>
          <p className="text-sm">
            Time from shuttle to {location2}:{" "}
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
