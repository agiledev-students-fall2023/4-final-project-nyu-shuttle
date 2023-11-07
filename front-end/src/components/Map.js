import '../css/map.css'
import { useEffect, useState, useRef } from 'react';

function Map(line) {

    const googleMapRef = useRef(null);
    console.log('Map component loaded');

    function generateTwoUniqueRandomInts(min, max) {
        const firstInt = Math.floor(Math.random() * (max - min + 1)) + min;
        let secondInt = Math.floor(Math.random() * (max - min + 1)) + min;
      
        // Ensure secondInt is different from firstInt
        while (secondInt === firstInt) {
          secondInt = Math.floor(Math.random() * (max - min + 1)) + min;
        }
      
        return [firstInt, secondInt];
      }
      
    const [randomIntOne, randomIntTwo] = generateTwoUniqueRandomInts(0, 9);

    const nycCoordinates = [
        [-73.935242, 40.730610], // Manhattan
        [-73.944158, 40.678178], // Brooklyn
        [-73.794851, 40.728224], // Queens
        [-73.977622, 40.789142], // Upper West Side, Manhattan
        [-73.939202, 40.752998], // Astoria, Queens
        [-73.990338, 40.735781], // Greenwich Village, Manhattan
        [-74.005941, 40.712784], // Lower Manhattan
        [-73.949997, 40.650002], // Crown Heights, Brooklyn
        [-73.870229, 40.773750], // Flushing, Queens
        [-73.963548, 40.779437], // Upper East Side, Manhattan
        // ... Add more as needed
      ];
    

    const [startLoc , setStartLoc] = useState(nycCoordinates[randomIntOne]);
    const [endLoc, setEndLoc] = useState(nycCoordinates[randomIntTwo]);
    
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
        if (!startLoc || !endLoc || !map) return;
        console.log('----------------------------');
        console.log('line changed');
        console.log(line);
        console.log('startLoc' + startLoc);
        console.log('endLoc' + endLoc);
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
        let start = new google.maps.LatLng(startLoc[1], startLoc[0]);
        let end = new google.maps.LatLng(endLoc[1], endLoc[0]);
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