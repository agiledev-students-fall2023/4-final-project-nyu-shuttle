import axios from 'axios';

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

// Shared variable
if (typeof window.nyushuttle == 'undefined') {
  window.nyushuttle = {};
}

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
