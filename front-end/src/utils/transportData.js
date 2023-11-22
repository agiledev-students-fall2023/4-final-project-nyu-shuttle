import axios from 'axios';

const EXCLUDED_ROUTES_QUERY_DELAY = 600000; // 10 mins
const ALERTS_QUERY_DELAY = 120000; // 2 mins
const MIN_QUERY_DELAY = 60000; // 1 min

let lastExcludedRoutesQuery = -EXCLUDED_ROUTES_QUERY_DELAY;
let lastAlertsQuery = -ALERTS_QUERY_DELAY;
let lastQuery = -MIN_QUERY_DELAY;
let lastResults = {};

// Query transportations (real-time update is done through the websocket)
export async function queryTransportations(refresh) {
  // Prevent too frequent requests (rate limiting)
  if (performance.now() - lastQuery < MIN_QUERY_DELAY) {
    return lastResults;
  }

  // JSON payload
  const json = {
    s0: localStorage.agencyId,
    sA: 1,
  };

  const subscribedRoutes = localStorage.subscribedRoutes ? localStorage.subscribedRoutes.split(',') : [];
  if (subscribedRoutes.length) {
    json.rA = subscribedRoutes.length;
  }
  subscribedRoutes.forEach((route, index) => {
    json['r' + index] = route;
  });

  // Params for URL
  const params = {
    getBuses: refresh || performance.now() - lastExcludedRoutesQuery > EXCLUDED_ROUTES_QUERY_DELAY ? 1 : 2,
    deviceId: localStorage.deviceId,
  };

  // Optional parameters
  if (refresh) {
    params.speed = '1';
  }
  if (performance.now() - lastAlertsQuery > ALERTS_QUERY_DELAY) {
    params.alertCRC = localStorage.alertCRC;
    lastAlertsQuery = performance.now();
  }

  const urlParams = new URLSearchParams(params);
  const url = `${localStorage.serviceEndpointSub}/goServices.php?${urlParams.toString()}`;

  try {
    const response = await axios.post(url, json);
    const data = response.data;
    if (!data) {
      throw new Error('empty response');
    }
    if (data.excludedRoutes) {
      lastExcludedRoutesQuery = performance.now();
      // place routes2 implementation here?
    }
    if (data && ((data.alertCRC && data.alertCRC != localStorage.alertCRC) || data.lastPushId > 0)) {
      // query alerts
    }

    const transportations = data.buses && Object.keys(data.buses).length ? data.buses : {};

    lastResults = transportations;
    lastQuery = performance.now();

    return transportations;
  } catch (error) {
    console.log('Transportations query error: ' + error.message);
    return {};
  }
}
