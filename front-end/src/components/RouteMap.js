import React, { useEffect, useRef } from "react";
import "../css/routeMap.css";

function RouteMap({ location1, location2 }) {
  const mapRef = useRef(null);

  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
  };

  useEffect(() => {
    const google = window.google;
    const geocoder = new google.maps.Geocoder();
    const map = new google.maps.Map(mapRef.current, {
      ...mapOptions,
      center: new google.maps.LatLng(37.7699298, -122.4469157),
      zoom: 13,
    });

    const geocodeLocation = (location) => {
      const { name, address } = location;
      geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results[0]) {
          const location = results[0].geometry.location;
          new google.maps.Marker({
            position: location,
            map,
            title: name,
          });
        } else {
          console.error("Geocoding failed for " + name);
        }
      });
    };
    geocodeLocation(location1);
    geocodeLocation(location2);

    const bounds = new google.maps.LatLngBounds();
    geocodeLocation(location1);
    geocodeLocation(location2);

    geocoder.geocode({ address: location1.address }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results[0]) {
        bounds.extend(results[0].geometry.location);
        map.fitBounds(bounds);
      }
    });
    geocoder.geocode({ address: location2.address }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results[0]) {
        bounds.extend(results[0].geometry.location);
        map.fitBounds(bounds);
      }
    });
  }, [location1, location2]);

  return <div ref={mapRef} className="route_map"></div>;
}

export default RouteMap;
