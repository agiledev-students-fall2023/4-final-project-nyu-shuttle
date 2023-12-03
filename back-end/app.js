// import and instantiate express
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const process = require("process");
require("dotenv").config({ silent: true });
const cron = require("node-cron");
const { fetchDataForRoutes } = require("./updateTimetable");

const mongoose = require("mongoose");
const Feedback = require("./models/Feedback.js");


// connect to the database
try {
  mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to MongoDB.`);
} catch (err) {
  console.log(
    `Error connecting to MongoDB user account authentication will fail: ${err}`
  );
}

app.use(morgan("dev", { skip: (req, res) => process.env.NODE_ENV === "test" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: process.env.FRONT_END_DOMAIN, credentials: true }));

const feedbackRoutes = require("./routes/feedback-routes.js");
const timetableRoutes = require("./routes/timetable-routes.js");

app.use("/feedback", feedbackRoutes());

app.get("/test", (req, res) => {
  console.log(window.nyushuttle)
});
app.use("/timetable", timetableRoutes());

cron.schedule('0 0 * * *', () => {
  fetchDataForRoutes(['routesA_W', 'routesA_F', 'routesA_Wknd', 'routesB_W', 
  'routesB_F', 'routesC_W', 'routesE_W', 'routesE_F', 'routesF_W', 
  'routesG_W', 'routesG_F', 'routesG_Wknd', 'routesW_Wknd']); 
});

app.post("/getRoute", async (req, res) => {
    const routeFinding = require("./getOptimizedRoute.js"); 

    
    const busStops = {};
    //parse stops into a dictionary of coordinates
    for (let stopkey in req.body.stops) {
      let latitude = req.body.stops[stopkey].latitude
      let longitude = req.body.stops[stopkey].longitude
      let stopID = req.body.stops[stopkey].stopId
      busStops[stopID] = [latitude, longitude]
    }
    console.log('<----------Stops---------->')
    console.log(busStops)

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
    console.log('<----------Routes---------->')
    console.log(routes);
    
    //creates a graph representation of the stops and routes
    const graph = routeFinding.createGraph(routes, busStops);
    console.log('graph created')
    //returns all routes that can go from origin to destination
    try{
      let optimalRoute = await routeFinding.findOptimalRoute(
        graph, routes, busStops,
        req.body.origin_lat,
        req.body.origin_lng,
        req.body.destination_lat,
        req.body.destination_lng,
      );
      console.log(optimalRoute.onSameRoute);
      res.send(optimalRoute);
    }
    catch(err){
      console.log(err);
      res.send(err);
    }
  }
);

module.exports = app;
