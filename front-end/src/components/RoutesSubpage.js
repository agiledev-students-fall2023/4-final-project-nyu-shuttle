import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import mapImage from "../images/subpage_map.png";
import "../css/routesSubpage.css";
import "../css/basicUI.css"

function RoutesSubpage({ location1, location2 }) {
  const navigate = useNavigate();

  const startNavigation = () => {
    alert("Navigation started!");
  };

  const shuttle = "X";
  const shuttleSchedule = "HH:MM";
  const totalTime= "MM";
  const timeToShuttle = "XX";
  const timeToDestination2 = "YY";

  return (
    <div className="container">
      <h1>Route</h1>

      <div className="routes-container">
        <img src={mapImage} alt="NYC MAP" />
        <div className="route-info">
        <div className= "route-text">
        <p className = "text-lg">
            <strong>{totalTime} min</strong>
            </p>
          <p className="text-sm">
            Shuttle {shuttle} scheduled at <strong>{shuttleSchedule}</strong>
          </p>
          <p className = "text-sm">
            Time from {location1} to shuttle: <strong>{timeToShuttle} min</strong>
          </p>
          <p className = "text-sm">
            Time from shuttle to {location2}:{" "}
            <strong>{timeToDestination2} min</strong>
          </p>
        </div>
        <button className = "nav-button" onClick={startNavigation}>Start</button>
        </div>
      </div>
    </div>
  );
}

export default RoutesSubpage;
