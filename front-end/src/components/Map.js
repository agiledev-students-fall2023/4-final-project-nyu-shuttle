import '../css/map.css'
import { useEffect, useState, useRef } from 'react';

function Map(line) {
    const [startLoc , setStartLoc] = useState([40.7295, -73.9939]);
    const [endLoc, setEndLoc] = useState([40.6944, -73.9866]);
    const googleMapRef = useRef(null);
    console.log('Map component loaded');


    //get google from window object !!!important!!!
    const google = window.google;
    const [map, setMap] = useState(null);

    const mapOptions = {
        disableDefaultUI: true, // This disables the default UI including mapTypeControl
        zoomControl: true, // Re-enables zoom control
      };
    
    //initialize map on component load
    useEffect(() => {
        const googleMap = initGoogleMap();
        setMap(googleMap);
      }, []);

    useEffect(() => {
        //wait for map to return
        console.log('----------------------------');
        console.log('line changed');
        console.log(line);
        console.log('----------------------------');
        
        let directionsService = new google.maps.DirectionsService();
        let directionsRenderer = new google.maps.DirectionsRenderer(
            {
                polylineOptions: new window.google.maps.Polyline({
                    strokeColor: line['lineColor'],
                    strokeOpacity: 0.8,
                    strokeWeight: 5,
            }
        )});
        //set start and end location
        let start = new google.maps.LatLng(startLoc[0], startLoc[1]);
        let end = new google.maps.LatLng(endLoc[0], endLoc[1]);
        //request settings
        let request = {
          origin: start,
          destination: end,
          travelMode: 'WALKING',
        };
        directionsService.route(request, function (response, status) {
          if (status === 'OK') {
            directionsRenderer.setDirections(response);
            directionsRenderer.setMap(map);
          }
        });
      }, [map, line]);

      const initGoogleMap = () => {
        return new window.google.maps.Map(googleMapRef.current, {
          center: new window.google.maps.LatLng(37.7699298, -122.4469157),
          zoom: 8,
          options: mapOptions,
        });
      };

    return (
        <>
            <div ref={googleMapRef} id='map'/>;
        </>
    )
}

export default Map;