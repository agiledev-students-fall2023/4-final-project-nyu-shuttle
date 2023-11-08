import React, { useState } from "react";
import '../css/saveRouteDialog.css'

function SaveRouteDialog({ onClose, onSave}) {
  const [routeName, setRouteName] = useState("");

  const handleSave = () => {
    onSave(routeName);
    onClose();
  };

  return (
    <div className="save-route-dialog">
    <div className="pop-up">
      <h2>Save Route</h2>
      <input
        type="text"
        placeholder="Enter route name:"
        value={routeName}
        className= "route-name-input"
        onChange={(e) => setRouteName(e.target.value)}
      />
      <div className="save-route-dialog-buttons">
      <button className= "close-button" onClick={onClose}>Cancel</button>
      <button className= "save-button" onClick={handleSave}>Save</button>
      </div>
    </div>
    </div>
  );
}

export default SaveRouteDialog;
