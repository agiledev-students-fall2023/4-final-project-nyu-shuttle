import '../css/map.css';
import { useEffect, useState, useRef } from 'react';
import RealTimeDataWebSocket from '../utils/websocket';
import { getCoordinates, generateTwoUniqueRandomInts, simpifyView, getMapOptions } from '../utils/mapUtility';
import { updateTransportMarkers } from '../utils/transportMarker';

function Map({ line, lineColor }) {
  const API_KEY = 'API_KEY_HERE';
  const googleMapRef = useRef(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [ws, setWebSocket] = useState(null);
  const [transportData, setTransportData] = useState(null);
  const [map, setMap] = useState(null);
  const markerRef = useRef({});
  const [randomIntOne, randomIntTwo] = generateTwoUniqueRandomInts(0, 9);
  const nycCoordinates = getCoordinates();
  const [startLoc, setStartLoc] = useState(nycCoordinates[randomIntOne]);
  const [endLoc, setEndLoc] = useState(nycCoordinates[randomIntTwo]);

  // Load Google Maps API
  useEffect(() => {
    if (!window.google || !window.google.maps) {
      const initMap = () => setIsApiLoaded(true);
      window.initMap = initMap;

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap&libraries=geometry`;
      script.async = true;
      document.head.appendChild(script);
    } else {
      setIsApiLoaded(true); // If Google Maps API is already present
    }
  }, []);

  // Initialize map after Google Maps API has loaded
  useEffect(() => {
    if (isApiLoaded) {
      const googleMap = new window.google.maps.Map(googleMapRef.current, {
        center: new window.google.maps.LatLng(40.716503, -73.976077),
        zoom: 13,
        options: getMapOptions(),
      });
      simpifyView(googleMap);
      setMap(googleMap);

      window.google.maps.event.addListenerOnce(googleMap, 'tilesloaded', () => {
        fetchTransportData(googleMap);
      });

      const ws = new RealTimeDataWebSocket();
      setWebSocket(ws);

      return () => {
        ws.unsubscribe();
      };
    }
  }, [isApiLoaded]);

  //update map when line changes
  useEffect(() => {
    //wait for map to return
    if (!startLoc || !endLoc || !map || !line || !lineColor) return;
    console.log('----------------------------');
    console.log('line changed');
    console.log(line);
    console.log('startLoc' + startLoc);
    console.log('endLoc' + endLoc);
    console.log('----------------------------');

    let directionsService = new window.google.maps.DirectionsService();
    let directionsRenderer = new window.google.maps.DirectionsRenderer({
      polylineOptions: new window.google.maps.Polyline({
        strokeColor: lineColor,
        strokeOpacity: 0.8,
        strokeWeight: 5,
      }),
    });
    //set start and end location
    let start = new window.google.maps.LatLng(startLoc[1], startLoc[0]);
    let end = new window.google.maps.LatLng(endLoc[1], endLoc[0]);
    //request settings
    let request = {
      origin: start,
      destination: end,
      travelMode: 'WALKING',
    };
    directionsService.route(request, function (response, status) {
      if (status === 'OK') {
        directionsRenderer.setDirections(response);
        directionsRenderer.setMap(map);
      }
    });
  }, [map, line, startLoc, endLoc]);

  useEffect(() => {
    if (ws && transportData) {
      ws.setup(transportData, setTransportData);
      ws.start();
    }
    updateTransportMarkers(transportData, markerRef, map);
  }, [transportData, map]);

  const fetchTransportData = async () => {
    try {
      // console.log('fetching transport data');
      const response = await fetch('/buses');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // console.log('response ok');
      const data = await response.json();
      console.log('Initial transport data fetched');
      setTransportData(data);
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
