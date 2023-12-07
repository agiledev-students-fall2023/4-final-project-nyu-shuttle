import axios from 'axios';
import { getNextTimes, timeRemaining, getMatchingName } from './stopTimes';
// import {} from './routes';

const VISUALIZE_ANIMATION_DELAY = 1000;
const MAX_REACHABLE_DISTANCE = 1500; // 1500m?
const MIN_QUERY_DELAY = 300000; // 5 min

let lastQuery = -MIN_QUERY_DELAY;

// Shared variable
if (typeof window.nyushuttle == 'undefined') {
  window.nyushuttle = {};
}
window.nyushuttle.routePoints = {};
window.nyushuttle.stops = {};
window.nyushuttle.navigation = {
  walks: [],
};

window.nyushuttle.routes = [];
let center = {};
let stopMarkers = [];
let routePathMarkers = [];
let routePaths = [];
let navigationRouteObjects = [];
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

  const sharedVar = window.nyushuttle;
  if (sharedVar.navigating) {
    const from = { lat: sharedVar.fromLocation.lat, lng: sharedVar.fromLocation.lng };
    const to = { lat: sharedVar.toLocation.lat, lng: sharedVar.toLocation.lng };
    drawNavigationRoute(from, to, sharedVar.routesSelected[0]);
  }

  panToBoundsIfNeeded(center);
}

export function drawNavigationRoute(from, to, routeId) {
  if (!window.nyushuttle.navigating) {
    return;
  }
  clearAllMarkers();
  clearMarkers(navigationRouteObjects, true);

  const fromStop = getNearestStopInRoute(from, routeId);
  const toStop = getNearestStopInRoute(to, routeId);
  const fromStopPos = getStopLatLng(fromStop);
  const toStopPos = getStopLatLng(toStop);

  if (!(fromStop || toStop)) {
    console.error(`no stops available nearby (< ${MAX_REACHABLE_DISTANCE})`);
    return;
  }

  // draw walking routes
  getWalkingRoute(from, fromStopPos).then((result) => {
    drawWalkingRoute(result, false);
    drawWalkingRouteGaps(result); // fill the gap between walking routes and the transportation subroute
    window.nyushuttle.navigation.walks.push(result); // share walking related data
  });
  getWalkingRoute(toStopPos, to).then((result) => {
    drawWalkingRoute(result, true);
    drawWalkingRouteGaps(result);
    window.nyushuttle.navigation.walks.push(result);
  });

  // draw a transportation subroute
  const subroute = getRoutePointsBetweenStops(`ID${fromStop.stopId}`, `ID${toStop.stopId}`, routeId);
  // visualizeRoutePoints(subroute); // DEBUG ONLY
  drawRoutePointsPath(routeId, subroute);

  // fill the gap between routes and stops
  drawBasicPolyline(fromStopPos, subroute[0]);
  drawBasicPolyline(subroute[subroute.length - 1], toStopPos);

  // draw from and to marker
  drawFromAndToMarker(from, to);
}

function drawWalkingRouteGaps(directionsResult) {
  const originLocationObj = directionsResult.request.origin.location;
  const originPos = getObjectLatLng(originLocationObj);

  const destinationLocationObj = directionsResult.request.destination.location;
  const destinationPos = getObjectLatLng(destinationLocationObj);

  const overviewPath = directionsResult.routes[0].overview_path;
  const entryPos = getObjectLatLng(overviewPath[0]);
  const exitPos = getObjectLatLng(overviewPath[overviewPath.length - 1]);

  drawBasicPolyline(originPos, entryPos);
  drawBasicPolyline(exitPos, destinationPos);
}

function getObjectLatLng(obj) {
  if (!(obj || obj.lat || obj.lng || typeof obj.lat === 'function' || typeof obj.lng === 'function')) {
    return;
  }
  return { lat: obj.lat(), lng: obj.lng() };
}

