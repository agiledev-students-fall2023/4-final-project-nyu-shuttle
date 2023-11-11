function RealTimeDataWebSocket() {
  this.wsUrl = 'wss://passio3.com/';
  this.ws = null;
  this.transports = null;
  this.setTransports = null;
  this.wsUserIds = [1007];

  this.setup = (transports, setTransports) => {
    this.transports = transports;
    this.setTransports = setTransports;
  };

  this.start = () => {
    if (!this.wsUrl || (this.ws && this.ws.readyState === WebSocket.OPEN)) return;

    this.ws = new WebSocket(this.wsUrl);
    this.ws.onopen = () => this.subscribeToTransports();
    this.ws.onclose = () => this.onWebSocketClose();
    this.ws.onmessage = (event) => this.processTransportData(event.data);
    this.ws.onerror = () => this.onWebSocketError();
  };

  this.subscribeToTransports = () => {
    this.unsubscribe();
    const userIds = this.wsUserIds;
    const transportIds = this.collectTransportIds(); // example: [5534, 5533, 4655, 4657, 4651, 4653, 4652, 3692, 3693, 10733, 10732, 5608, 9918]

    if (transportIds.length > 0) {
      const subscriptionMessage = this.createSubscriptionMessage(userIds, transportIds);
      this.ws.send(subscriptionMessage);
    }
  };

  this.unsubscribe = () => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      if (this.wsUserIds.length > 0) {
        const unsubscribeMessage = JSON.stringify({
          unsubscribe: 'location',
          userId: this.wsUserIds,
        });
        this.ws.send(unsubscribeMessage);
      }
    }
  };

  this.collectTransportIds = () => {
    let transportIds = [];
    for (let key in this.transports) {
      if (this.transports.hasOwnProperty(key)) {
        let transportInfo = this.transports[key][0];
        if (transportInfo && transportInfo.hasOwnProperty('busId')) {
          transportIds.push(transportInfo.busId);
        }
      }
    }
    return transportIds;
  };

  this.createSubscriptionMessage = (userIds, transportIds) => {
    return JSON.stringify({
      subscribe: 'location',
      userId: userIds,
      filter: {
        outOfService: 0,
        busId: transportIds,
      },
      field: ['busId', 'latitude', 'longitude', 'course', 'paxLoad', 'more'],
    });
  };

  this.processTransportData = (data) => {
    const result = JSON.parse(data);
    if (result && result.more && result.more.secondary) return;

    let updatedTransports = { ...this.transports };

    for (let key in updatedTransports) {
      if (updatedTransports.hasOwnProperty(key)) {
        let transportArray = updatedTransports[key];
        for (let i = 0; i < transportArray.length; i++) {
          let transport = transportArray[i];
          if (transport.busId === result.busId) {
            updatedTransports[key][i] = {
              ...transport,
              latitude: result.latitude,
              longitude: result.longitude,
              calculatedCourse: 0,
              course: result.course,
              paxLoad: result.paxLoad,
            };
            break;
          }
        }
      }
    }

    this.setTransports(updatedTransports);
  };

  this.onWebSocketClose = () => {
    console.log('WebSocket closed');
    this.ws = null;
  };

  this.onWebSocketError = () => {
    console.error('WebSocket error');
    this.ws = null;
  };
}

export default RealTimeDataWebSocket;
