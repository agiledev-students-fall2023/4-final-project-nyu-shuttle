import axios from 'axios';
import { getNextTimes, timeRemaining, getMatchingName } from './stopTimes';
// import {} from './routes';

const MIN_QUERY_DELAY = 300000; // 5 min

let lastQuery = -MIN_QUERY_DELAY;

// Shared variable
if (typeof window.nyushuttle == 'undefined') {
  window.nyushuttle = {};
}
window.nyushuttle.routePoints = {};
window.nyushuttle.stops = {};


window.nyushuttle.routes = [];
let center = {};
let stopMarkers = [];
let routePathMarkers = [];
let routePaths = [];
let stopMarkerCluster = null;
let groupRoutes = false;
let stopMarkerZoomVisibilityTreshold = 13;
let bounds;
let lastZoom = 99;

export async function queryStops() {
  // Prevent too frequent requests (rate limiting)
  if (performance.now() - lastQuery < MIN_QUERY_DELAY) {
    return false;
  }
  const routesData = window.nyushuttle.routesData;
  if (!routesData || routesData === undefined || routesData == null || Object.keys(routesData).length == 0) {
    return false;
  }

  // JSON
  const json = {
    s0: localStorage.agencyId,
    sA: 1,
  };

  const formData = new URLSearchParams({});
  formData.append('json', JSON.stringify(json));

  // Params for URL
  const pos = window.nyushuttle.pos;
  const params = {
    getStops: 2,
    deviceId: localStorage.deviceId,
    withOutdated: 1,
    wBounds: 1,
    buildNo: localStorage.softwareVer,
    showBusInOos: 0,

    // Currently there are no feature supported based on the following data
    lat: undefined,
    lng: undefined,
  };

  const urlParams = new URLSearchParams(params);
  const url = `${localStorage.serviceEndpointHome}/mapGetData.php?${urlParams.toString()}`;

  try {
    const response = await axios.post(url, formData);
    const data = response.data;
    if (!data) {
      throw new Error('empty response');
    }
    window.nyushuttle.routes = data.routes ? data.routes : {};
    window.nyushuttle.routePoints = data.routePoints;
    window.nyushuttle.stops = data.stops;
    groupRoutes = data.groupRoutes;
    center = data.center;
    return true;

  } catch (error) {
    console.log('Transportations query error: ' + error.message);
    return false;
  }
}

export function drawStopMarkers() {
  clearAllMarkers();
  if (!initializeBounds(center)) return;

  const showStopName = isLocalStorageOptionEnabled('optionShowStopname');
  const optionHideStops = isLocalStorageOptionEnabled('optionHideStops');

  if (!optionHideStops) {
    drawRoutes(showStopName);
    drawStops();
  }

  panToBoundsIfNeeded(center);
}

function clearAllMarkers() {
  if (stopMarkerCluster != null) {
    stopMarkerCluster.clearMarkers();
  }
  clearMarkers(stopMarkers, true);
  clearMarkers(routePathMarkers, true);
}

function initializeBounds(center) {
  if (!center) return false;
  bounds = createBoundsFromCenter(center);
  return true;
}

function createBoundsFromCenter(center) {
  const maps = window.google.maps;
  let newBounds = new maps.LatLngBounds();
  newBounds.extend(new maps.LatLng(center.latitude, center.longitude));
  newBounds.extend(new maps.LatLng(center.latitudeMin, center.longitudeMin));
  newBounds.extend(new maps.LatLng(center.latitudeMax, center.longitudeMax));
  return newBounds;
}

function isLocalStorageOptionEnabled(optionName) {
  return localStorage.getItem(optionName) == 1;
}

function clearMarkers(markers, isArray = false) {
  if (isArray) {
    markers.forEach((marker) => marker.setMap(null));
  } else if (markers != null) {
    markers.clearMarkers();
  }
  markers.length = 0;
}

function drawRoutes(showStopName) {
  if (!Object.keys(window.nyushuttle.routes).length) {
    return;
  }
  let clippedRouteIndex = null;
  if (window.nyushuttle.startStopLocation){
    clippedRouteIndex = getClippedRoute()
  }
  const routes = window.nyushuttle.routes;

  Object.keys(routes)
    .filter((routeId) => isSelectedRoute(routeId))
    .forEach((routeId) => {
      drawRoute(routeId, routes[routeId], showStopName, clippedRouteIndex);
    });
}

