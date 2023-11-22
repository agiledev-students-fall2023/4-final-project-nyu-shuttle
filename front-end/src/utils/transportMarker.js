const MAX_ANIMATION_DURATION = 7000;

const busIcons = ['A', 'B', 'C', 'E', 'F', 'G', 'W', 'Cobble Hill'];



export function updateTransportMarkers(transportData, markerRef, map) {
  if (!transportData) {
    return;
  }

  // Remove old markers if they are no longer in the new data
  for (const transportId in markerRef.current) {
    if (!transportData.hasOwnProperty(transportId)) {
      markerRef.current[transportId].setMap(null);
      delete markerRef.current[transportId];
    }
  }

  // Process new and existing transport data
  Object.keys(transportData).forEach((transport) => {
    const transportInfo = transportData[transport][0];
    const lat = parseFloat(transportInfo.latitude);
    const lng = parseFloat(transportInfo.longitude);
    const newPosition = new window.google.maps.LatLng(lat, lng);
    const newIcon = generateTransportMarkerIcon(transportInfo.color, transportInfo.calculatedCourse);

    if (markerRef.current[transport]) {
      // Update the position of the existing marker
      const currentPosition = markerRef.current[transport].getPosition();
      animateMarker(markerRef.current[transport], currentPosition, newPosition, MAX_ANIMATION_DURATION);

      // Update the icon of the existing marker
      markerRef.current[transport].setIcon(newIcon);
    } else {
      // Create a new marker
      let route = transportData[transport][0].route; // get last char of route
      let routeChar = route.slice(-1); 
      if (route === 'Ferry Route') { routeChar = 'Ferry_Route'; }
      else if (route === 'Cobble Hill') { routeChar = 'Cobble_Hill'; }
      let transportMarker = createTransportMarker(newPosition, transportData[transport][0], map, routeChar);
      markerRef.current[transport] = transportMarker;
    }
  });
}

function createTransportMarker(position, transportInfo, map, route) {
  if(route === 'Ferry_Route'){ console.log('ferry'); }

function createTransportMarker(position, transportInfo, map) {
  let transportMarker = new window.google.maps.Marker({
    position,
    map,
    title: String(transportInfo.busId),
    icon: {
      url: 'busIcons/busIcon_route'+route+'.png',
      scaledSize: new window.google.maps.Size(30, 30),
    },
  });

  let infowindow = new window.google.maps.InfoWindow({
    content: `<div><strong>No.${transportInfo.busId}</strong><br>Line: ${transportInfo.route}<br>Passengers: ${transportInfo.paxLoad}</div>`,
    icon: generateTransportMarkerIcon(transportInfo.color || '#000', transportInfo.calculatedCourse || 0),
  });

  transportMarker.addListener('click', () => {
    infowindow.open(map, transportMarker);
    console.log(transportInfo); // tansportation info
  });

  return transportMarker;
}

}

// Generate custom transport marker icon (currently only support buses)
// Original source of bus svg path: www.svgrepo.com
function generateTransportMarkerIcon(color, direction) {
  const svg = `<?xml version="1.0" encoding="utf-8"?>
  <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
    <g class="layer" transform="rotate(${direction}, 12, 12)">
      <path d="M10,11 L14,11 Q12,5 10,11 z" fill="${color}" transform="translate(0, -7)"/>
    </g>
    <g class="layer">
      <g class="layer">
        <circle cx="12" cy="12" fill="${color}" r="9"/>
        <circle cx="12" cy="12" fill="#fff" r="8"/>
        <path clip-rule="evenodd" d="M7.5 16.63c0 .2.17.37.38.37h.81a.38.38 0 0 0 .36-.32l.2-1.18h5.5l.2 1.18a.38.38 0 0 0 .36.32h.82a.38.38 0 0 0 .37-.37V11l.39-.39a.38.38 0 0 0 .11-.27v-.97a.38.38 0 0 0-.37-.37h-.13v-.5c0-.58-.41-1.09-.98-1.19C14.65 7.17 13.32 7 12 7c-1.32 0-2.65.17-3.52.32-.58.09-.98.6-.98 1.18V9h-.13a.38.38 0 0 0-.37.38v.97c0 .1.04.19.11.26l.39.39v5.63zm2.5-3.38a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm4.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zM8.5 8.57v2.93h7V8.57a.37.37 0 0 0-.32-.36A26.46 26.46 0 0 0 12 7.99c-1.3 0-2.6.14-3.18.22a.36.36 0 0 0-.32.36z" fill="${color}" fill-rule="evenodd"/>
      </g>
    </g>
  </svg>`;
  const icon = {
    url: 'data:image/svg+xml;charset=UTF-8;base64,' + btoa(svg),
    scaledSize: new window.google.maps.Size(40, 40),
  };
  return icon;
}

function animateMarker(marker, startPosition, endPosition, minBusQueryInterval) {
  const distanceThreshold = { min: 10, max: 300 };
  const dynamicDuration = minBusQueryInterval + 2000;

  const distance = window.google.maps.geometry.spherical.computeDistanceBetween(startPosition, endPosition);

  if (distance < distanceThreshold.min || distance > distanceThreshold.max) {
    marker.setPosition(endPosition);
  } else {
    let startTime = null;

    const easeOutQuad = (t) => t * (2 - t);

    const animate = (currentTime) => {
      if (!startTime) {
        startTime = currentTime;
      }

      const elapsedTime = currentTime - startTime;
      let progress = elapsedTime / dynamicDuration;
      progress = easeOutQuad(Math.min(1, progress));

      if (progress < 1) {
        const nextPosition = window.google.maps.geometry.spherical.interpolate(startPosition, endPosition, progress);
        marker.setPosition(nextPosition);
        window.requestAnimationFrame(animate);
      } else {
        marker.setPosition(endPosition);
      }
    };

    window.requestAnimationFrame(animate);
  }
}

export default updateTransportMarkers;
