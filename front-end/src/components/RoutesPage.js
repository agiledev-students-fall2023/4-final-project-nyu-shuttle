import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import LocationFilter from "./LocationFilter";
import "../css/routesPage.css";
import RoutesSubpage from "./RoutesSubpage";
import ViewRouteButton from "./ViewRouteButton";

function RoutesPage() {
  const { encodedLocation1, encodedLocation2 } = useParams();

  const decodedLocation1 = encodedLocation1 ? JSON.parse(encodedLocation1) : null;
  const decodedLocation2 = encodedLocation2 ? JSON.parse(encodedLocation2) : null;

  const lastLocation1 = useRef();
  const lastLocation2 = useRef();
  const awaitingData = useRef(false); //set loading state
  const [routes, setRoutes] = useState([]); //set routes state

  if (typeof window.nyushuttle == 'undefined') {
    window.nyushuttle = {};
  }

  const [fromLocation, setFromLocation] = useState(() => {
    if (decodedLocation1) {
      return decodedLocation1;
    } else if (typeof window.nyushuttle !== 'undefined' && window.nyushuttle.fromLocation) {
      return window.nyushuttle.fromLocation;
    }
    return { name: '', address: '' };
  });

  const [toLocation, setToLocation] = useState(() => {
    if (decodedLocation2) {
      return decodedLocation2;
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
        awaitingData.current = false;
        return;
      }
    } catch (typeError) {
      console.log('same input, no need to fetch new route');
    }
    if (fromLocation.name && toLocation.name && fromLocation.name !== toLocation.name) {
      awaitingData.current = true;
      let reachableRoutes = fetch(`/getRoute`, {
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
          if (!data || !data.onSameRoute || Object.keys(data.onSameRoute).length === 0) {
            setRoutes('No route found');
            setShowSubpage(true);
            return;
          }

          console.log(Object.keys(data.onSameRoute).length);
          if (Object.keys(data.onSameRoute).length === 7) {
            setRoutes(['You should walk instead!']);
            setShowSubpage(true);
          } else {
            setRoutes(data.onSameRoute);
            window.nyushuttle.startStopLocation = data.originStop.stopId;
            window.nyushuttle.endStopLocation = data.destinationStop.stopId;
          }
          setShowSubpage(true);
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


  return (
    <div className="route-container">
      <ViewRouteButton/>
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