function drawWalkingRoute(direction) {
  let startLocation, endLocation;
  let request;
  let stops = window.nyushuttle.stops;

  if (direction === 'from') { //plot "from" route
    //becuase for some reason fromLocation.lat and fronLocation.lng are corrupted, use
    //fromLocation.place_id instead
    startLocation = {'placeId':window.nyushuttle.fromLocation.place_id};
    endLocation = {
      lat: stops['ID' + window.nyushuttle.startStopLocation].latitude,
      lng: stops['ID' + window.nyushuttle.startStopLocation].longitude
    };
    request = {
      origin: startLocation,
      destination: endLocation,
      travelMode: 'WALKING',
    };
  } else if (direction === 'to') { //plot "to" route
    endLocation = {'placeId':window.nyushuttle.toLocation.place_id};
    startLocation = {
      lat: stops['ID' + window.nyushuttle.endStopLocation].latitude,
      lng: stops['ID' + window.nyushuttle.endStopLocation].longitude
    };
    request = {
      origin: startLocation,
      destination: endLocation,
      travelMode: 'WALKING',
    };
  }
  let directionsService = new window.google.maps.DirectionsService();
  directionsService.route(request, function (result, status) {
    if (status == 'OK') {
      let directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true // Hides the default markers
      });
      directionsRenderer.setMap(window.nyushuttle.currentMap);
      directionsRenderer.setDirections(result);
  
      // Add custom markers
      if(direction === 'from') {
      const startMarker = new window.google.maps.Marker({
        position: result.routes[0].legs[0].start_location,
        map: window.nyushuttle.currentMap,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#8400a8',
          fillOpacity: 1.0,
          strokeColor: '#FF0000',
          strokeOpacity: 0
        }
      });
    }
    else{
      const endMarker = new window.google.maps.Marker({
        position: result.routes[0].legs[0].end_location,
        map: window.nyushuttle.currentMap,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#8400a8',
          fillOpacity: 1,
          strokeColor: '#',
          strokeOpacity: 0
        }
      });
    }
    }
  });
}

function drawRoute(routeId, route, showStopName, clip=null) {
  const routeGroupId = route[2];
  const routeColor = correctColorFromARGB(route[1]);
  let routePaths = getRoutePaths(routeId);
  if (clip) {
    drawWalkingRoute('from')
    drawWalkingRoute('to')
    routePaths = routePaths.slice(clip[0], clip[1])
    if (routePaths.length == 0){
      if (clip[0] < 100 && clip[1] > 100){
        routePaths = routePaths.concat(routePaths.slice(100, clip[1]))
      }
      else if (clip[0] < 100 && clip[1] < 100){
        routePaths = routePaths[0].slice(clip[0], clip[1])
      }
      else if (clip[0] >= 100 && clip[1] >= 100){
        routePaths = routePaths[1].slice(clip[0], clip[1])
      }

    }
    drawRoutePath(routePaths, routeColor, routeId, routeGroupId);
  }
  else{
    console.log('noclip')
    drawRoutePath(routePaths, routeColor, routeId, routeGroupId);

  }
  
  //   routePaths.forEach((path) => {
  //     updateBoundsWithPoint(path);
  //   });

  if (showStopName) {
    drawStopNamesForRoute(route);
  }
}

function getRoutePaths(routeId) {
  const points = window.nyushuttle.routePoints;
  return points[routeId][0].map((point) => new window.google.maps.LatLng(point.lat, point.lng));
}

function getIndexofStop(r, stopPos) {
  // Logic to get clipped route
  let minDist = 9999
  let index = -1
  console.log('r: ',r)
  for (let i=0;i<r[0].length;i++){
    const dist = window.google.maps.geometry.spherical.computeDistanceBetween(
      new window.google.maps.LatLng(Number(r[0][i].lat), Number(r[0][i].lng)),
      new window.google.maps.LatLng(stopPos.lat, stopPos.lng)
    )
    if (dist < minDist){
      minDist = dist
      index = i
    }
  }
  console.log('index: ',index)
  return index
}

