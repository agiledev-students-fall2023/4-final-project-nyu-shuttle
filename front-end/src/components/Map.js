import "../css/map.css";
import { useEffect, useState, useRef } from "react";
import RealTimeDataWebSocket from "../utils/websocket";
import {
  loadGoogleMapsAPI,
  initializeMap,
  getCoordinates,
  generateTwoUniqueRandomInts,
} from "../utils/mapUtility";
import { queryTransportations } from "../utils/transportData";
import { updateTransportMarkers } from "../utils/transportMarker";
import { queryStops, drawStopMarkers } from "../utils/stops";

function Map({ line, lineColor }) {
  const googleMapRef = useRef(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [ws, setWebSocket] = useState(null);
  const [transportData, setTransportData] = useState(null);
  const markerRef = useRef({});
  const [randomIntOne, randomIntTwo] = generateTwoUniqueRandomInts(0, 9);
  const nycCoordinates = getCoordinates();
  const [startLoc, setStartLoc] = useState(nycCoordinates[randomIntOne]);
  const [endLoc, setEndLoc] = useState(nycCoordinates[randomIntTwo]);

  // Shared variable
  if (typeof window.nyushuttle == "undefined") {
    window.nyushuttle = {};
  }
  const busStops = {
    unionsquare: [40.7349, -73.9906],
    tompkins: [40.7251, -73.9812],
    hamilton: [40.7202, -73.9802],
    eastbroadway: [40.7141, -73.9901],
    chinatown: [40.7155, -73.9985],
    financial: [40.7081, -74.0079],
    tribeca: [40.7167, -74.0091],
    canal: [40.7218, -74.0051],
    soho: [40.7248, -74.0016],
    greenwich: [40.7333, -74.0041],
    washingtonsquare: [40.7315, -73.9971],
    jayst: [40.6922, -73.9864],
    dumbo: [40.7037, -73.9886],
    ikea: [40.6726, -74.01],
    test1: [39.7392, -104.9903],
    test2: [39.7479, -104.9994],
    test3: [39.7398, -104.9892],
    test4: [39.7394, -104.9849],
  };
  const routes = {
    route1: [
      busStops.washingtonsquare,
      busStops.unionsquare,
      busStops.tompkins,
      busStops.hamilton,
      busStops.eastbroadway,
      busStops.chinatown,
      busStops.financial,
      busStops.tribeca,
      busStops.canal,
      busStops.soho,
      busStops.greenwich,
      busStops.washingtonsquare,
    ],
    route2: [busStops.jayst, busStops.dumbo, busStops.ikea],
    route3: [
      busStops.jayst,
      busStops.eastbroadway,
      busStops.washingtonsquare,
      busStops.chinatown,
      busStops.financial,
    ],
    route4: [
      busStops.eastbroadway,
      busStops.washingtonsquare,
      busStops.unionsquare,
      busStops.tompkins,
      busStops.hamilton,
      busStops.eastbroadway,
    ],
    route5: [busStops.test1, busStops.test2, busStops.test3, busStops.test4],
  };

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

  //update map when line changes
  useEffect(() => {
    //wait for map to return
    if (!startLoc || !endLoc || !map || !line || !lineColor) return;
    console.log("----------------------------");
    console.log("line changed");
    console.log(line);
    console.log("startLoc" + startLoc);
    console.log("endLoc" + endLoc);
    console.log("----------------------------");

    //set start and end location
    let curline = routes["route" + String(line)];
    console.log("selected route: " + curline);
    plotRoute(curline, lineColor);
  }, [map, line, startLoc, endLoc]);

  const fetchTransportData = async () => {
    try {
      const transportations = await queryTransportations(true);
      setTransportData(transportations);
    } catch (error) {
      console.log("error fetching transport data", error);
      // Other error handling? message?
    }
  };

  const plotRoute = async (curline, lineColor) => {
    let directionsService = new window.google.maps.DirectionsService();

    for (let i = 0; i < curline.length - 1; i++) {
      let start = curline[i];
      let end = curline[i + 1];

      let request = {
        origin: new window.google.maps.LatLng(start[0], start[1]),
        destination: new window.google.maps.LatLng(end[0], end[1]),
        travelMode: window.google.maps.TravelMode.DRIVING,
      };

      directionsService.route(request, function (response, status) {
        if (status === "OK") {
          let directionsRenderer = new window.google.maps.DirectionsRenderer({
            polylineOptions: new window.google.maps.Polyline({
              strokeColor: lineColor,
              strokeOpacity: 0.8,
              strokeWeight: 5,
            }),
            suppressMarkers: true,
          });
          directionsRenderer.setDirections(response);
          directionsRenderer.setMap(map);

          // Create markers at the start and end of each segment
          new window.google.maps.Marker({
            position: new window.google.maps.LatLng(start[0], start[1]),
            map: map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#b3b3b3",
              fillOpacity: 0.8,
              strokeWeight: 0,
            },
          });

          new window.google.maps.Marker({
            position: new window.google.maps.LatLng(end[0], end[1]),
            map: map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#b3b3b3",
              fillOpacity: 0.8,
              strokeWeight: 0,
            },
          });
        } else {
          console.log(
            "Directions request for segment " + i + " failed due to " + status
          );
        }
      });
    }
  };

  return (
    <>
      <div ref={googleMapRef} id="map" />;
    </>
  );
}

export default Map;
