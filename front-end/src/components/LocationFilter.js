import React, { useState, useEffect } from 'react';
import { loadGoogleMapsAPI } from '../utils/mapUtility';
import '../css/locationFilter.css';

const LocationDropdown = ({initialLocation, onLocationChange }) => {
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [inputValue, setInputValue] = useState(initialLocation.name || ''); 
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || ''); 
  const [options, setOptions] = useState([]);

  // Load Google Maps API
  useEffect(() => {
    loadGoogleMapsAPI(setIsApiLoaded);
  }, []);

  useEffect(() => {
    if (isApiLoaded) {
      const google = window.google;
      const placesService = new google.maps.places.PlacesService(document.createElement('div'));
      if (inputValue.trim() !== '' && inputValue !== selectedLocation.name) {
        const request = {
          query: inputValue,
        };
        placesService.textSearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            const nycPlaces = results.filter((result) => result.formatted_address);
            const limitedPlaces = nycPlaces.slice(0, 5); 
            const places = limitedPlaces.map((result) => ({
              name: result.name,
              address: result.formatted_address,
              place_id: result.place_id,
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng(),
            }
            
            ));
            setOptions(places);
          } 
        });
      }
    }
  }, [inputValue, selectedLocation]);

  const handleInputChange = (input) => {
    setInputValue(input); 
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setInputValue(location.name);
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
          <ul className="options-list">
            {options.map((location, index) => (
              <li className="options-expanded" 
               key={index} onClick={() => handleLocationSelect(location)}>
                {location.name} - {location.address}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LocationDropdown;