// TODO: customize visuals?
function drawWalkingRoute(directionsResult, preserveViewport = false) {
  const maps = window.google.maps;
  const directionsRenderer = new maps.DirectionsRenderer({
    suppressMarkers: true, // Hides the default markers
    preserveViewport,
  });

  directionsRenderer.setMap(window.nyushuttle.currentMap);
  directionsRenderer.setDirections(directionsResult);
  navigationRouteObjects.push(directionsRenderer);
}

// Get walking route using the API
// both from and to receives { lat: 0, lng: 0 }
// TODO: use time data ?
async function getWalkingRoute(from, to) {
  const maps = window.google.maps;
  const directionsService = new maps.DirectionsService();
  const request = {
    origin: from,
    destination: to,
    travelMode: 'WALKING',
  };

  return new Promise((resolve, reject) => {
    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        resolve(result);
      } else {
        console.error('Directions request failed: ' + status);
        reject();
      }
    });
  });
}

// draws polyline based on route data
// routePoints optional if drawing full route
function drawRoutePointsPath(routeId, routePoints) {
  let isSubRoute = true;
  const sharedVar = window.nyushuttle;
  if (!(sharedVar.routes && sharedVar.routePoints && sharedVar.currentMap)) {
    console.error('map, routes or route points unavailable.');
    return;
  }
  if (typeof routePoints === 'undefined') {
    routePoints = sharedVar.routePoints[routeId][0];
    isSubRoute = false;
  }

  const path = reformatLatLngArray(routePoints);
  const routeColor = correctColorFromARGB(sharedVar.routes[routeId][1]);
  const routeGroupId = sharedVar.routes[routeId][2];
  const selected = window.nyushuttle.routesSelected && window.nyushuttle.routesSelected.includes(routeId);
  const opacity = getOpacity(selected || isSubRoute);

  const polylineOptions = createPolylineOptions(path, routeColor, opacity, routeId, routeGroupId);
  const polyline = new window.google.maps.Polyline(polylineOptions);
  polyline.setMap(sharedVar.currentMap);
  navigationRouteObjects.push(polyline);
}

// both from and to receives { lat: 0, lng: 0 }
function drawFromAndToMarker(from, to) {
  const maps = window.google.maps;
  const fromMarker = new maps.Marker({
    position: from,
    map: window.nyushuttle.currentMap,
    icon: '/img/directions_measle-2-medium.png',
    anchor: new maps.Point(8.5, 8.5),
  });

  const toMarker = new maps.Marker({
    position: to,
    map: window.nyushuttle.currentMap,
    icon: '/img/directions_destination_measle-2-medium.png',
    anchor: new maps.Point(10, 10),
  });

  navigationRouteObjects.push(fromMarker);
  navigationRouteObjects.push(toMarker);
}

// https://stackoverflow.com/a/12499474
// Get perpendicular intersection point
// point1 and point2 creates a line
// point3 is a point
function findPerpendicularIntersection(point1, point2, point3) {
  const x1 = point1.lat;
  const y1 = point1.lng;
  const x2 = point2.lat;
  const y2 = point2.lng;
  const x3 = point3.lat;
  const y3 = point3.lng;

  const px = x2 - x1;
  const py = y2 - y1;
  const dAB = px * px + py * py;

  // Check for division by zero
  if (dAB === 0) {
    console.error('Error: dAB is zero, points A and B are the same.');
    return null;
  }

  const u = ((x3 - x1) * px + (y3 - y1) * py) / dAB;
  const x = x1 + u * px;
  const y = y1 + u * py;

  return { lat: x, lng: y };
}

// returns rough distance considering the direction of the transportation moving
// both from and to receive stopIds (IDXXXXXX)
function getRoughDistanceBetweenStops(from, to, routeId) {
  const maps = window.google.maps;
  const subRoutePath = getRoutePointsBetweenStops(from, to, routeId);
  let totalDistance = 0;

  for (let i = 0; i < subRoutePath.length - 1; i++) {
    const distance = maps.geometry.spherical.computeDistanceBetween(
      new maps.LatLng(subRoutePath[i]),
      new maps.LatLng(subRoutePath[i + 1])
    );
    totalDistance += distance;
  }
  return totalDistance;
}

