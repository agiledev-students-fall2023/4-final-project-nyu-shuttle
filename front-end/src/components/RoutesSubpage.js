import { React, useState, useEffect } from "react";
import { Link , useNavigate } from "react-router-dom";
import "../css/routesSubpage.css";
import "../css/basicUI.css";
import HeartIcon from "../images/heart-svg.svg";
import HeartIconLoaded from "../images/heart-svg-loaded.svg";
import SaveRouteDialog from "./SaveRouteDialog";
import RouteMap from "./RouteMap";
import SaveRouteButton from "./SaveRouteButton";
import ViewRouteButton from "./ViewRouteButton";
import { localStorageSave, localStorageLoad } from '../utils/localStorageSaveLoad';

function RoutesSubpage({ location1, location2, routes }) {
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isRouteSaved, setIsRouteSaved] = useState(false);
  const [displayText, setDisplayText] = useState("Click to save route ->");
  const navigate = useNavigate();

  const openSaveDialog = () => {
    console.log('clicked')
    if (!isRouteSaved) {
      setSaveDialogOpen(true);
    } else {
      const loadedRoutes = localStorageLoad('routes') || [];
      const updatedRoutes = loadedRoutes.filter((route) => route.from.name !== location1.name || route.to.name !== location2.name);
      localStorageSave('routes', updatedRoutes);
    }
  };
  useEffect(() => {
    const loadedRoutes = localStorageLoad('routes');
    if (loadedRoutes && loadedRoutes.some((route) => route.from.name === location1.name && route.to === location2.name)) {
      setIsRouteSaved(true);
      setDisplayText("View saved routes here");
    } else {
      setIsRouteSaved(false);
    }
  }, [location1, location2]);


  useEffect(() => {
    if (window.nyushuttle.routes){
      for ( let route in routes) {
        for (let routename in window.nyushuttle.routes) {
          console.log(routename)
          if (window.nyushuttle.routes[routename][0] === route) {
            routes[route].color = window.nyushuttle.routes[routename][1];
            console.log(window.nyushuttle.routes[routename])
          }
        }
      }
      if(routes[Object.keys(routes)[0]].time){
        console.log('time calculated')
      }
      else{
        console.log('time not calculated')
      }
    }

  }, [window.nyushuttle.routes]);
    
  const startNavigation = value => () => {
    for (let [key, name] of Object.entries(window.nyushuttle.routes)) {
      if (name[0] === value) {
        window.nyushuttle.routesSelected = key;
        window.nyushuttle.navigating = true;
        break;
      }
    }
    navigate('/map');
  };

  const shuttle = "X";
  const shuttleSchedule = "HH:MM";
  const totalTime = "MM";
  const timeToShuttle = "XX";
  const timeToDestination2 = "YY";


  return (
    <div className="routes-subpage-container">
      <div className="title-container">
          <ViewRouteButton className="w-full h-full" saved={isRouteSaved} />
      </div>
      <RouteMap location1={location1} location2={location2} />
      <div className="route-info-container">
      {Object.keys(routes).map((route, index) => (
        <div className="route-info" >
        <div className="route-text">
          <p className="text-lg">
            <strong>{route}</strong>
          </p>
          <p className="text-base	">
            Total Walking Time:{" "}
            <strong>{routes[route].time} min</strong>
          </p>
          <p className="text-sm">
            Shuttle {route} scheduled at <strong>{shuttleSchedule}</strong>
          </p>

        </div>
        <button
          key={index} 
          className="nav-button" 
          onClick={startNavigation(route)}
        >
          Start
        </button>
      </div>
      ))}
      </div>

    </div>
  );
}

export default RoutesSubpage;