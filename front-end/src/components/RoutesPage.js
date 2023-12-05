import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getLocationButton } from '../utils/mapUtility';
import { Link, useParams } from 'react-router-dom';
import LocationFilter from './LocationFilter';
import '../css/routesPage.css';
import RoutesSubpage from './RoutesSubpage';
import { SearchIcon, FlipIcon } from './RoutePageElement';

function RoutesPage() {
  const { location1, address1, location2, address2 } = useParams();
  const lastLocation1 = useRef();
  const lastLocation2 = useRef();
  const awaitingData = useRef(false); //set loading state
  const [routes, setRoutes] = useState([]); //set routes state

  if (typeof window.nyushuttle == 'undefined') {
    window.nyushuttle = {};
  }

  const [fromLocation, setFromLocation] = useState(() => {
    if (location1 || address1) {
      return { name: location1 || '', address: address1 || '' };
    } else if (typeof window.nyushuttle !== 'undefined' && window.nyushuttle.fromLocation) {
      return window.nyushuttle.fromLocation;
    }
    return { name: '', address: '' };
  });

  const [toLocation, setToLocation] = useState(() => {
    if (location2 || address2) {
      return { name: location2 || '', address: address2 || '' };
    } else if (typeof window.nyushuttle !== 'undefined' && window.nyushuttle.toLocation) {
      return window.nyushuttle.toLocation;
    }
    return { name: '', address: '' };
  });

  useEffect(() => {
    if (typeof window.nyushuttle == 'undefined') {
      window.nyushuttle = {};
    }
    window.nyushuttle.fromLocation = fromLocation;
  }, [fromLocation]);

  useEffect(() => {
    if (typeof window.nyushuttle == 'undefined') {
      window.nyushuttle = {};
    }
    window.nyushuttle.toLocation = toLocation;
  }, [toLocation]);

  const [showRecent, setRecent] = useState('');
  const [showSubpage, setShowSubpage] = useState(false);

  const checkAndShowSubpage = useCallback(() => {
    try {
      if (awaitingData.current === true) {
        setShowSubpage(false);
        console.log('awaiting data');
        return;
      }
      if (fromLocation.name === lastLocation1.current.name && toLocation.name === lastLocation2.current.name) {
        return;
      }
    } catch (typeError) {
      console.log('same input, no need to fetch new route');
    }
    if (fromLocation.name && toLocation.name) {
      awaitingData.current = true;
      let reachableRoutes = fetch(`http://localhost:4000/getRoute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin_lat: fromLocation.lat,
          origin_lng: fromLocation.lng,
          destination_lat: toLocation.lat,
          destination_lng: toLocation.lng,
          routes: window.nyushuttle.routes,
          stops: window.nyushuttle.stops,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          awaitingData.current = false;
          return response.json();
        })
        .then((data) => {
          lastLocation1.current = fromLocation;
          lastLocation2.current = toLocation;
          if (Object.keys(data).length === 0) {
            alert('No route found');
            return;
          }
          setRoutes(data);
          setShowSubpage(true);
          alert('Starting' + JSON.stringify(data[0]));
          return data;
        })
        .catch((error) => {
          console.error('Fetch error:', error);
        });
      console.log(reachableRoutes);
    } else {
      setShowSubpage(false);
    }
  }, [fromLocation, toLocation]);

  useEffect(() => {
    checkAndShowSubpage();
  }, [checkAndShowSubpage]);

  // Fix later
  // ugly but do not have time to rewrite locationfilter
  useEffect(() => {
    const iconplaceholders = document.getElementsByClassName('iconContainer');
    const fromIcon = iconplaceholders[0].firstChild;
    const toIcon = iconplaceholders[1].firstChild;
    const fillCurrentLocation = () => {
      const path = window.location.pathname.split('/')[1];
      if (path === 'routes') {
        document.getElementsByTagName('input')[0].value = 'Current Position';
      }
    };

    fromIcon.appendChild(getLocationButton());
    fromIcon.className = 'geolocationIcon';
    fromIcon.removeEventListener('click', fillCurrentLocation);
    fromIcon.addEventListener('click', fillCurrentLocation);

    toIcon.appendChild(SearchIcon(true));
  }, []);

  const [flipToggle, setFlipToggle] = useState(false);
  useEffect(() => {
    const fromLocContent = fromLocation;
    setFromLocation(toLocation);
    setToLocation(fromLocContent);

    const inputBoxes = document.getElementsByTagName('input');
    const fromContent = inputBoxes[0].value;
    inputBoxes[0].value = fromLocation.name;
    inputBoxes[1].value = toLocation.name;

    console.log(fromLocation, toLocation);
  }, [flipToggle]);

  return (
    <div className="route-container">
      <div className="input-wrapper">
        <div className="location-input">
          <label>From:</label>
          <LocationFilter
            initialLocation={fromLocation}
            onLocationChange={(location) => {
              setFromLocation({
                name: location.name,
                address: location.address,
                place_id: location.place_id,
                lat: location.lat,
                lng: location.lng,
              });
            }}
          />
        </div>
        <button onClick={() => setFlipToggle(!flipToggle)}>
          <FlipIcon state={flipToggle} />
        </button>
        <div className="location-input">
          <label>To:</label>
          <LocationFilter
            initialLocation={toLocation}
            onLocationChange={(location) => {
              setToLocation({
                name: location.name,
                address: location.address,
                place_id: location.place_id,
                lat: location.lat,
                lng: location.lng,
              });
            }}
          />
        </div>
      </div>

      {showSubpage && <RoutesSubpage location1={fromLocation} location2={toLocation} routes={routes} />}
    </div>
  );
}

export default RoutesPage;
