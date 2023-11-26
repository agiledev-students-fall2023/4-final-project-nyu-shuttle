// import and instantiate express
const express = require('express'); // CommonJS import style!
const app = express(); // instantiate an Express object
require('dotenv').config();
// we will put some server logic here later...

const cors = require('cors');
app.use(cors());

module.exports = app;

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
            reachableStops.push({coordinates: busstop});
        }
    }

    return reachableStops;

}

async function getWalkingDistance(origin, destination) {
    origin = origin.split(',').join('%2C');
    destination = destination.split(',').join('%2C');
    let res = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origin}&destinations=${destination}&key=${process.env.EXPRESS_APP_MAP_API_KEY}`)
    let data = await res.json();
    res = data.rows[0].elements[0].duration.value;
    let originName = data.origin_addresses[0];
    let destinationName = data.destination_addresses[0];
    return res;
}

function isOnSameRoute(stop1, stop2) {
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
                    optimalRoute = { originStop, destinationStop, route: originStop.route };
                }
            }
        }
    }
    console.log('optimal route: '+optimalRoute.route);
    console.log('origin stop: '+optimalRoute.originStop.coordinates);
    console.log('destination stop: '+optimalRoute.destinationStop.coordinates);

    return optimalRoute;
}

function findRoute (graph, origin, destination) {
    const minTotalWalkingDistance = Number.MAX_VALUE;
    const minRoute = null;
    let closestStop = null;
    let walkdist = Number.MAX_VALUE;
    //find closest starting point
    for (let stop in graph) {
        let currentStop = stop.toString();
        let currentRoute = graph[stop];
        let currentDistance = getEuclideanDistance(currentStop, origin);
        if (currentDistance < walkdist) {
            walkdist = currentDistance;
            closestStop = currentStop;
        }
    }
    console.log('closest to starting point: '+closestStop);
}


app.get('/getRoute', (req, res) => {
    const busStops = {
        unionsquare: [40.73498551788369, -73.990696048825],
        tompkins: [40.7251277537963, -73.98121749968648],
        hamilton: [40.720213039417494, -73.980207088181],
        eastbroadway: [40.7141707879376, -73.9901227463216],
        chinatown: [40.71559782189394, -73.99850504010124],
        financial: [40.70811320415039, -74.00798229139403],
        tribeca: [40.716765448621125, -74.00913568860388],
        canal: [40.721857387647354, -74.00518353611693],
        soho: [40.72488113646396, -74.00162848801607],
        greenwich: [40.733368703161425, -74.00412600650982],
        washingtonsquare: [40.731522867853634, -73.9971283464239],
        jayst: [40.69225251854892, -73.98648974152808],
        dumbo: [40.70372584858276, -73.98861865993923],
        ikea: [40.672611811522145, -74.01009335210519]
    }
    const routes = {
        route1: [busStops.washingtonsquare, busStops.unionsquare, busStops.tompkins, busStops.hamilton, busStops.eastbroadway, busStops.chinatown, busStops.financial, busStops.tribeca, busStops.canal, busStops.soho, busStops.greenwich, busStops.washingtonsquare],
        route2: [busStops.jayst, busStops.dumbo, busStops.ikea],
        route3: [busStops.jayst, busStops.eastbroadway, busStops.washingtonsquare, busStops.chinatown, busStops.financial],
        route4: [busStops.eastbroadway, busStops.washingtonsquare, busStops.unionsquare, busStops.tompkins, busStops.hamilton, busStops.eastbroadway],
    }
    const graph = createGraph(routes);
    let optimalRoute = findOptimalRoute(graph, req.query.origin, req.query.destination);
    console.log(optimalRoute);
    res.send('Hello World!'); 
})