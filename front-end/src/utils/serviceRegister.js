import axios from 'axios';

const SERVICE_HOME_URL = 'https://passiogo.com/';
const SERVICE_SUB_URL = 'https://nyu.passiogo.com';
const acronymId = 1007;
const FALLBACK = {
  softwareVer: 110,
};

// Get service endpoint version.
async function checkSoftwareVersion() {
  try {
    const response = await axios.get(`${SERVICE_HOME_URL}goServices.php?goWebVer=1`);
    const data = response.data;

    // console.log('Version', data ? data.ver : data);
    localStorage.softwareVer = data.ver;
  } catch (error) {
    console.error('Error fetching software version:', error);
    localStorage.softwareVer = FALLBACK.softwareVer;
  }
}

// Generate a pseudo UUID
function generatePseudoUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Send a pseudo token to the service endpoint
function savePseudoTokenToServer() {
  let token = localStorage.currentToken || `pseudo${localStorage.softwareVer}_${generatePseudoUUID()}`;
  saveTokenToServer(token);
}

// Send the current token to the service endpoint
function saveTokenToServer(currentToken) {
  if (!currentToken) {
    currentToken = localStorage.currentToken || '';
  } else {
    localStorage.currentToken = currentToken;
  }

  const queryParams = new URLSearchParams({
    register: '1',
    deviceId: localStorage.deviceId,
    token: currentToken,
    platform: 'web',
    buildNo: localStorage.softwareVer,
    oldToken: localStorage.currentToken || '',
  });

  const url = `${SERVICE_SUB_URL}/goServices.php?${queryParams.toString()}`;

  axios
    .get(url)
    .then((response) => {
      const data = response.data;
      //   if (parseInt(localStorage.deviceId) !== data.deviceId) {
      //     console.log(`Changed deviceId ${localStorage.deviceId} to ${data.deviceId}`);
      //   }
      localStorage.deviceId = data.deviceId;
      localStorage.removeItem('currentToken');
    })
    .catch((error) => {
      console.error('Error while saving token to server:', error);
    });
}

export function registerService() {
  localStorage.serviceEndpointHome = SERVICE_HOME_URL;
  localStorage.serviceEndpointSub = SERVICE_SUB_URL;
  localStorage.acronymId = acronymId;
  checkSoftwareVersion().then(savePseudoTokenToServer);
}
