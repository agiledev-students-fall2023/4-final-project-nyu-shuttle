import {React, useState} from "react";
import { useParams, useNavigate} from "react-router-dom";
import mapImage from "../images/subpage_map.png";
import "../css/routesSubpage.css";
import "../css/basicUI.css"
import SavedIcon from "../images/saved-svg.svg";
import SaveRouteDialog from "./SaveRouteDialog";

function RoutesSubpage({ location1, location2 }) {
  
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState([]);

  const openSaveDialog = () => {
    setSaveDialogOpen(true);
  };

  const closeSaveDialog = () => {
    setSaveDialogOpen(false);
  };

  const saveRoute = (route) => {
    setSavedRoutes([...savedRoutes, route]);
    closeSaveDialog();
  }


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
      <div className="title-container">
      <h1>Route</h1>
      <img src={SavedIcon} alt="Saved Icon" className="saved-icon" 
      onClick={openSaveDialog}
      />
      </div>
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
        {isSaveDialogOpen && (
        <SaveRouteDialog onClose={closeSaveDialog} onSave={saveRoute} />
        )}
    </div>
  );
}

export default RoutesSubpage;
