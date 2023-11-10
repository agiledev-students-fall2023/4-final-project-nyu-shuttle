function BusTrackerWebSocket() {
  this.wsUrl = 'wss://passio3.com/';
  this.ws = null;
  this.buses = null;
  this.setBuses = null;
  this.wsUserIds = [1007];

  this.setup = (buses, setBuses) => {
    this.buses = buses;
    this.setBuses = setBuses;
  };

  this.start = () => {
    if (!this.wsUrl || (this.ws && this.ws.readyState === WebSocket.OPEN)) return;

    this.ws = new WebSocket(this.wsUrl);
    this.ws.onopen = () => this.subscribeToBuses();
    this.ws.onclose = () => this.onWebSocketClose();
    this.ws.onmessage = (event) => this.processBusData(event.data);
    this.ws.onerror = () => this.onWebSocketError();
  };

  this.subscribeToBuses = () => {
    this.unsubscribe();
    const userIds = this.wsUserIds;
    const busIds = this.collectBusIds(); // example: [5534, 5533, 4655, 4657, 4651, 4653, 4652, 3692, 3693, 10733, 10732, 5608, 9918]

    if (busIds.length > 0) {
      const subscriptionMessage = this.createSubscriptionMessage(userIds, busIds);
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

  this.collectBusIds = () => {
    let busIds = [];
    for (let key in this.buses) {
      if (this.buses.hasOwnProperty(key)) {
        let busInfo = this.buses[key][0];
        if (busInfo && busInfo.hasOwnProperty('busId')) {
          busIds.push(busInfo.busId);
        }
      }
    }
    return busIds;
  };

  this.createSubscriptionMessage = (userIds, busIds) => {
    return JSON.stringify({
      subscribe: 'location',
      userId: userIds,
      filter: {
        outOfService: 0,
        busId: busIds,
      },
      field: ['busId', 'latitude', 'longitude', 'course', 'paxLoad', 'more'],
    });
  };

  this.processBusData = (data) => {
    const result = JSON.parse(data);
    if (result && result.more && result.more.secondary) return;

    let updatedBuses = { ...this.buses };

    for (let key in updatedBuses) {
      if (updatedBuses.hasOwnProperty(key)) {
        let busArray = updatedBuses[key];
        for (let i = 0; i < busArray.length; i++) {
          let bus = busArray[i];
          if (bus.busId === result.busId) {
            updatedBuses[key][i] = {
              ...bus,
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

    this.setBuses(updatedBuses);
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

export default BusTrackerWebSocket;
