import '../css/map.css';
import { useEffect, useState, useRef } from 'react';
import RealTimeDataWebSocket from '../utils/websocket';
import { loadGoogleMapsAPI, initializeMap } from '../utils/mapUtility';
import { queryTransportations } from '../utils/transportData';
import { updateTransportMarkers } from '../utils/transportMarker';
import { queryStops, drawStopMarkers } from '../utils/stops';

function Map() {
  const googleMapRef = useRef(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [ws, setWebSocket] = useState(null);
  const [transportData, setTransportData] = useState(null);
  const markerRef = useRef({});

  // Shared variable
  if (typeof window.nyushuttle == 'undefined') {
    window.nyushuttle = {};
  }

  // Load Google Maps API
  useEffect(() => {
    loadGoogleMapsAPI(setIsApiLoaded);
  }, []);

  // Initialize map after Google Maps API has loaded
  useEffect(() => {
    if (isApiLoaded) {
      if (window.gmapAPICallback) {
        delete window.gmapAPICallback;
      }

      initializeMap(googleMapRef, setIsMapLoaded, setMap);

      const ws = new RealTimeDataWebSocket();
      setWebSocket(ws);

      return () => {
        ws.unsubscribe();
      };
    }
  }, [isApiLoaded]);

  // Fetch transport data when the map is ready
  useEffect(() => {
    if (isMapLoaded) {
      fetchTransportData(map);
      queryStops().then((r) => {
        if (r) {
          drawStopMarkers();
        }
      });
    }
  }, [isMapLoaded]);

  // Set up websocket after transportdata is fetched
  useEffect(() => {
    if (ws && transportData) {
      ws.setup(transportData, setTransportData);
      ws.start();
    }
    updateTransportMarkers(transportData, markerRef, map);
  }, [transportData]);

  const fetchTransportData = async () => {
    try {
      const transportations = await queryTransportations(true);
      setTransportData(transportations);
    } catch (error) {
      console.log('error fetching transport data', error);
      // Other error handling? message?
    }
  };

  return (
    <>
      <div ref={googleMapRef} id="map" />;
    </>
  );
}

export default Map;
