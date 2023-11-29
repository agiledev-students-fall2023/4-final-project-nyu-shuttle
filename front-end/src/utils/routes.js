import axios from 'axios';

const MIN_QUERY_DELAY = 60000; // 1 min

let lastQuery = -MIN_QUERY_DELAY;
let subscribedRoutes = localStorage.subscribedRoutes;

// Shared variable
if (typeof window.nyushuttle == 'undefined') {
  window.nyushuttle = {};
}
window.nyushuttle.routesFull = [];
window.nyushuttle.routes = [];
window.nyushuttle.routesSelected = subscribedRoutes ? subscribedRoutes.split(',') : [];

export async function queryRoutes(fresh) {
  // Prevent too frequent requests (rate limiting)
  if (performance.now() - lastQuery < MIN_QUERY_DELAY) {
    return window.nyushuttle.routes;
  }

  // JSON
  const json = {
    systemSelected0: localStorage.agencyId,
    amount: 1,
  };

  const formData = new URLSearchParams({});
  formData.append('json', JSON.stringify(json));

  // Params for URL
  const params = {
    getRoutes: fresh ? 1 : 2,
    deviceId: localStorage.deviceId,
  };

  // Optional parameters
  if (!fresh) {
    params.sortMode = 1;
    params.credentials = 1;

    // Currently there are no feature supported based on the following data
    params.lat = undefined;
    params.lng = undefined;
  }

  const urlParams = new URLSearchParams(params);
  const url = `${localStorage.serviceEndpointHome}/mapGetData.php?${urlParams.toString()}`;

  try {
    const response = await axios.post(url, formData);
    const data = response.data;
    if (!data) {
      throw new Error('empty response');
    }
    if (fresh) {
      window.nyushuttle.routesFull = data;
      window.nyushuttle.routes = data;
    } else {
      if (!data.all) {
        throw new Error('empty response');
      }
      window.nyushuttle.routes = data.all;
    }
  } catch (error) {
    console.log('Transportations query error: ' + error.message);
  } finally {
    return window.nyushuttle.routes;
  }
}
