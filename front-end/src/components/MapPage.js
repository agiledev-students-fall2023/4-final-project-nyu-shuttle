import '../css/mapPage.css';
import Filter from './Filter';
import Map from './Map';
// import { useEffect, useState, useRef } from 'react';

function MapPage() {
  return (
    <>
      <div className="map-container">
        <Filter />
        <div className="map">
          <Map key={0} />
        </div>
      </div>
    </>
  );
}

export default MapPage;
