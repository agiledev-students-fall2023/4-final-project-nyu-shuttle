import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import mapImage from "../images/subpage_map.png";
import "../css/routesSubpage.css";
import "../css/basicUI.css"

function RoutesSubpage() {
  const { location1, location2 } = useParams();
  const navigate = useNavigate();

  const goBack = () => {
    navigate("/routes");
  };

  const startNavigation = () => {
    // Implement your navigation functionality here
    alert("Navigation started!");
  };

  const shuttle = "X";
  const shuttleSchedule = "HH:MM";
  const totalTime= "MM";
  const timeToShuttle = "XX";
  const timeToDestination2 = "YY";

  return (
    <div className="container">
      <button className="back-button" onClick={goBack}>
        Back
      </button>

      <h1>Routes</h1>

      <div className="routes-container">
        <img src={mapImage} alt="NYC MAP" />
        <div className="route-info">
        <div className= "route-text">
        <p class = "text-lg">
            <strong>{totalTime} min</strong>
            </p>
          <p class="text-sm">
            Fastest route, Shuttle {shuttle} scheduled at <strong>{shuttleSchedule}</strong>
          </p>
          <p class = "text-sm">
            Time from start to shuttle: <strong>{timeToShuttle} min</strong>
          </p>
          <p class = "text-sm">
            Time walking to destination 2:{" "}
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