function getClippedRoute() {
  let routeId = window.nyushuttle.routesSelected; // get the selected route id
  let route = window.nyushuttle.routePoints[routeId] // get list of route points
  let originStopId = window.nyushuttle.startStopLocation // get the origin stop id
  let destinationStopId = window.nyushuttle.endStopLocation // get the destination stop id
  let originStop = window.nyushuttle.stops[`ID${originStopId}`] // get the origin stop
  let destinationStop = window.nyushuttle.stops[`ID${destinationStopId}`] // get the destination stop
  let originStopPos = {} // get the origin stop position
  let destinationStopPos = {} // get the destination stop position
  //set the origin and destination stop positions
  originStopPos.lat = originStop.latitude
  originStopPos.lng = originStop.longitude
  destinationStopPos.lat = destinationStop.latitude
  destinationStopPos.lng = destinationStop.longitude
  // get the index of the origin and destination stops
  let originStopIndex = getIndexofStop(route, originStopPos)
  let destinationStopIndex = getIndexofStop(route, destinationStopPos)
  // switch places if origin stop is after destination stop
  if (originStopIndex > destinationStopIndex){
    return [destinationStopIndex, originStopIndex]
  }
  return [originStopIndex, destinationStopIndex]
}

function drawRoutePath(path, routeColor, routeId, routeGroupId) {
  const selected = window.nyushuttle.routesSelected && window.nyushuttle.routesSelected.includes(routeId);
  const opacity = getOpacity(selected);
  const polylineOptions = createPolylineOptions(path, routeColor, opacity, routeId, routeGroupId);
  const polyline = new window.google.maps.Polyline(polylineOptions);
  routePathMarkers.push(polyline);
  polyline.setMap(window.nyushuttle.currentMap);
}

function getOpacity(selected) {
  return selected ? 1.0 : 0.5;
}

function createPolylineOptions(path, routeColor, opacity, routeId, routeGroupId) {
  return {
    path: path,
    visible: true,
    geodesic: false,
    clickable: false,
    strokeColor: routeColor,
    strokeOpacity: opacity,
    strokeWeight: opacity == 1 ? 5 : 2,
    routeId: routeId,
    routeGroupId: routeGroupId,
    icons: [
      {
        icon: getRouteArrow(routeColor, opacity),
        repeat: '200px',
        path: [],
      },
    ],
  };
}

function getRouteArrow(routeColor, opacity) {
  return {
    path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    scale: 3,
    strokeColor: '#ffffff',
    strokeWeight: 0.5,
    fillColor: routeColor,
    fillOpacity: opacity * 0.6,
  };
}

function updateBoundsWithPoint(point) {
  if (bounds == null) bounds = new window.google.maps.LatLngBounds();
  bounds.extend(point);
}

function drawStopNamesForRoute(route) {
  // Logic to draw stop names for the given route
}

function sliceRouteStops(routeStops, stop1, stop2) {
  // Retain the first three elements
  const initialPart = routeStops.slice(0, 3);

  let startIndex = routeStops.findIndex(subarray => subarray[1] === stop1);
  let endIndex = routeStops.findIndex(subarray => subarray[1] === stop2);
  if (startIndex > endIndex) {
    let temp = startIndex;
    startIndex = endIndex;
    endIndex = temp;
  }
  const slicedPart = routeStops.slice(startIndex, endIndex + 1);

  return [...initialPart, ...slicedPart];
}

function drawStops() {
  const stops = window.nyushuttle.stops;
  if (!stops) return;

  const showStopName = isLocalStorageOptionEnabled('optionShowStopname');
  const routes = window.nyushuttle.routes;
  const map = window.nyushuttle.currentMap;

  Object.keys(routes)
    .filter((routeId) => isSelectedRoute(routeId))
    .forEach((routeId) => {
      let routestops = routes[routeId];
      let routeGroupId = routes[routeId][2];
      if (window.nyushuttle.startStopLocation && routestops){
        routestops = sliceRouteStops(routestops, window.nyushuttle.startStopLocation, window.nyushuttle.endStopLocation)
      }
      addRouteMarkersOnMap(routeId, routestops, routeGroupId, showStopName);
    });

  recreateStopMarkerCluster();
  if (stopMarkerCluster != null) {
    stopMarkerCluster.repaint();
    map.addListener('zoom_changed', () => {
      const currentZoom = map.getZoom();
      if (shouldUpdateMarkerVisibility(currentZoom)) {
        updateMarkerVisibility(currentZoom);
        lastZoom = currentZoom;
        stopMarkerCluster.repaint();
      }
    });
  }
}

function addRouteMarkersOnMap(routeId, routestops, routeGroupId, showStopName) {
  const zoomLevel = window.nyushuttle.currentMap.getZoom();
  const routeName = routestops[0];
  const routeColor = correctColorFromARGB(routestops[1]);

  routestops.slice(3).forEach((stop, idx) => {
    const sID = `ID${stop[1]}`;
    const theStop = window.nyushuttle.stops[sID];

    if (isStopValid(theStop)) {
      updateStopData(theStop, stop, routeId, routeGroupId, routeName, routeColor);
      const marker = createMarkerForStop(theStop, zoomLevel, routeColor, showStopName, idx);
      marker.addListener('click', () => onMarkerClick(theStop, marker)); 
      stopMarkers.push(marker);
    }
  });
}

