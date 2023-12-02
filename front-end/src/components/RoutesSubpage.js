import { React, useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  const [displayText, setDisplayText] = useState("Click to save route ->");

  useEffect(() => {
    const loadedRoutes = localStorageLoad('routes');
    if (loadedRoutes && loadedRoutes.some((route) => route.from.name === location1.name && route.to === location2.name)) {
      setIsRouteSaved(true);
      setDisplayText("View saved routes here");
    } else {
      setIsRouteSaved(false);
    }
  }, [location1, location2]);

  const openSaveDialog = () => {
    if (!isRouteSaved) {
      setSaveDialogOpen(true);
    } else {
      const loadedRoutes = localStorageLoad('routes') || [];
      const updatedRoutes = loadedRoutes.filter((route) => route.from.name !== location1.name || route.to.name !== location2.name);
      localStorageSave('routes', updatedRoutes);
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
        timestamp: Date.now(),
        from: {
          name: location1.name,
          address: location1.address,
        },
        to: {
          name: location2.name,
          address: location2.address,
        },
      }; 
      loadedRoutes.push(newRoute);
      localStorageSave('routes', loadedRoutes);
      setIsRouteSaved(true);
      setDisplayText("Saved");
      setTimeout (() => {
        setDisplayText("View saved routes here");
      }, 3000);
  };
    
  const startNavigation = () => {
    fetch(`http://localhost:4000/getRoute?origin_lat=${location1.lat}&origin_lng=${location1.lng} &destination_lat=${location2.lat}&destination_lng=${location2.lng}`, {
      method: "GET",
      headers: { "Content-Type": "application/json"},
    })
      .then((response) => response.json())
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        console.log('Response from server:');
        console.log(response);
        return response.json();
      })
      .catch((error) => {
        console.error('Fetch error:', error);
      });
  };

  const shuttle = "X";
  const shuttleSchedule = "HH:MM";
  const totalTime = "MM";
  const timeToShuttle = "XX";
  const timeToDestination2 = "YY";

  return (
    <div className="routes-subpage-container">
      <div className="title-container">
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
          }
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