// both from and to receive stopIds (IDXXXXXX)
function getRoutePointsBetweenStops(from, to, routeId) {
  const stops = window.nyushuttle.stops;
  const fullRoutePath = window.nyushuttle.routePoints[routeId][0];
  let f = getNearestPositionInArray(getStopLatLng(stops[from]), fullRoutePath);
  let t = getNearestPositionInArray(getStopLatLng(stops[to]), fullRoutePath);

  let subRoutePath;
  if (f.index < t.index) {
    // regular
    subRoutePath = fullRoutePath.slice(f.index, t.index + 1);
  } else {
    // wrap around
    const fromToEnd = fullRoutePath.slice(f.index, -1);
    const startToTo = fullRoutePath.slice(0, t.index + 1);

    subRoutePath = [...fromToEnd, ...startToTo];
  }

  // experimental feature: alternative position data to smooth navigation path drawing
  subRoutePath = f.altPos && f.distance > f.altDistance ? [f.altPos, ...subRoutePath.slice(1)] : subRoutePath;
  subRoutePath = t.altPos && t.distance > t.altDistance ? [...subRoutePath.slice(0, -1), t.altPos] : subRoutePath;

  return reformatLatLngArray(subRoutePath);
}

// receives { lat: 0, lng: 0 } and routeId
// returns a child object of window.nyushuttle.stops that is nearest
// however, if its distance is greater than MAX_REACHABLE_DISTANCE, returns null
function getNearestStopInRoute(measureFrom, routeId) {
  const stops = window.nyushuttle.stops;
  const filteredStops = getRouteStopIds(routeId);

  const positions = filteredStops.map((key) => getStopLatLng(stops[key]));

  const nearest = getNearestPositionInArray(measureFrom, positions);
  // console.log(nearest.distance); // DEBUG

  return nearest.distance <= MAX_REACHABLE_DISTANCE ? stops[filteredStops[nearest.index]] : null;
}

// receives { lat: 0, lng: 0 } and [{ lat: 1, lng: 1 }, ...]
// returns { index of the nearest position, distance }
// also returns alternative position and its distance
function getNearestPositionInArray(measureFrom, positionArray) {
  const maps = window.google.maps;
  measureFrom = reformatLatLng(measureFrom);
  positionArray = reformatLatLngArray(positionArray);
  let minDistance = Infinity;
  let secondMinDistance = Infinity;
  let minDistanceIndex = -1;
  let secondMinDistanceIndex = -1;

  for (let i = 0; i < positionArray.length; i++) {
    const distance = maps.geometry.spherical.computeDistanceBetween(
      new maps.LatLng(positionArray[i]),
      new maps.LatLng(measureFrom)
    );
    if (distance < minDistance) {
      secondMinDistance = minDistance;
      minDistance = distance;
      secondMinDistanceIndex = minDistanceIndex;
      minDistanceIndex = i;
    }
  }

  if (secondMinDistanceIndex < 0) {
    return {
      index: minDistanceIndex,
      distance: minDistance,
    };
  }

  // alternative position (for stop to route path drawing)
  const alternativePos = findPerpendicularIntersection(
    positionArray[minDistanceIndex],
    positionArray[secondMinDistanceIndex],
    measureFrom
  );

  const alternativeDistance = maps.geometry.spherical.computeDistanceBetween(
    new maps.LatLng(alternativePos),
    new maps.LatLng(measureFrom)
  );

  return {
    index: minDistanceIndex,
    distance: minDistance,
    altPos: alternativePos,
    altDistance: alternativeDistance,
  };
}

// Visualize how route points are plotted on map
// routePathArray = [{ lat: 0, lng: 0 }, ...]
function visualizeRoutePoints(routePathArray) {
  let delay = VISUALIZE_ANIMATION_DELAY;
  routePathArray.forEach((pos) => {
    setTimeout(() => {
      drawBasicMarker(pos);
    }, delay);
    delay += VISUALIZE_ANIMATION_DELAY;
  });
}

