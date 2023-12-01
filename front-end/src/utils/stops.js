import axios from 'axios';
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
  const routes = window.nyushuttle.routes;
  Object.keys(routes)
    .filter((routeId) => isSelectedRoute(routeId))
    .forEach((routeId) => {
      drawRoute(routeId, routes[routeId], showStopName);
    });
}

function drawRoute(routeId, route, showStopName) {
  const routeGroupId = route[2];
  const routeColor = correctColorFromARGB(route[1]);
  const routePaths = getRoutePaths(routeId);

  drawRoutePath(routePaths, routeColor, routeId, routeGroupId);
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
      // marker.addListener('click', onMarkerClick);
      // marker.addListener('mouseover', onMarkerHover);
      stopMarkers.push(marker);
    }
  });
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

  // Add event listeners to the marker cluster
  //   window.google.maps.event.addListener(stopMarkerCluster, 'click', onClusterMarkerClick);
  //   window.google.maps.event.addListener(stopMarkerCluster, 'mouseover', onClusterMarkerHover);
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