function getCorrespondingRoute(routeIDs) {
  let routes = [];
  if (typeof routeIDs === 'string') {
    routeIDs = [routeIDs];
  }
  for(let i = 0; i < routeIDs.length; i++) {
    let route = routeIDs[i];
    if (route === "44748") {
      routes.push("C");
    } else if(route === "44676") {
      routes.push("A");
    } else if(route === "44753") {
      routes.push("W");
    } else if(route === "44745") {
      routes.push("B");
    } else if(route === "41890") {
      routes.push("CH");
    } else if(route === "44749") {
      routes.push("E");
    } else if(route === "44750") {
      routes.push("F");
    } else if(route === "44752") {
      routes.push("G");
    } else if(route === "44754") {
      routes.push("MP");
    } else if(route === "44755") {
      routes.push("ME");
    } else if(route === "44756") {
      routes.push("MW");
    } else if(route === "44757") {
      routes.push("BL");
    } else if(route === "45769") {
      routes.push("FR");
    }
  }
  return routes;
}

async function onMarkerClick(theStop, marker) {
  const stopName = marker.title; 
  console.log(stopName)
  console.log(theStop.routeIDs)
  const routes = getCorrespondingRoute(theStop.routeIDs);
  console.log(routes)
  let next_times = {};
  for(let i = 0; i < routes.length; i++) {
    if(checkIfInfoisAvailable(routes[i])){
      let route = routes[i];
      const adjustedStopName = await getMatchingName(stopName, route);
      const times = await getNextTimes(encodeURIComponent(adjustedStopName), route);
      next_times[route] = times;
    } else{
      next_times[0] = ["No info available"];
    }
  }
  console.log(next_times);
  displayStopInfo(marker, stopName, next_times);
}

async function displayStopInfo(marker, stopName, next_times){
  const contentString = buildInfoContent(stopName, next_times);
  const infowindow = new window.google.maps.InfoWindow({
    content: contentString,
    ariaLabel: "Uluru",
  });
  infowindow.open(window.google.maps, marker);
}

function buildInfoContent(stopName, next_times) {
  let content = "<div class='info-container'>";
  content += `<p class='stop-name'>${stopName}</p>`;
  
  for (const route in next_times) {
    if (next_times.hasOwnProperty(route)) {
      const times = next_times[route];
      if (times != null && times[0] !== "No info available" && times.length !== 0) {
        const nextThreeTimes = times.slice(0, 3).join(', ');
        content += `<p class='route-info'>Route ${route}: ${nextThreeTimes}</p>`;
      } else if(times[0] === "No info available") {
        content += `<p class='no-times'>No times available for this route. Please check passiogo for available times.</p>`;
      } else {
        content += `<p class='no-shuttles'>Route ${route}: No incoming shuttles at this stop.</p>`;
      }
    }
  }
  content += "</div>";
  return content;
}

function checkIfInfoisAvailable(route_id) {
  if(route_id === "MP" || route_id === "ME" || route_id === "MW" || route_id === "BL" || route_id === "FR" || route_id === "CH"){
    return false; 
  } 
  return true;
}

function isStopValid(stop) {
  return stop && stop.latitude != null && !(stop.latitude === 0.0 && stop.longitude === 0.0);
}

function updateStopData(stop, stopInfo, routeId, routeGroupId, routeName, routeColor) {
  if (!stop.routeIDs) stop.routeIDs = [];
  if (!stop.routeGroupIDs) stop.routeGroupIDs = [];

  if (!isRouteAlreadyRegistered(stop, routeId, routeGroupId)) {
    stop.routeIDs.push(routeId);
    stop.routeGroupIDs.push(routeGroupId);
    Object.assign(stop, {
      position: stopInfo[0],
      stopId: stopInfo[1],
      back: stopInfo[2],
      routeId,
      routeName,
      routeColor,
      markerId: Math.round(Math.random() * 1000000),
    });
  }
}

function isRouteAlreadyRegistered(stop, routeId, routeGroupId) {
  return stop.routeIDs.includes(routeId) || (routeGroupId && stop.routeGroupIDs.includes(routeGroupId));
}

