import React, { useState, useEffect } from "react";
import "../css/locationFilter.css";

const LocationDropdown = ({ onLocationChange }) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const google = window.google;
    const placesService = new google.maps.places.PlacesService(
      document.createElement("div")
    );
  
    if (inputValue.trim() !== "" && inputValue !== selectedLocation) {
      const request = {
        query: inputValue,
      };
      placesService.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          const places = results.map((result) => result.name);
          setOptions(places);
        } else {
          console.error("Places API request failed with status:", status);
        }
      });
    }
  }, [inputValue, selectedLocation]);
  

  const handleInputChange = (input) => {
    setInputValue(input);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setInputValue(location);
    onLocationChange(location);
    setOptions([]);
  };

  return (
    <div className="text-box">
      <input
        type="text"
        placeholder="Enter location"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
      />
      <div className="dropdown">
        {options.length > 0 && (
          <ul className="options-list" >
            {options.map((location, index) => (
              <li
                className="options-expanded"
                key={index}
                onClick={() => handleLocationSelect(location)}
              >
                {location}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LocationDropdown;
