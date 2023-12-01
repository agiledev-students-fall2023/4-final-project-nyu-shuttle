import React, { useState } from 'react'; // Import only what you use
import '../css/mapPage.css';
import Filter from './Filter';
import Map from './Map';

// Functional component
function MapPage() {
  // State for the filter
  const [filter, setFilter] = useState(null);

  // Event handler for filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  return (
    <div className="map-container">
      <Filter onFilterChange={handleFilterChange} />
      <div className="map">
        <Map key={0} filter={filter} />
      </div>
    </div>
  );
}

export default MapPage;
