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
app.use("/timetable", timetableRoutes());

<<<<<<< HEAD
cron.schedule('0 0 * * *', () => {
  fetchDataForRoutes(['routesA_W', 'routesA_F', 'routesA_Wknd', 'routesB_W', 
  'routesB_F', 'routesC_W', 'routesE_W', 'routesE_F', 'routesF_W', 
  'routesG_W', 'routesG_F', 'routesG_Wknd', 'routesW_Wknd']); 
});
=======
app.get("/test", (req, res) => {
  console.log(window.nyushuttle)
});

>>>>>>> 7277d7459bb6a308b5b218eabcf14e7b80df50ee

app.get("/getRoute", async (req, res) => {
  const routeFinding = require("./getOptimizedRoute.js");  
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
      ikea: [40.672611811522145, -74.01009335210519],
  };
    const routes = {
      route1: [
        busStops.washingtonsquare,
        busStops.unionsquare,
        busStops.tompkins,
        busStops.hamilton,
        busStops.eastbroadway,
        busStops.chinatown,
        busStops.financial,
        busStops.tribeca,
        busStops.canal,
        busStops.soho,
        busStops.greenwich,
        busStops.washingtonsquare,
      ],
      route2: [busStops.jayst, busStops.dumbo, busStops.ikea],
      route3: [
        busStops.jayst,
        busStops.eastbroadway,
        busStops.washingtonsquare,
        busStops.chinatown,
        busStops.financial,
      ],
      route4: [
        busStops.eastbroadway,
        busStops.washingtonsquare,
        busStops.unionsquare,
        busStops.tompkins,
        busStops.hamilton,
        busStops.eastbroadway,
      ],
    };
    const graph = routeFinding.createGraph(routes, busStops);
    console.log('graph created')
    let optimalRoute = await routeFinding.findOptimalRoute(
      graph, routes, busStops,
      req.query.origin_lat,
      req.query.origin_lng,
      req.query.destination_lat,
      req.query.destination_lng,
    );
    
    console.log(optimalRoute.onSameRoute);
    res.send(optimalRoute.onSameRoute);
  }
);

module.exports = app;
