const MAX_ANIMATION_DURATION = 7000;

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
    let lat = parseFloat(transportData[transport][0].latitude);
    let lng = parseFloat(transportData[transport][0].longitude);
    const newPosition = new window.google.maps.LatLng(lat, lng);

    if (markerRef.current[transport]) {
      const currentPosition = markerRef.current[transport].getPosition();
      animateMarker(markerRef.current[transport], currentPosition, newPosition, MAX_ANIMATION_DURATION);
    } else {
      // Create a new marker
      let transportMarker = createTransportMarker(newPosition, transportData[transport][0], map);
      markerRef.current[transport] = transportMarker;
    }
  });
}

function createTransportMarker(position, transportInfo, map) {
  let transportMarker = new window.google.maps.Marker({
    position,
    map,
    title: String(transportInfo.busId),
    icon: {
      url: 'busIcon.png',
      scaledSize: new window.google.maps.Size(30, 30),
    },
  });

  let infowindow = new window.google.maps.InfoWindow({
    content: `<div><strong>No.${transportInfo.busId}</strong><br>Line: ${transportInfo.bus}</div>`,
  });

  transportMarker.addListener('click', () => {
    infowindow.open(map, transportMarker);
    console.log(transportInfo); // tansportation info
  });

  return transportMarker;
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