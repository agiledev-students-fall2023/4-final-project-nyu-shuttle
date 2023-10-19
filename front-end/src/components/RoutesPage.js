import '../css/routesPage.css'
import React, { useState } from "react";

function RoutesPage() {
  const [location1, setLocation1] = useState("");
  const [location2, setLocation2] = useState("");

  const handleLocation1Change = (event) => {
    setLocation1(event.target.value);
  };

  const handleLocation2Change = (event) => {
    setLocation2(event.target.value);
  };

  return (
    <>
      <div className="route-container">
        <div className="location-input">
          <label>From:</label>
          <input
            type="text"
            placeholder="Enter Location 1"
            value={location1}
            onChange={handleLocation1Change}
          />
        </div>

        <div className="location-input">
          <label>To:</label>
          <input
            type="text"
            placeholder="Enter Location 2"
            value={location2}
            onChange={handleLocation2Change}
          />
        </div>
      </div>
    </>
  );
}

export default RoutesPage;
