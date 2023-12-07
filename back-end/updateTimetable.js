const axios = require("axios");

async function fetchDataForRoutes(routeNames) {
  try {
    for (const routeName of routeNames) {
      await axios.get(`http://localhost:4000/timetable/${routeName}`);
    }
    console.log('Data fetched successfully.');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

module.exports = { fetchDataForRoutes };
