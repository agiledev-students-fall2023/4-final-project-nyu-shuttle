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
    const position = new window.google.maps.LatLng(lat, lng);

    if (markerRef.current[transport]) {
      // Update the position of the existing marker
      markerRef.current[transport].setPosition(position);
    } else {
      // Create a new marker
      let transportMarker = createTransportMarker(position, transportData[transport][0], map);
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
  });

  return transportMarker;
}

export default updateTransportMarkers;