// pos = { lat: 0, lng: 0 }
function drawBasicMarker(pos) {
  new window.google.maps.Marker({
    position: reformatLatLng(pos),
    map: window.nyushuttle.currentMap,
  });
}

// { lat: '0', lng: '0' } to { lat: 0, lng: 0 }
function drawBasicPolyline(from, to) {
  const basicPolyline = new window.google.maps.Polyline({
    path: [reformatLatLng(from), reformatLatLng(to)],
    map: window.nyushuttle.currentMap,
    strokeWeight: 5,
  });
  navigationRouteObjects.push(basicPolyline);
}

// { lat: '0', lng: '0' } to { lat: 0, lng: 0 }
function reformatLatLng(unformatted) {
  return { lat: Number(unformatted.lat), lng: Number(unformatted.lng) };
}

// array version of reformatLatLng()
function reformatLatLngArray(unformattedArray) {
  return unformattedArray.map((unformatted) => reformatLatLng(unformatted));
}

// receives stop object and returns latlng in { lat: 0, lng: 0 } format
function getStopLatLng(stop) {
  return reformatLatLng({ lat: stop.latitude, lng: stop.longitude });
}

// get an array of stop(Id)s that are in a given route(Id)
function getRouteStopIds(routeId) {
  const routeData = window.nyushuttle.routes;
  if (!routeData[routeId]) {
    return [];
  }

  const stopIds = new Set(
    routeData[routeId].filter((item) => Array.isArray(item) && item.length >= 2).map((item) => item[1])
  );

  return Array.from(stopIds).map((id) => 'ID' + id);
}

function clearAllMarkers() {
  if (stopMarkerCluster != null) {
    stopMarkerCluster.clearMarkers();
  }
  clearMarkers(stopMarkers, true);
  clearMarkers(routePathMarkers, true);
  clearMarkers(navigationRouteObjects, true);
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
  const routes = window.nyushuttle.routes;
  Object.keys(routes)
    .filter((routeId) => isSelectedRoute(routeId))
    .forEach((routeId) => {
      drawRoutePointsPath(routeId);
    });
}

// function drawWalkingRoute(direction) {
//   let startLocation, endLocation;
//   let request;
//   let stops = window.nyushuttle.stops;

//   if (direction === 'from') {
//     //plot "from" route
//     //becuase for some reason fromLocation.lat and fronLocation.lng are corrupted, use
//     //fromLocation.place_id instead
//     startLocation = { placeId: window.nyushuttle.fromLocation.place_id };
//     endLocation = {
//       lat: stops['ID' + window.nyushuttle.startStopLocation].latitude,
//       lng: stops['ID' + window.nyushuttle.startStopLocation].longitude,
//     };
//     request = {
//       origin: startLocation,
//       destination: endLocation,
//       travelMode: 'WALKING',
//     };
//   } else if (direction === 'to') {
//     //plot "to" route
//     endLocation = { placeId: window.nyushuttle.toLocation.place_id };
//     startLocation = {
//       lat: stops['ID' + window.nyushuttle.endStopLocation].latitude,
//       lng: stops['ID' + window.nyushuttle.endStopLocation].longitude,
//     };
//     request = {
//       origin: startLocation,
//       destination: endLocation,
//       travelMode: 'WALKING',
//     };
//   }
//   let directionsService = new window.google.maps.DirectionsService();
//   directionsService.route(request, function (result, status) {
//     if (status == 'OK') {
//       let directionsRenderer = new window.google.maps.DirectionsRenderer({
//         suppressMarkers: true, // Hides the default markers
//       });
//       directionsRenderer.setMap(window.nyushuttle.currentMap);
//       directionsRenderer.setDirections(result);

