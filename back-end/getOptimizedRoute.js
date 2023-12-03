//this function creates a directed circular graph representation of of bus stops and the routes.
/*in the output graph, the key represents a bus stop, and the value represents all the bus stops that 
are directly reachavble from the key bus stop.*/
async function createGraph(routes, busStops) {
    let graph = {};

    // Initialize the graph with all stops and an empty list of routes
    for (let stopKey in busStops) {
        graph[stopKey] = { routes: [], connections: [], stopId: busStops[stopKey].stopId, geoLoc: busStops[stopKey].geoLoc };
    }

    for (let routeId in routes) {
        let stops = routes[routeId];
        for (let i = 0; i < stops.length; i++) {
            let currentStopId = stops[i].stopId;
            let nextStopId = stops[(i + 1) % stops.length].stopId;

            // Add the current route to the list of routes for this stop
            if (!graph[currentStopId].routes.includes(routeId)) {
                graph[currentStopId].routes.push(routeId);
            }

            // Add the connection information
            // Assuming that you only need the next stop's ID
            graph[currentStopId].connections.push({ stopId: nextStopId, coordinates: stops[i].geoLoc });
        }
    }
    return graph;
}

function getEuclideanDistance (a, b) {
    let x1 = a[0];
    let y1 = a[1];
    let x2;
    let y2;
    try{
        x2 = b.split(',')[0];
        y2 = b.split(',')[1];
    }
    catch(err){
        x2 = b[0];
        y2 = b[1];
    }
    console.log('x1: '+x1+', y1: '+y1+', x2: '+x2+', y2: '+y2)

    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}

//find bus stops that are relatively close in term of walking distance
async function findAllReachableStops(graph, origin, threshold=0.009, maxThreshold=0.1) {

    let resolvedGraph = await graph; // Waits for the graph Promise to resolve
    console.log('resolvedGraph:',Object.keys(resolvedGraph))
    let reachableStops = [];
    for (let busstop in resolvedGraph) {
        console.log('geoloc:', resolvedGraph[busstop].geoLoc)
        let geoLoc = resolvedGraph[busstop].geoLoc;
        let busstopId = resolvedGraph[busstop].stopId;
        let distance = getEuclideanDistance(origin, geoLoc);
        console.log('distance: '+distance)
        if (distance < threshold) {
            console.log('reachable stop found for: '+ origin + ', ' + resolvedGraph[busstop].routes);
            reachableStops.push({ coordinates: geoLoc, route: resolvedGraph[busstop].routes, stopId: busstopId });
        }
    }
    //when no stops are found, keep calling itself with larger and larger threshold
    if (reachableStops.length == 0 && threshold < maxThreshold) {
        console.log('no reachable stop found, increasing threshold');
        reachableStops = findAllReachableStops(graph, origin, threshold + 0.002)
    }

    return reachableStops;   
}


// return walking distance from point A to point B
async function getWalkingDistance(origin, destination) {
    try{
        origin = origin.join('%2C');
        destination = destination.split(',').join('%2C');
        
    }
    catch(err){
        origin = origin.split(',').join('%2C');
        destination = destination.join('%2C');
    }

    let res = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origin}&destinations=${destination}&key=${process.env.EXPRESS_APP_MAP_API_KEY}`)
    let data = await res.json();
    res = data.rows[0].elements[0].duration.value;
    return res;
}

async function isOnSameRoute(graph, stop1, stop2, routes, busstops) {
    let resolvedGraph = await graph;
    console.log(Object.keys(resolvedGraph))
    let sharedRoutes = await resolvedGraph[stop1.stopId].routes.filter(element => resolvedGraph[stop2.stopId].routes.includes(element));
    if(sharedRoutes.length == 0){
        return false;
    }
    return sharedRoutes;
}

async function findOptimalRoute(graph, routes, busstops, origin_lat, origin_lng, destination_lat, destination_lng) {
    let origin = [origin_lat, origin_lng];
    let destination = [destination_lat, destination_lng];
    let minTotalDistance = Number.MAX_VALUE;
    let optimalRoute = null;
    // Find all reachable stops from origin and destination
    let reachableFromOrigin = await findAllReachableStops(graph, origin);

    let reachableFromDestination = await findAllReachableStops(graph, destination);
    console.log('TOTAL REACHABLE STOPS: '+Number(reachableFromOrigin.length + reachableFromDestination.length))
    // Calculate route distances
    for (let originStop of reachableFromOrigin) {
        for (let destinationStop of reachableFromDestination) {
            let onSameRoute = await isOnSameRoute(graph, originStop, destinationStop, routes, busstops);
            console.log('on same route result: '+onSameRoute)
            if (onSameRoute.length > 0) {
                let distanceToOriginStop
                let distanceFromDestinationStop
                let totalDistance
                console.log('TOTAL REACHABLE STOPS2: '+reachableFromOrigin.length + reachableFromDestination.length)
                if (Number(reachableFromOrigin.length + reachableFromDestination.length) < 15){

                    distanceToOriginStop = await getWalkingDistance(origin, originStop.coordinates);
                    distanceFromDestinationStop = await getWalkingDistance(destinationStop.coordinates, destination);
                    totalDistance = distanceToOriginStop + distanceFromDestinationStop;
                    console.log('fetched from Google Maps API, total distance: '+totalDistance);

                }
                else{
                    distanceToOriginStop = await getEuclideanDistance(origin, originStop.coordinates);
                    distanceFromDestinationStop = await getEuclideanDistance(destinationStop.coordinates, destination);
                    totalDistance = distanceToOriginStop + distanceFromDestinationStop;
                    console.log('getting euclidean distance, total distance: '+totalDistance);

                }
                    
                 
                // Check if this route is better than the current best
                if (totalDistance < minTotalDistance) {
                    console.log('new optimal route found')
                    minTotalDistance = totalDistance;
                    optimalRoute = { origin, originStop, destination, destinationStop, onSameRoute };
                }
            }

        }
    }
   
    if (optimalRoute === null) {
        console.log('no optimal route found')
        return null;
    }
    console.log('-------------------------------------')
    console.log('optimal route: '+optimalRoute.onSameRoute);
    console.log('origin stop location: '+optimalRoute.originStop.coordinates);
    console.log('destination stop location: '+optimalRoute.destinationStop.coordinates);
    
    return optimalRoute;
}

module.exports = {
    createGraph,
    getEuclideanDistance,
    findAllReachableStops,
    getWalkingDistance,
    isOnSameRoute,
    findOptimalRoute
}