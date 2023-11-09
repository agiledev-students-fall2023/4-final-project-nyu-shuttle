import React, { useState } from "react";
import '../css/editRouteDialog.css'

function EditRouteForm({ onSave, onCancel, initialValue }) {
  const [newName, setNewName] =  useState(initialValue || '');

  const handleSave = () => {
    if(newName.trim() !== ""){
        onSave(newName);
        onCancel();
    } else{
        alert("Route name cannot be empty");
    }
  };
 
  return (
    <div className="edit-route-dialog">
    <div className = "edit-route-pop-up">
    <h2>Edit Route Name</h2>
      <input
        type="text"
        value={newName}
        className = "edit-route-name-input"
        onChange={(e) => setNewName(e.target.value)}
      />
      <div className="edit-route-dialog-buttons">
      <button className= "edit-route-save-button" onClick={handleSave}>Save</button>
      <button className= "edit-route-cancel-button" onClick={onCancel}>Cancel</button>
      </div>
    </div>
    </div>
  );
}

export default EditRouteForm;
