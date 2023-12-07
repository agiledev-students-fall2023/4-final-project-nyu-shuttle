import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateNavBarDisplay } from './NavBar';
import { drawNavigationRoute } from '../utils/stops';
import '../css/routesSubpage.css';
import '../css/basicUI.css';
import SaveRouteDialog from './SaveRouteDialog';
import RouteMap from './RouteMap';
import ViewRouteButton from './ViewRouteButton';
import { localStorageSave, localStorageLoad } from '../utils/localStorageSaveLoad';

function RoutesSubpage({ location1, location2, routes }) {
  const [displayText, setDisplayText] = useState('Click to save route ->');
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isRouteSaved, setIsRouteSaved] = useState(false);
  const [navigateTo, setNavigateTo] = useState(null);
  const navigate = useNavigate();

  const exist = !!routes;
  const isErrorMessage = exist ? typeof routes === 'string' : false;
  // console.log(exist, isErrorMessage, routes);

  const openSaveDialog = () => {
    console.log('clicked');
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
  useEffect(() => {
    const loadedRoutes = localStorageLoad('routes');
    if (
      loadedRoutes &&
      loadedRoutes.some((route) => route.from.name === location1.name && route.to === location2.name)
    ) {
      setIsRouteSaved(true);
      setDisplayText('View saved routes here');
    } else {
      setIsRouteSaved(false);
    }
  }, [location1, location2]);

  useEffect(() => {
    if (window.nyushuttle.routes) {
      for (let route in routes) {
        for (let routename in window.nyushuttle.routes) {
          // console.log(routename);
          if (window.nyushuttle.routes[routename][0] === route) {
            routes[route].color = window.nyushuttle.routes[routename][1];
            console.log(window.nyushuttle.routes[routename]);
          }
        }
      }
      if (routes[Object.keys(routes)[0]].time) {
        console.log('time calculated');
      } else {
        console.log('time not calculated');
      }
    }
  }, [window.nyushuttle.routes]);

  useEffect(() => {
    // don't know why not using routeId...
    const routeKey = Object.keys(window.nyushuttle.routes).find(
      (key) => window.nyushuttle.routes[key][0] === navigateTo
    );
    if (routeKey) {
      window.nyushuttle.routesSelected = [routeKey];
      window.nyushuttle.navigating = true;
      const from = { lat: location1.lat, lng: location1.lng };
      const to = { lat: location2.lat, lng: location2.lng };
      updateNavBarDisplay('map');
      navigate('/map');
      drawNavigationRoute(from, to, routeKey);
    }
  }, [navigateTo]);

  const shuttle = 'X';
  const shuttleSchedule = 'HH:MM';
  const totalTime = 'MM';
  const timeToShuttle = 'XX';
  const timeToDestination2 = 'YY';

  return (
    <div className="routes-subpage-container">
      <div className="title-container">
      </div>
      <RouteMap location1={location1} location2={location2} />
      <div className="route-info-container">
        {!exist && (
          <div>
            <h1>Unexpected error occurred</h1>
          </div>
        )}
        {exist && isErrorMessage && (
          <div>
            <h1>{routes}</h1>
          </div>
        )}
        {exist &&
          !isErrorMessage &&
          Object.keys(routes).map((key, index) => (
            <div key={index} className="route-info">
              <div className="route-text">
                <p className="text-lg">
                  <strong>{key}</strong>
                </p>
                <p className="text-base	">
                  Total Walking Time: <strong>{routes[key].time} min</strong>
                </p>
                {/* <p className="text-sm">
                Shuttle {key} scheduled at <strong>{shuttleSchedule}</strong>
              </p> */}
              </div>
              <button id={key} className="nav-button" onClick={(e) => setNavigateTo(e.target.id)}>
                Start
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

export default RoutesSubpage;
