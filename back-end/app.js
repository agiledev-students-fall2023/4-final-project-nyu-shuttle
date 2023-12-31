// import and instantiate express
require('dotenv').config({ silent: true });
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const process = require('process');
const cron = require('node-cron');
const path = require('path');
const mongoose = require('mongoose');
const { fetchDataForRoutes } = require('./updateTimetable');

const STATIC_FOLDER = path.join(__dirname, '../', 'front-end/', 'build/');
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB.'))
  .catch((err) => console.log(`Error connecting to MongoDB: ${err}`));

app.use(express.json());
app.use(morgan('dev', { skip: (req, res) => process.env.NODE_ENV === 'test' }));
app.use(cors({ credentials: true }));
app.use(express.static(STATIC_FOLDER));

const feedbackRoutes = require('./routes/feedback-routes.js');
const timetableRoutes = require('./routes/timetable-routes.js');
const stopRoutes = require('./routes/stop-routes.js');

app.use('/feedback', feedbackRoutes());

// app.get('/test', (req, res) => {
//   console.log(window.nyushuttle);
// });

app.use('/timetable', timetableRoutes());
app.use('/stopfind', stopRoutes());

app.use(express.urlencoded({ extended: true }));

app.post('/getRoute', async (req, res) => {
  const routeFinding = require('./getOptimizedRoute.js');
  const busStops = {};
  //parse stops into a dictionary of coordinates
  for (let stopKey in req.body.stops) {
    let latitude = req.body.stops[stopKey].latitude;
    let longitude = req.body.stops[stopKey].longitude;
    let stopID = req.body.stops[stopKey].stopId;

    // Initialize the object if it doesn't exist
    if (!busStops[stopID]) {
      busStops[stopID] = {};
    }

    busStops[stopID].geoLoc = [latitude, longitude];
    busStops[stopID].stopId = stopID;
  }
  //parse routes into a dictionary of routes, each holding an
  //array of stops
  let routes = {};

  for (let routeKey in req.body.routes) {
    let route = req.body.routes[routeKey];
    let routeName = route[0];

    routes[routeName] = [];

    for (let i = 3; i < route.length; i++) {
      let stopId = route[i][1];
      if (busStops[stopId]) {
        routes[routeName].push(busStops[stopId]);
      }
    }
  }
  console.log('<----------Routes---------->');
  console.log(routes);

  //creates a graph representation of the stops and routes
  const graph = routeFinding.createGraph(routes, busStops);
  console.log('graph created');
  //returns all routes that can go from origin to destination
  try {
    let optimalRoute = await routeFinding.findOptimalRoute(
      graph,
      routes,
      busStops,
      req.body.origin_lat,
      req.body.origin_lng,
      req.body.destination_lat,
      req.body.destination_lng
    );
    console.log(optimalRoute.originStop.stopId);
    res.send(optimalRoute);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

module.exports = app;