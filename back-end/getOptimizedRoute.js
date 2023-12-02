//this function creates a directed circular graph representation of of bus stops and the routes.
/*in the output graph, the key represents a bus stop, and the value represents all the bus stops that 
are directly reachavble from the key bus stop.*/
async function createGraph(routes, busstops) {
    let graph = {};
    // Initialize the graph with all stops and an empty list of routes
    for (let stop in busstops) {
        let stopKey = busstops[stop].toString();
        graph[stopKey] = { routes: [], connections: [] };
    }

    for (let routeId in routes) {
        let stops = routes[routeId];
        for (let i = 0; i < stops.length; i++) {
            let currentStop = stops[i];
            let nextStop = stops[(i + 1) % stops.length];
            let currentKey = currentStop.toString();

            // Add the current route to the list of routes for this stop
            if (!graph[currentKey].routes.includes(routeId)) {
                graph[currentKey].routes.push(routeId);
            }

            // Add the connection information
            graph[currentKey].connections.push({ coordinates: nextStop, route: graph[currentKey].routes });
        }
    }
    return graph;
}

function getEuclideanDistance (a, b) {
    let x1 = a[0];
    let y1 = a[1];
    let x2 = b.split(',')[0];
    let y2 = b.split(',')[1];
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}

//find bus stops that are relatively close in term of walking distance
async function findAllReachableStops(graph, origin, threshold=0.01) {

    let resolvedGraph = await graph; // Waits for the graph Promise to resolve

    let reachableStops = [];
    for (let busstop in resolvedGraph) {
        busstop = busstop.toString();
        let distance = getEuclideanDistance(origin, busstop);
        if (distance < threshold) {
            console.log('reachable stop found: ' + resolvedGraph[busstop].routes);
            reachableStops.push({ coordinates: busstop, route: resolvedGraph[busstop].route });
        }
    }

    return reachableStops;   
}


// return walking distance from point A to point B
async function getWalkingDistance(origin, destination) {
    try{
        origin = origin.join('%2C');
    }
    catch(err){
        origin = origin.split(',').join('%2C');
    }
    
    try{
        destination = destination.split(',').join('%2C');
    }
    catch(err){
        destination = destination.join('%2C');
    }
    let res = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origin}&destinations=${destination}&key=${process.env.EXPRESS_APP_MAP_API_KEY}`)
    let data = await res.json();
    res = data.rows[0].elements[0].duration.value;
    return res;
}

async function isOnSameRoute(graph, stop1, stop2, routes, busstops) {
    let resolvedGraph = await graph;
    let sharedRoutes = await resolvedGraph[stop1.coordinates].routes.filter(element => resolvedGraph[stop2.coordinates].routes.includes(element));
    console.log('shared routes: '+sharedRoutes)
    if(sharedRoutes.length == 0){
        return false;
    }
    console.log('returned true')
    console.log('shared routes length: '+sharedRoutes.length)
    return sharedRoutes;
}

async function findOptimalRoute(graph, routes, busstops, origin_lat, origin_lng, destination_lat, destination_lng) {
    let origin = [origin_lat, origin_lng];
    let destination = [destination_lat, destination_lng];
    let minTotalDistance = Number.MAX_VALUE;
    let optimalRoute = null;
    // Find all reachable stops from origin and destination
    let reachableFromOrigin = await findAllReachableStops(graph, origin);
    console.log('reachable from origin: '+reachableFromOrigin, reachableFromOrigin);

    let reachableFromDestination = await findAllReachableStops(graph, destination);
    console.log('reachable from desination: '+reachableFromDestination[0].coordinates, reachableFromDestination[0].coordinates);
    for (let stop of reachableFromOrigin) {
        console.log(stop.coordinates)
    }
    // Calculate route distances
    for (let originStop of reachableFromOrigin) {
        for (let destinationStop of reachableFromDestination) {
            let onSameRoute = await isOnSameRoute(graph, originStop, destinationStop, routes, busstops);
            console.log('on same route result: '+onSameRoute)
            if (onSameRoute.length > 0) {
                console.log('----------------------------------')
                let distanceToOriginStop = await getWalkingDistance(origin, originStop.coordinates);
                let distanceFromDestinationStop = await getWalkingDistance(destinationStop.coordinates, destination);

                let totalDistance = distanceToOriginStop + distanceFromDestinationStop;
                console.log('total', totalDistance)
                console.log('fetched from Google Maps API, total distance: '+totalDistance);
                console.log('----------------------------------')
                // Check if this route is better than the current best
                if (totalDistance < minTotalDistance) {
                    console.log('new optimal route found')
                    minTotalDistance = totalDistance;
                    optimalRoute = { originStop, destinationStop, onSameRoute };
                }
            }
        }
    }
    console.log('optimal route: '+optimalRoute.onSameRoute);
    console.log('origin stop: '+optimalRoute.originStop.coordinates);
    console.log('destination stop: '+optimalRoute.destinationStop.coordinates);

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