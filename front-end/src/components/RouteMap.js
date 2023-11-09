import React, { useEffect, useRef } from "react";
import "../css/routeMap.css";  

function RouteMap({ location1, location2 }) {
  const mapRef = useRef(null);

  const mapOptions = {
    disableDefaultUI: true, // This disables the default UI including mapTypeControl
    zoomControl: true, // Re-enables zoom control
  };

  useEffect(() => {
    const google = window.google;
    const geocoder = new google.maps.Geocoder();
    const map = new google.maps.Map(mapRef.current, {
        options: mapOptions,
        center: new window.google.maps.LatLng(37.7699298, -122.4469157),
        zoom: 10,
    });

    const geocodeLocation = (locationName) => {
      geocoder.geocode({ address: locationName }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results[0]) {
          const location = results[0].geometry.location;
          new google.maps.Marker({
            position: location,
            map,
            title: locationName,
          });
          if (locationName === location1 || locationName === location2) {
            map.setCenter(location);
          }
        } else {
          console.error("Geocoding failed for " + locationName);
        }
      });
    };
    geocodeLocation(location1);
    geocodeLocation(location2);
  }, [location1, location2]);
  return <div ref={mapRef} id="route-map" style={{ width: "100%", height: "300px" }}></div>;
}

export default RouteMap;