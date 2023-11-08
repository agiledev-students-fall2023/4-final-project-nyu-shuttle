import React, { useState } from "react";

function SaveRouteDialog({ onClose, onSave }) {
  const [routeName, setRouteName] = useState("");

  const handleSave = () => {
    onSave(routeName);
    onClose();
  };

  return (
    <div className="save-route-dialog">
      <h2>Save Route</h2>
      <input
        type="text"
        placeholder="Enter route name:"
        value={routeName}
        onChange={(e) => setRouteName(e.target.value)}
      />
      <button className= "save-button" onClick={handleSave}>Save</button>
      <button className= "close-button" onClick={onClose}>Cancel</button>
    </div>
  );
}

export default SaveRouteDialog;
