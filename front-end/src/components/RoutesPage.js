import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationFilter from "./LocationFilter";
import "../css/routesPage.css";
import RoutesSubpage from "./RoutesSubpage";

function RoutesPage() {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [showSubpage, setShowSubpage] = useState(false);

  const checkAndShowSubpage = () => {
    if (fromLocation && toLocation) {
      setShowSubpage(true);
    } else {
      setShowSubpage(false);
    }
  };

  React.useEffect(() => {
    checkAndShowSubpage();
  }, [fromLocation, toLocation]);

  return (
    <div className="route-container">
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

      {showSubpage && <RoutesSubpage location1={fromLocation} location2={toLocation} />}
    </div>
  );
}

export default RoutesPage;
