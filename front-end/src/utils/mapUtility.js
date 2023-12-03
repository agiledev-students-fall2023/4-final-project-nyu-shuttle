import axios from 'axios';
import currentPositionSpriteSheet from '../images/mylocation-sprite-2x.png';

const MAP_OPTIONS = {
  disableDefaultUI: true, // This disables the default UI including mapTypeControl
  zoomControl: true, // Re-enables zoom control
  streetViewControl: false,
  clickableIcons: false,
};

const SIMPLE_MAP = [
  {
    featureType: 'all',
    stylers: [{ saturation: -20 }],
  },
  {
    elementType: 'labels',
    stylers: [{ lightness: 25 }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
];

const POSITION_WATCH_OPTIONs = {
  enableHighAccuracy: true,
  maximumAge: 3000,
};

const API_BASE = 'https://maps.googleapis.com/maps/api/js';
const API_KEY = process.env.REACT_APP_MAP_API_KEY;
const API_LIBRARIES = ['geometry', 'places'];
const CALLBACK_NAME = 'gmapAPICallback';
const POS_DEFAULT = [40.716503, -73.976077];
const CURRENT_POSITION_Z_INDEX = 500;
const MAX_ACCURACY_DESCRIPTION = 200;
const LOCATION_CONTROL = document.createElement('div');
const LOCATION_BUTTON = document.createElement('button');
const LOCATION_ICON = document.createElement('div');
const LOCATION_ZOOM_LEVEL = 16;

// Shared variable
if (typeof window.nyushuttle == 'undefined') {
  window.nyushuttle = {};
}
window.nyushuttle.location = {};
initLocationButton();

export function loadGoogleMapsAPI(callback) {
  let c = typeof callback == 'function' ? callback : () => {};

  if (!window.google || !window.google.maps) {
    window.gmapAPICallback = () => c(true);

    const script = document.createElement('script');
    script.src = API_BASE + `?key=${API_KEY}&libraries=${API_LIBRARIES.join(',')}&callback=${CALLBACK_NAME}`;
    script.async = true;
    document.head.appendChild(script);
  } else {
    c(true);
  }
}

export function initializeMap(mapRef, setIsMapLoaded, setMap) {
  const center = localStorage.center ? localStorage.center.split(',') : POS_DEFAULT;
  const googleMap = new window.google.maps.Map(mapRef.current, {
    center: new window.google.maps.LatLng(...center),
    zoom: 13,
    styles: SIMPLE_MAP,
    options: MAP_OPTIONS,
  });
  setMap(googleMap);
  window.nyushuttle.currentMap = googleMap;

  window.google.maps.event.addListenerOnce(googleMap, 'tilesloaded', () => {
    setIsMapLoaded(true);
  });
}

export async function getMapCenter() {
  const url = new URL('mapGetData.php', localStorage.serviceEndpointSub);
  url.search = new URLSearchParams({
    getSystems: '2',
    sortMode: '1',
    deviceId: '0',
    credentials: '1',
    acronymId: localStorage.agencyId,
  }).toString();

  try {
    const response = await axios.get(url);
    const data = response.data;
    const pos = data && data.lat && data.lng ? `${data.lat},${data.lng}` : POS_DEFAULT.join(',');
    localStorage.center = pos;
  } catch (error) {
    console.error('Error fetching systems:', error);
  }
}

export function addLocationButton(map) {
  const maps = window.google.maps;
  map.controls[maps.ControlPosition.RIGHT_BOTTOM].push(LOCATION_CONTROL);

  // If location is already enabled
  if (window.nyushuttle.location.watchId) {
    LOCATION_ICON.style.backgroundPosition = '-224px 0px';
    onLocationGet(window.nyushuttle.location.lastPos, null);
  }
}

function initLocationButton() {
  const control = LOCATION_CONTROL;
  const locationButton = LOCATION_BUTTON;
  const locationIcon = LOCATION_ICON;

  locationButton.classList.add('locationButton');
  locationButton.title = 'Current Location';
  control.appendChild(locationButton);

  locationIcon.id = 'locationIcon';
  locationIcon.style.backgroundImage = `url('${currentPositionSpriteSheet}')`;
  locationButton.appendChild(locationIcon);

  locationButton.addEventListener('click', () => onLocationButtonClick());

  control.index = 1;
}

function onLocationButtonClick() {
  if (!window.nyushuttle.location.watchId) {
    let imgX = '0';
    const animationInterval = setInterval(() => {
      imgX = imgX === '0' ? '-28' : '0';
      LOCATION_ICON.style.backgroundPosition = `${imgX}px 0px`;
    }, 500);

    const onSuccess = (pos) => {
      onLocationGet(pos, animationInterval);
      console.log('Position:', pos);
    };

    const onError = (err) => {
      clearInterval(animationInterval);
      LOCATION_ICON.style.backgroundPosition = '0px 0px';
      console.error('navigator.geolocation watchPosition error');
      window.alert(`ERROR(${err.code}): ${err.message}`);
    };

    const onNotSupport = () => {
      clearInterval(animationInterval);
      LOCATION_ICON.style.backgroundPosition = '0px 0px';
      console.error('navigator.geolocation not supported');
      window.alert("Your browser doesn't support geolocation.");
    };

    watchCurrentPosition(onSuccess, onError, onNotSupport);
  }

  const lastPos = window.nyushuttle.location.lastPos;
  if (lastPos) {
    const center = new window.google.maps.LatLng(lastPos.coords.latitude, lastPos.coords.longitude);
    window.nyushuttle.currentMap.setCenter(center);
    window.nyushuttle.currentMap.setZoom(LOCATION_ZOOM_LEVEL);
  }
}

function onLocationGet(pos, animationInterval) {
  const map = window.nyushuttle.currentMap;
  const maps = window.google.maps;
  const latlng = new maps.LatLng(pos.coords.latitude, pos.coords.longitude);
  const accuracy = Math.min(pos.coords.accuracy, MAX_ACCURACY_DESCRIPTION); // TODO: if accuracy > MAX_ACCURACY_DESCRIPTION, mark currentpos marker gray

  if (!window.nyushuttle.location.lastPos) {
    map.setCenter(latlng);
    map.setZoom(LOCATION_ZOOM_LEVEL);
  }
  window.nyushuttle.location.lastPos = pos;

  // initCurrentPositionAccuracyIndicator(map, latlng, accuracy);
  // const indicator = currentPositionAccuracyIndicator;
  // indicator.setPosition(latlng);
  // indicator.setIcon(createCurrentPositionAccuracyIndicator(map, latlng, accuracy));

  clearInterval(animationInterval);

  recreateAccuracyIndicator(map, latlng, accuracy);
  recreateCurrentPositionMarker(map, latlng);

  LOCATION_ICON.style.backgroundPosition = '-224px 0px';
}

// https://stackoverflow.com/a/24554579
// function initCurrentPositionAccuracyIndicator(map, position, accuracy) {
//   if (currentPositionAccuracyIndicator) {
//     return;
//   }
//   const maps = window.google.maps;
//   currentPositionAccuracyIndicator = createCurrentPositionAccuracyIndicator(map, position, accuracy);

//   map.addListener('zoom_changed', () => {
//     const latlng = new maps.LatLng(window.nyushuttle.location.lastPos.coords.latitude, window.nyushuttle.location.lastPos.coords.longitude);
//     const accuracy = window.nyushuttle.location.lastPos.coords.accuracy;
//     currentPositionAccuracyIndicator.setMap(null);
//     currentPositionAccuracyIndicator = createCurrentPositionAccuracyIndicator(lastMap, latlng, accuracy);
//   });
// }

// function createCurrentPositionAccuracyIndicator(map, position, accuracy) {
//   const maps = window.google.maps;
//   const zoom = map.getZoom();
//   const scale = getScale(position, zoom + 1); //meters per pixel
//   const diameter = accuracy / scale;

//   const icon = {
//     path: maps.SymbolPath.CIRCLE,
//     scale: diameter / 2,
//     strokeColor: '#CC0000',
//     strokeOpacity: 0.8,
//     strokeWeight: 2,
//     fillColor: '#CC0000',
//     fillOpacity: 0.35,
//   };

//   const indicator = new maps.Marker({
//     position,
//     map,
//     icon,
//     zIndex: ACCURACY_INDICATOR_Z_INDEX,
//   });

//   return indicator;
// }

// function getScale(latLng, zoom) {
//   return (156543.03392 * Math.cos((latLng.lat() * Math.PI) / 180)) / Math.pow(2, zoom);
// }

function recreateAccuracyIndicator(map, center, accuracy) {
  const prevIndicator = window.nyushuttle.location.accuracyIndicator;
  if (prevIndicator) {
    prevIndicator.setMap(map);
    prevIndicator.setCenter(center);
    prevIndicator.setRadius(accuracy);
    return;
  }

  const maps = window.google.maps;
  const indicator = new maps.Circle({
    map,
    center,
    radius: accuracy,
    strokeColor: '#4285F4',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#4285F4',
    fillOpacity: 0.35,
    optimized: true,
  });

  window.nyushuttle.location.accuracyIndicator = indicator;
}

function recreateCurrentPositionMarker(map, position) {
  const prevPositionMarker = window.nyushuttle.location.currentPositionMarker;
  if (prevPositionMarker) {
    prevPositionMarker.setMap(map);
    prevPositionMarker.setPosition(position);
    return;
  }
  const maps = window.google.maps;
  const icon = {
    url: 'data:image/png;base64,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',
    size: new maps.Size(32, 32),
    anchor: new maps.Point(16, 16),
  };

  const marker = new window.google.maps.Marker({
    map,
    position,
    icon,
    zIndex: CURRENT_POSITION_Z_INDEX,
  });

  window.nyushuttle.location.currentPositionMarker = marker;
}

export function getCurrentPosition(onSuccess, onError, onNotSupport) {
  if (navigator.geolocation) {
    const s = typeof onSuccess == 'function' ? onSuccess : () => {};
    const e = typeof onError == 'function' ? onError : () => {};
    navigator.geolocation.getCurrentPosition((pos) => s(pos), e);
  } else {
    const ns = typeof onNotSupport == 'function' ? onNotSupport : () => {};
    ns();
  }
}

function watchCurrentPosition(onSuccess, onError, onNotSupport) {
  if (navigator.geolocation) {
    const locationManager = window.nyushuttle.location;
    const s = typeof onSuccess == 'function' ? onSuccess : () => {};
    const e = typeof onError == 'function' ? onError : () => {};
    if (locationManager.watchId) {
      navigator.geolocation.clearWatch(locationManager.watchId);
      delete locationManager.watchId;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        locationManager.watchId = watchId;
        s(pos);
      },
      (err) => {
        e(err);
      },
      POSITION_WATCH_OPTIONs
    );
  } else {
    const ns = typeof onNotSupport == 'function' ? onNotSupport : () => {};
    ns();
  }
}
