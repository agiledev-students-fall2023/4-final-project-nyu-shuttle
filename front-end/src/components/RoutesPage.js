import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import LocationFilter from "./LocationFilter";
import "../css/routesPage.css";
import RoutesSubpage from "./RoutesSubpage";

function RoutesPage() {
  const { location1, address1, location2, address2 } = useParams();
  
  if (typeof window.nyushuttle == "undefined") {
    window.nyushuttle = {};
  }

  const [fromLocation, setFromLocation] = useState(() => {
    if (location1 || address1) {
      return { name: location1 || "", address: address1 || "" };
    } else if (
      typeof window.nyushuttle !== "undefined" &&
      window.nyushuttle.fromLocation
    ) {
      return window.nyushuttle.fromLocation;
    }
    return { name: "", address: "" };
  });

  const [toLocation, setToLocation] = useState(() => {
    if (location2 || address2) {
      return { name: location2 || "", address: address2 || "" };
    } else if (
      typeof window.nyushuttle !== "undefined" &&
      window.nyushuttle.toLocation
    ) {
      return window.nyushuttle.toLocation;
    }
    return { name: "", address: "" };
  });

  
  useEffect(() => {
    if (typeof window.nyushuttle == "undefined") {
      window.nyushuttle = {};
    }
    window.nyushuttle.fromLocation = fromLocation;
  }, [fromLocation]);

  useEffect(() => {
    if (typeof window.nyushuttle == "undefined") {
      window.nyushuttle = {};
    }
    window.nyushuttle.toLocation = toLocation;
  }, [toLocation]);

  const [showRecent, setRecent] = useState("");
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
            initialLocation={fromLocation}
            onLocationChange={(location) => {
              setFromLocation({
                name: location.name,
                address: location.address,
              });
            }}
          />
        </div>

        <div className="location-input">
          <label>To:</label>
          <LocationFilter
            initialLocation={toLocation}
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
