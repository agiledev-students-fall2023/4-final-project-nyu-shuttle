import '../css/map.css';
import { useEffect, useState, useRef } from 'react';
import BusTrackerWebSocket from '../utils/busTrackerWebSocket';
import { getCoordinates, generateTwoUniqueRandomInts } from '../utils/mapUtility';

function Map({ line }) {
  const API_KEY = 'API_KEY';
  const googleMapRef = useRef(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [ws, setWebSocket] = useState(null);
  const [busData, setBusData] = useState(null);
  const [map, setMap] = useState(null);
  const markerRef = useRef({});
  const [randomIntOne, randomIntTwo] = generateTwoUniqueRandomInts(0, 9);
  const nycCoordinates = getCoordinates();
  const [startLoc, setStartLoc] = useState(nycCoordinates[randomIntOne]);
  const [endLoc, setEndLoc] = useState(nycCoordinates[randomIntTwo]);

  const mapOptions = {
    disableDefaultUI: true, // This disables the default UI including mapTypeControl
    zoomControl: true, // Re-enables zoom control
  };

  // Load Google Maps API
  useEffect(() => {
    if (!window.google || !window.google.maps) {
      const initMap = () => setIsApiLoaded(true);
      window.initMap = initMap;

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`;
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
        center: new window.google.maps.LatLng(37.7699298, -122.4469157),
        zoom: 8,
        options: mapOptions,
      });
      setMap(googleMap);

      window.google.maps.event.addListenerOnce(googleMap, 'tilesloaded', () => {
        fetchBusData(googleMap);
      });

      const ws = new BusTrackerWebSocket();
      setWebSocket(ws);

      return () => {
        ws.unsubscribe();
      };
    }
  }, [isApiLoaded]);

  //update map when line changes
  useEffect(() => {
    //wait for map to return
    if (!startLoc || !endLoc || !map || !line || !line.lineColor) return;
    console.log('----------------------------');
    console.log('line changed');
    console.log(line);
    console.log('startLoc' + startLoc);
    console.log('endLoc' + endLoc);
    console.log('----------------------------');

    let directionsService = new window.google.maps.DirectionsService();
    let directionsRenderer = new window.google.maps.DirectionsRenderer({
      polylineOptions: new window.google.maps.Polyline({
        strokeColor: line.lineColor,
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
    if (ws && busData) {
      ws.setup(busData, setBusData);
      ws.start();
    }
    processBusData(busData, map);
  }, [busData, map]);

  const fetchBusData = async () => {
    try {
      console.log('fetching bus data');
      const response = await fetch('/buses');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log('response ok');
      const data = await response.json();
      console.log('bus data fetched');
      setBusData(data);
    } catch (error) {
      console.log('error fetching bus data', error);
      // Other error handling? message?
    }
  };

  const processBusData = (busData, map) => {
    if (busData && map) {
      // Remove old markers if they are no longer in the new data
      for (const busId in markerRef.current) {
        if (!busData.hasOwnProperty(busId)) {
          markerRef.current[busId].setMap(null);
          delete markerRef.current[busId];
        }
      }

      Object.keys(busData).forEach((bus) => {
        let lat = parseFloat(busData[bus][0].latitude);
        let lng = parseFloat(busData[bus][0].longitude);
        const position = new window.google.maps.LatLng(lat, lng);

        if (markerRef.current[bus]) {
          // Update the position of the existing marker
          markerRef.current[bus].setPosition(position);
        } else {
          // Create a new marker
          let busMarker = new window.google.maps.Marker({
            position,
            map,
            title: String(busData[bus][0].busId),
            icon: {
              url: 'busIcon.png',
              scaledSize: new window.google.maps.Size(30, 30),
            },
          });

          let infowindow = new window.google.maps.InfoWindow({
            content: `<div><strong>No.${busData[bus][0].busId}</strong><br>Line: ${busData[bus][0].bus}</div>`,
          });

          busMarker.addListener('click', () => {
            infowindow.open(map, busMarker);
          });

          // Store the marker
          markerRef.current[bus] = busMarker;
        }
      });
    } else {
      console.log('bus data or map not available');
    }
  };

  return (
    <>
      <div ref={googleMapRef} id="map" />;
    </>
  );
}

export default Map;
