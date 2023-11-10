import '../css/map.css'
import { useEffect, useState, useRef } from 'react';

function Map(line) {

    const googleMapRef = useRef(null);
    const markerRef = useRef({});

    console.log('Map component loaded');
    const [busData, setBusData] = useState(null);



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
        google.maps.event.addListenerOnce(googleMap, 'tilesloaded', () => {
          fetchBusData(googleMap); // Fetch bus data after the map tiles have loaded, otherwise busses might be added before the map is initialized, which causes an error
        });
        // fetch bus data every 10 seconds
        const getBusInterval = setInterval(() => {
          fetchBusData(map);
        }, 10000);
        return () => {
          clearInterval(getBusInterval); // stop fetching when map component is unmounted
        };
      }, []);

    //update map when line changes
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

      const fetchBusData = async (Gmap) => {
        try {
            console.log('fetching bus data');
            const response = await fetch('/buses');
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            else{
              console.log('response ok');
            }
            console.log(response);
            const busData = await response.json();
            setBusData(busData);
            console.log('bus data fetched');
            console.log(Object.keys(busData));
            if (busData){
              Object.keys(busData).forEach((bus) => {
                  //get latitute and longitude of each bus
                  let lat = parseFloat(busData[bus][0].latitude)
                  let lng = parseFloat(busData[bus][0].longitude)
                  console.log('lat: ' + lat + ' lng: ' + lng)
                  let busMarker = new google.maps.Marker({
                    position: new google.maps.LatLng(lat, lng),
                    map: Gmap,
                    title: String(busData[bus][0].busId),
                    icon: {
                        url:'busIcon.png',
                        scaledSize: new google.maps.Size(30, 30),
                    }
                  })
                  let infowindow = new google.maps.InfoWindow({
                    content: `<div><strong>No.${busData[bus][0].busId}</strong><br>Line: ${busData[bus][0].bus}</div>` // Example content
                  });
                  busMarker.addListener('click', () => {
                    infowindow.open(Gmap, busMarker);
                  });
    
                })
              }
              else
              {
                console.log('bus data not loaded');
              }
        } catch (error) {
            console.log('error fetching bus data');
            console.log(error);
        }
      };
  
  

    return (
        <>
            <div ref={googleMapRef} id='map'/>;
        </>
    )
}

export default Map;