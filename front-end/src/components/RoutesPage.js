import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import LocationFilter from "./LocationFilter";
import "../css/routesPage.css";
import RoutesSubpage from "./RoutesSubpage";

function RoutesPage() {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [showSubpage, setShowSubpage] = useState(false);

  const checkAndShowSubpage = useCallback(() => {
    if (fromLocation && toLocation) {
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
      <Link className="saved-item" to="/saved-routes">
        &lt; Saved Routes
      </Link>
      <div className="location-input">
        <label>From:</label>
        <LocationFilter
          onLocationChange={(location) => {
            setFromLocation(location);
          }}
        />
      </div>

      <div className="location-input">
        <label>To:</label>
        <LocationFilter
          onLocationChange={(location) => {
            setToLocation(location);
          }}
        />
      </div>

      {showSubpage && (
        <RoutesSubpage location1={fromLocation} location2={toLocation} />
      )}
    </div>
  );
}

export default RoutesPage;
