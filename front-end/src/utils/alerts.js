// Todo
// Interval-based background query

import axios from 'axios';

// const QUERY_INTERVAL = 120000; // 2 mins
const MIN_QUERY_DELAY = 60000; // 1 min
let lastMessages = [];
let lastQuery = 0;

// Query alert. referch parameter determines "query all" or "query updates only"
export async function queryAlert(refresh) {
  // Prevent too frequent requests
  if (performance.now() - lastQuery < MIN_QUERY_DELAY) {
    return lastMessages;
  }

  // JSON payload
  const json = {
    systemSelected0: localStorage.agencyId,
  };

  const subscribedRoutes = localStorage.subscribedRoutes ? localStorage.subscribedRoutes.split(',') : [];
  subscribedRoutes.forEach((route, index) => {
    json['routeSelected' + index] = route;
  });

  json.amount = 1;
  json.routesAmount = subscribedRoutes.length;

  // Params for URL
  const params = {
    getAlertMessages: '1',
    deviceId: localStorage.deviceId,
    alertCRC: refresh ? 'na' : localStorage.alertCRC,
    buildNo: localStorage.softwareVer,
  };

  // Fetch all or updates
  if (refresh) {
    params.embedded = '0';
  } else {
    params.noOption = '1';
  }

  const urlParams = new URLSearchParams(params);
  const url = `${localStorage.serviceEndpointSub}/goServices.php?${urlParams.toString()}`;

  try {
    const response = await axios.post(url, json);
    const data = response.data;
    if (!data) {
      throw new Error('empty response');
    }
    if (data.agencyPhone) {
      localStorage.agencyPhone = data.agencyPhone;
    }
    if (data.wsUrl) {
      localStorage.wsUrl = data.wsUrl;
    }
    if ((data.alertCRC && data.alertCRC != localStorage.alertCRC) || (data.msgs && data.msgs.length)) {
      localStorage.alertCRC = data.alertCRC;
    }
    const messages = data.msgs && data.msgs.length ? data.msgs : [];

    lastMessages = messages;
    lastQuery = performance.now();

    return messages;
  } catch (error) {
    console.log('Alerts query error: ' + error.message);
    return [];
  }
}
