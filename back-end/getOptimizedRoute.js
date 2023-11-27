//this function creates a directed circular graph representation of of bus stops and the routes.
/*in the output graph, the key represents a bus stop, and the value represents all the bus stops that 
are directly reachavble from the key bus stop.*/
function createGraph(routes) {
    let graph = {};
    for (let routeId in routes) {
        let stops = routes[routeId];
        for ( let i = 0; i < stops.length; i++) {
            let currentStop = stops[i];
            let nextStop = stops[(i + 1) % stops.length];
            let currentKey = currentStop.toString();

            if (!graph[currentKey]) {
                graph[currentKey] = [];
            }
            graph[currentKey].push({ coordinates: nextStop, route: routeId });

        }
    }
    return graph;
}

function getEuclideanDistance (origin, destination) {
    let x1 = origin.split(',')[0];
    let y1 = origin.split(',')[1];
    let x2 = destination.split(',')[0];
    let y2 = destination.split(',')[1];
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}

//find bus stops that are relatively close in term of walking distance
function findAllReachableStops(graph, origin, threshold=0.013) {
    let reachableStops = [];
    for (busstop in graph){
        busstop = busstop.toString();
        let distance = getEuclideanDistance(busstop, origin);
        if (distance < threshold) {
            console.log('reachable stop found: '+graph[busstop][0].route);
            reachableStops.push({coordinates: busstop, route: graph[busstop][0].route});
        }
    }

    return reachableStops;

}
// return walking distance from point A to point B
async function getWalkingDistance(origin, destination) {
    origin = origin.split(',').join('%2C');
    destination = destination.split(',').join('%2C');
    let res = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origin}&destinations=${destination}&key=${process.env.EXPRESS_APP_MAP_API_KEY}`)
    let data = await res.json();
    res = data.rows[0].elements[0].duration.value;
    return res;
}

function isOnSameRoute(stop1, stop2) {
    console.log(stop1.route);
    return stop1.route === stop2.route;
}

async function findOptimalRoute(graph, origin, destination) {
    let minTotalDistance = Number.MAX_VALUE;
    let optimalRoute = null;

    // Find all reachable stops from origin and destination
    let reachableFromOrigin = findAllReachableStops(graph, origin);
    let reachableFromDestination = findAllReachableStops(graph, destination);

    // Calculate route distances
    for (let originStop of reachableFromOrigin) {
        for (let destinationStop of reachableFromDestination) {
            if (isOnSameRoute(originStop, destinationStop)) {
                let distanceToOriginStop = await getWalkingDistance(origin, originStop.coordinates);
                let distanceFromDestinationStop = await getWalkingDistance(destinationStop.coordinates, destination);

                let totalDistance = distanceToOriginStop + distanceFromDestinationStop;
                console.log('fetched from Google Maps API, total distance: '+totalDistance);
                console.log('----------------------------------')
                // Check if this route is better than the current best
                if (totalDistance < minTotalDistance) {
                    minTotalDistance = totalDistance;
                    optimalRoute = { originStop, destinationStop };
                }
            }
        }
    }
    console.log('optimal route: '+optimalRoute.originStop.route);
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