function createMarkerForStop(stop, zoomLevel, routeColor, showStopName, idx) {
  const position = new window.google.maps.LatLng(stop.latitude, stop.longitude);
  const markerOptions = {
    position,
    icon: createStopIcon(routeColor),
    visible: zoomLevel >= stopMarkerZoomVisibilityTreshold,
    zIndex: idx,
    stopId: stop.stopId,
    id: Math.round(Math.random() * 1000000),
    routeId: stop.routeId,
    title: stop.name,
    label: createMarkerLabel(stop.name, showStopName),
  };
  return new window.google.maps.Marker(markerOptions);
}

function createStopIcon(routeColor) {
  return {
    path: window.google.maps.SymbolPath.CIRCLE,
    strokeWeight: 3,
    scale: 7,
    fillColor: '#FFFFFF',
    fillOpacity: 1,
    strokeColor: routeColor,
    strokeOpacity: 1,
    labelOrigin: new window.google.maps.Point(0, 2),
  };
}

function createMarkerLabel(name, showStopName) {
  // Define the label for the marker
  return {
    text: showStopName ? name : ' ',
    color: '#0000ffaa',
    fontSize: '11px',
  };
}

function recreateStopMarkerCluster() {
  // Create a new MarkerClusterer instance
  stopMarkerCluster = new window.MarkerClusterer(window.nyushuttle.currentMap, stopMarkers, {
    imagePath: 'img/pie',
    gridSize: 15,
    showMarkerCount: 0,
    pieView: 1,
    pieSize: 20,
    averageCenter: true,
    zoomOnClick: false,
    showTitle: false,
  });
  window.google.maps.event.addListener(stopMarkerCluster, 'click', onClusterMarkerClick);
}

async function onClusterMarkerClick(cluster) {
  const markers = cluster.getMarkers();
  
  
}

async function displayClusterInfo(markers, stopInfos) {
  let content = "<div class='cluster-info-container'>";

  for (const stopInfo of stopInfos) {
    content += buildClusterInfoContent(stopInfo.stopName, stopInfo.next_times);
  }

  content += "</div>";

  const infowindow = new window.google.maps.InfoWindow({
    content: content,
    ariaLabel: "Cluster Info",
  });

  infowindow.open(window.google.maps, markers[0]); // You might need to adjust this depending on how you want to position the infowindow.
}

function buildClusterInfoContent(stopName, next_times) {
  let content = "<div>";
  content += `<p class='cluster-stop-name'>${stopName}</p>`;
  for (const route in next_times) {
    if (next_times.hasOwnProperty(route)) {
      const times = next_times[route];
      if (times != null && times[0] !== "No info available" && times.length !== 0) {
        const nextThreeTimes = times.slice(0, 3).join(', ');
        content += `<p class='cluster-route-info'>Route ${route}: ${nextThreeTimes}</p>`;
      } else if (times[0] === "No info available") {
        content += `<p class='cluster-no-times'>No times available for this route. Please check passiogo for available times.</p>`;
      } else {
        content += `<p class='cluster-no-shuttles'>Route ${route}: No incoming shuttles at this stop.</p>`;
      }
    }
  }
  content += "</div>";
  return content;
}
function panToBoundsIfNeeded(center) {
  if (bounds && !bounds.isEmpty()) {
    adjustMapZoomAndCenter(center);
  }
}

function adjustMapZoomAndCenter(center) {
  // Logic to adjust map zoom and center
}

function correctColorFromARGB(color) {
  if (!color || color === 'null') {
    return '#000000';
  }

  const match = color.match(/^#([0-9a-f]{8})$/i);
  if (match) {
    return '#' + match[1].substr(2, 6);
  }
  return color;
}

function shouldUpdateMarkerVisibility(currentZoom) {
  return stopMarkers && stopMarkers.length > 0 && isZoomCrossingThreshold(currentZoom, lastZoom);
}

function isZoomCrossingThreshold(currentZoom, lastZoom) {
  return (
    (currentZoom >= stopMarkerZoomVisibilityTreshold && lastZoom < stopMarkerZoomVisibilityTreshold) ||
    (currentZoom < stopMarkerZoomVisibilityTreshold && lastZoom >= stopMarkerZoomVisibilityTreshold) ||
    lastZoom === 99
  );
}

function updateMarkerVisibility(zoomLevel) {
  stopMarkers.forEach((marker) => {
    marker.setVisible(zoomLevel >= stopMarkerZoomVisibilityTreshold);
  });
}

function isSelectedRoute(id) {
  const s = window.nyushuttle.routesSelected;
  return !s || s.length === 0 || s.includes(id);
}