import '../css/mapPage.css';
import Filter from './Filter';
import Map from './Map';
import { useEffect, useState, useRef } from 'react';

function MapPage() {
  const [lineSelected, setLineSelected] = useState(null);
  const [lineColor, setLineColor] = useState(null);
  const handleFilterChange = (newLineSelected, newLineColor) => {
    setLineSelected(newLineSelected);
    setLineColor(newLineColor);
  };
  return (
    <>
      <div className="map-container">
        <Filter onFilterChange={handleFilterChange} />
        <div className="map">
          <Map key={lineSelected} line={lineSelected} lineColor={lineColor} />
        </div>
      </div>
    </>
  );
}

export default MapPage;
