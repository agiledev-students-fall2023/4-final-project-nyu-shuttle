import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import LocationFilter from "./LocationFilter";
import "../css/routesPage.css";
import RoutesSubpage from "./RoutesSubpage";

function RoutesPage() {
  const [fromLocation, setFromLocation] = useState({name: "", address: ""});
  const [toLocation, setToLocation] = useState({name: "", address: ""});
  const [showSubpage, setShowSubpage] = useState(false);

  const checkAndShowSubpage = useCallback(() => {
    if (fromLocation.name && toLocation.name) {
      setShowSubpage(true);
    } else {
      setShowSubpage(false);
    }
  }, [fromLocation, toLocation]);

  useEffect(() => {
    checkAndShowSubpage();
  }, [checkAndShowSubpage]);

  return (
    <div className="route-container">
      <div className="input-wrapper">
      <div className="location-input">
        <label>From:</label>
        <LocationFilter
          onLocationChange={(location) => {
            setFromLocation({ name: location.name, address: location.address });
          }}
        />
      </div>

      <div className="location-input">
        <label>To:</label>
        <LocationFilter
          onLocationChange={(location) => {
            setToLocation({ name: location.name, address: location.address });
          }}
        />
      </div>
      </div>

      {showSubpage && (
        <RoutesSubpage location1={fromLocation} location2={toLocation} />
      )}
    </div>
  );
}

export default RoutesPage;