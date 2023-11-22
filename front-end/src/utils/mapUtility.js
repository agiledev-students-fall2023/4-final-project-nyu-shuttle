import axios from 'axios';

const nycCoordinates = [
  [-73.935242, 40.73061], // Manhattan
  [-73.944158, 40.678178], // Brooklyn
  [-73.794851, 40.728224], // Queens
  [-73.977622, 40.789142], // Upper West Side, Manhattan
  [-73.939202, 40.752998], // Astoria, Queens
  [-73.990338, 40.735781], // Greenwich Village, Manhattan
  [-74.005941, 40.712784], // Lower Manhattan
  [-73.949997, 40.650002], // Crown Heights, Brooklyn
  [-73.870229, 40.77375], // Flushing, Queens
  [-73.963548, 40.779437], // Upper East Side, Manhattan
  // ... Add more as needed
];

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

const API_BASE = 'https://maps.googleapis.com/maps/api/js';
const API_KEY = process.env.REACT_APP_MAP_API_KEY;
const API_LIBRARIES = ['geometry', 'places'];
const CALLBACK_NAME = 'gmapAPICallback';
const POS_DEFAULT = [40.716503, -73.976077];

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

  window.google.maps.event.addListenerOnce(googleMap, 'tilesloaded', () => {
    setIsMapLoaded(true);
  });
}

export async function getUserPos() {
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

export function getCoordinates() {
  return nycCoordinates;
}

export function generateTwoUniqueRandomInts(min, max) {
  const firstInt = Math.floor(Math.random() * (max - min + 1)) + min;
  let secondInt = Math.floor(Math.random() * (max - min + 1)) + min;

  // Ensure secondInt is different from firstInt
  while (secondInt === firstInt) {
    secondInt = Math.floor(Math.random() * (max - min + 1)) + min;
  }

  return [firstInt, secondInt];
}
