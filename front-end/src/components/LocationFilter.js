import React, { useState } from 'react';
import '../css/locationFilter.css';

const LocationDropdown = ({ onLocationChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [options, setOptions] = useState([]);
  
  const mockLocations = [
    'Location A',
    'Location B',
    'Location C',
    'Location D',
  ];

  const handleInputChange = (input) => {
    setInputValue(input);
    filterLocations(input);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setInputValue(location);
    setOptions([]); 
    onLocationChange(location);
  };

  const filterLocations = (input) => {
    const filteredLocations = mockLocations.filter(location =>
      location.toLowerCase().includes(input.toLowerCase())
    );
    setOptions(filteredLocations);
  };

  return (
    <div class = "text-box">
      <input
        type="text"
        placeholder="Enter location"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
      />
      <div className="dropdown">
        {options.length > 0 && (
          <ul className="options-list">
            {options.map((location, index) => (
              <li className = "options-expanded" key={index} onClick={() => handleLocationSelect(location)}>{location}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LocationDropdown;