//       // Add custom markers
//       if (direction === 'from') {
//         const startMarker = new window.google.maps.Marker({
//           position: result.routes[0].legs[0].start_location,
//           map: window.nyushuttle.currentMap,
//           icon: {
//             path: window.google.maps.SymbolPath.CIRCLE,
//             scale: 7,
//             fillColor: '#8400a8',
//             fillOpacity: 1.0,
//             strokeColor: '#FF0000',
//             strokeOpacity: 0,
//           },
//         });
//       } else {
//         const endMarker = new window.google.maps.Marker({
//           position: result.routes[0].legs[0].end_location,
//           map: window.nyushuttle.currentMap,
//           icon: {
//             path: window.google.maps.SymbolPath.CIRCLE,
//             scale: 7,
//             fillColor: '#8400a8',
//             fillOpacity: 1,
//             strokeColor: '#',
//             strokeOpacity: 0,
//           },
//         });
//       }
//     }
//   });
// }

// function drawRoute(routeId, route, showStopName) {
//   const routeGroupId = route[2];
//   const routeColor = correctColorFromARGB(route[1]);
//   const routePaths = getRoutePaths(routeId);

//   drawRoutePath(routePaths, routeColor, routeId, routeGroupId);
//   //   routePaths.forEach((path) => {
//   //     updateBoundsWithPoint(path);
//   //   });

//   if (showStopName) {
//     drawStopNamesForRoute(route);
//   }
// }

// function getRoutePaths(routeId) {
//   const points = window.nyushuttle.routePoints;
//   return points[routeId][0].map((point) => new window.google.maps.LatLng(point.lat, point.lng));
// }

// function getIndexofStop(r, stopPos) {
//   // Logic to get clipped route
//   let minDist = 9999;
//   let index = -1;
//   console.log('r: ', r);
//   for (let i = 0; i < r[0].length; i++) {
//     const dist = window.google.maps.geometry.spherical.computeDistanceBetween(
//       new window.google.maps.LatLng(Number(r[0][i].lat), Number(r[0][i].lng)),
//       new window.google.maps.LatLng(stopPos.lat, stopPos.lng)
//     );
//     if (dist < minDist) {
//       minDist = dist;
//       index = i;
//     }
//   }
//   console.log('index: ', index);
//   return index;
// }

// function getClippedRoute() {
//   let routeId = window.nyushuttle.routesSelected; // get the selected route id
//   let route = window.nyushuttle.routePoints[routeId]; // get list of route points
//   let originStopId = window.nyushuttle.startStopLocation; // get the origin stop id
//   let destinationStopId = window.nyushuttle.endStopLocation; // get the destination stop id
//   let originStop = window.nyushuttle.stops[`ID${originStopId}`]; // get the origin stop
//   let destinationStop = window.nyushuttle.stops[`ID${destinationStopId}`]; // get the destination stop
//   let originStopPos = {}; // get the origin stop position
//   let destinationStopPos = {}; // get the destination stop position
//   //set the origin and destination stop positions
//   originStopPos.lat = originStop.latitude;
//   originStopPos.lng = originStop.longitude;
//   destinationStopPos.lat = destinationStop.latitude;
//   destinationStopPos.lng = destinationStop.longitude;
//   // get the index of the origin and destination stops
//   let originStopIndex = getIndexofStop(route, originStopPos);
//   let destinationStopIndex = getIndexofStop(route, destinationStopPos);
//   // switch places if origin stop is after destination stop
//   if (originStopIndex > destinationStopIndex) {
//     return [destinationStopIndex, originStopIndex];
//   }
//   return [originStopIndex, destinationStopIndex];
// }

// function drawRoutePath(path, routeColor, routeId, routeGroupId, container=routePathMarkers) {
//   const selected = window.nyushuttle.routesSelected && window.nyushuttle.routesSelected.includes(routeId);
//   const opacity = getOpacity(selected);
//   const polylineOptions = createPolylineOptions(path, routeColor, opacity, routeId, routeGroupId);
//   const polyline = new window.google.maps.Polyline(polylineOptions);
//   container.push(polyline);
//   polyline.setMap(window.nyushuttle.currentMap);
// }

function getOpacity(selected) {
  return selected ? 1.0 : 0.5;
}

function createPolylineOptions(path, routeColor, opacity, routeId, routeGroupId) {
  return {
    map: window.nyushuttle.currentMap,
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

// function sliceRouteStops(routeStops, stop1, stop2) {
//   // Retain the first three elements
//   const initialPart = routeStops.slice(0, 3);

//   let startIndex = routeStops.findIndex((subarray) => subarray[1] === stop1);
//   let endIndex = routeStops.findIndex((subarray) => subarray[1] === stop2);
//   if (startIndex > endIndex) {
//     let temp = startIndex;
//     startIndex = endIndex;
//     endIndex = temp;
//   }
//   const slicedPart = routeStops.slice(startIndex, endIndex + 1);

//   return [...initialPart, ...slicedPart];
// }

function drawStops() {
  const stops = window.nyushuttle.stops;
  if (!stops) return;

  const showStopName = isLocalStorageOptionEnabled('optionShowStopname');
  const routes = window.nyushuttle.routes;
  const map = window.nyushuttle.currentMap;

  Object.keys(routes)
    .filter((routeId) => isSelectedRoute(routeId))
    .forEach((routeId) => {
      const routestops = routes[routeId];
      const routeGroupId = routes[routeId][2];

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

/////////////////////
function addRouteMarkersOnMap(routeId, routestops, routeGroupId, showStopName) {
  const zoomLevel = window.nyushuttle.currentMap.getZoom();
  const routeName = routestops[0];
  const routeColor = correctColorFromARGB(routestops[1]);

  getRouteStopIds(routeId).forEach((sID, idx) => {
    const theStop = window.nyushuttle.stops[sID];

    if (isStopValid(theStop)) {
      updateStopData(theStop, idx, routeId, routeGroupId, routeName, routeColor);
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

  let anyRouteSelected = false;

  for (let i = 0; i < routeIDs.length; i++) {
    const route = routeIDs[i];
    if (isSelectedRoute(route)) {
      const translatedRoute = translateRoute(route);
      routes.push(translatedRoute);
      anyRouteSelected = true;
    }
  }

  if (!anyRouteSelected) {
    for (let i = 0; i < routeIDs.length; i++) {
      const route = routeIDs[i];
      const translatedRoute = translateRoute(route);
      routes.push(translatedRoute);
    }
  }

  return routes;
}


function translateRoute(routeID) {
  switch (routeID) {
    case '44748':
      return 'C';
    case '44676':
      return 'A';
    case '44753':
      return 'W'; 
    case '44745':
      return 'B';
    case '41890':
      return 'CH';
    case '44749':
      return 'E';
    case '44750':
      return 'F';
    case '44752':
      return 'G';
    case '44754':
      return 'MP';
    case '44755':
      return 'ME';
    case '44756':
      return 'MW';
    case '44757':
      return 'BL';
    case '45769':
      return 'FR';
    default:
      return routeID;
  }
}

async function onMarkerClick(theStop, marker) {
  const stopName = marker.title;
  const routes = getCorrespondingRoute(theStop.routeIDs);
  let next_times = {};
  for (let i = 0; i < routes.length; i++) {
    if (checkIfInfoisAvailable(routes[i])) {
      let route = routes[i];
      const adjustedStopName = await getMatchingName(stopName, route);
      const times = await getNextTimes(encodeURIComponent(adjustedStopName), route);
      next_times[route] = times;
    } else {
      next_times[0] = ['No info available'];
    }
  }
  console.log(next_times);
  displayStopInfo(marker, stopName, next_times);
}

async function displayStopInfo(marker, stopName, next_times) {
  const contentString = buildInfoContent(stopName, next_times, marker.color);
  const infowindow = new window.google.maps.InfoWindow({
    content: contentString,
    ariaLabel: 'Uluru',
  });
  infowindow.open(window.google.maps, marker);
}

function buildInfoContent(stopName, next_times, textColor) {
  let content = '<div class="bg-gray-100 p-4 rounded-lg shadow-md">';
  content += `<p class="text-md font-bold mb-4" style="color: ${textColor}">${stopName}</p>`;
  for (const route in next_times) {
    if (next_times.hasOwnProperty(route)) {
      const times = next_times[route];
      if (times != null && times[0] !== 'No info available' && times.length !== 0) {
        const top3Times = times.slice(0, 3);
        content += `<p class="mb-2 font-bold"><span class="font-bold" style="color: ${textColor}" >Route ${route}:</span> ${top3Times.join(', ')}</p>`;
      } else if (times[0] === 'No info available') {
        content += `<p class="mb-2 text-red-500">No times available for this route. Please check Passiogo for available times.</p>`;
      } else {
        content += `<p class="mb-2"><span class="font-bold">Route ${route}:</span> No incoming shuttles at this stop.</p>`;
      }
    }
  }
  content += '</div>';
  return content;
}


function checkIfInfoisAvailable(route_id) {
  if (
    route_id === 'MP' ||
    route_id === 'ME' ||
    route_id === 'MW' ||
    route_id === 'BL' ||
    route_id === 'FR' ||
    route_id === 'CH'
  ) {
    return false;
  }
  return true;
}

function isStopValid(stop) {
  return stop && stop.latitude != null && !(stop.latitude === 0.0 && stop.longitude === 0.0);
}

function updateStopData(stop, position, routeId, routeGroupId, routeName, routeColor) {
  if (!stop.routeIDs) stop.routeIDs = [];
  if (!stop.routeGroupIDs) stop.routeGroupIDs = [];

  if (!isRouteAlreadyRegistered(stop, routeId, routeGroupId)) {
    stop.routeIDs.push(routeId);
    stop.routeGroupIDs.push(routeGroupId);
    Object.assign(stop, {
      position,
      stopId: stop.id,
      back: stop.back,
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
    color: routeColor,
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
    map: window.nyushuttle.currentMap,
  });
  // Add event listeners to the marker cluster
  //stopMarkerCluster.addListener('click', () => onClusterMarkerClick(stopMarkerCluster));
  window.google.maps.event.addListener(stopMarkerCluster, 'click', onClusterMarkerClick);
  //window.google.maps.event.addListener(stopMarkerCluster, 'mouseover', onClusterMarkerHover);
}

/*
async function onClusterMarkerClick(cluster){
  const marker = cluster.getMarkers();
  console.log(marker);
}
*/


async function onClusterMarkerClick(cluster) {
  const markers = cluster.getMarkers()
  if (markers) {
    const marker = markers[0];
    const sID = marker.stopId;
    const stopName = window.nyushuttle.stops["ID"+sID]
    clusterProcess(stopName, marker, cluster);
  }
}

async function clusterProcess(the_Stop, marker_a, cluster) {
  const stop_Name = marker_a.title;
  const routes_a = getCorrespondingRoute(the_Stop.routeIDs);
  let next_times_a = {};
  for (let i = 0; i < routes_a.length; i++) {
    if (checkIfInfoisAvailable(routes_a[i])) {
      let route_a = routes_a[i];
      const adjustedStopName = await getMatchingName(stop_Name, route_a);
      const times = await getNextTimes(encodeURIComponent(adjustedStopName), route_a);
      next_times_a[route_a] = times;
    } else {
      next_times_a[0] = ['No info available'];
    }
  }
  console.log(next_times_a);
  displayStopInfo_a(marker_a, stop_Name, next_times_a, cluster);
}

async function displayStopInfo_a(marker_a, stop_Name, next_times, cluster) {
  const contentString = buildInfoContent(stop_Name, next_times);
  const infowindow = new window.google.maps.InfoWindow({
    content: contentString,
    ariaLabel: 'Uluru',
  });
  const mapInstance = marker_a.getMap();
  if (mapInstance) {
    infowindow.setPosition(marker_a.getPosition());
    infowindow.open(mapInstance, marker_a);
  } else {
    if (cluster && cluster.getMap()) {
      infowindow.setPosition(marker_a.getPosition());
      infowindow.open(cluster.getMap(), marker_a);
    } else {
      console.error("Marker does not have a valid map instance.");
    }
  }
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