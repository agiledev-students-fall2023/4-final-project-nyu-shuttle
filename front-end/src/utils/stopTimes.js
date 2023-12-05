import axios from "axios";

async function getShuttleTimes(stopName, route) {
  const url = `http://localhost:4000/stopfind/${stopName}/${route}`;
  return axios
    .get(url)
    .then((response) => {
      console.log(response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Axios error:", error);
      throw error;
    });
}

async function getTimes(stopName, route) {
  try {
    const response = await getShuttleTimes(stopName, route);
    const shuttleTimes = response.stop.times;
    return shuttleTimes;
  } catch (error) {
    console.error("Function error:", error);
    throw error;
  }
}

export async function getNextTimes(stopName, route) {
  try {
    const currentTime = new Date();
    const allTimes = await getTimes(stopName, route);
    const upcomingTimes = allTimes
    .map(timeString => {
      const [time, period] = timeString.split(' ');
      const [hours, minutes] = time.split(':');
      let adjustedHours = parseInt(hours, 10);

      if (period === 'PM' && adjustedHours !== 12) {
        adjustedHours += 12;
      }
      const timeObject = new Date();
      timeObject.setHours(adjustedHours, parseInt(minutes, 10));
      return timeObject;
    })
    .filter(singleTime => {
      return singleTime >= currentTime;
    })
    .map(time => time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    console.log(upcomingTimes);
    return upcomingTimes;
  } catch (error) {
    console.error("Function error:", error);
    throw error;
  }
}

export async function timeRemaining(stopName, route) {
  try {
    const currentTime = new Date();
    const allTimes = await getNextTimes(stopName, route);
    const upcomingTimes = allTimes.map(timeString => new Date(timeString));
    const timeDifferences = upcomingTimes.map(upcomingTime => {
      const differenceInMilliseconds = upcomingTime - currentTime;
      const differenceInMinutes = differenceInMilliseconds / (1000 * 60);
      return differenceInMinutes;
    });
    return timeDifferences;
  } catch (error) {
    console.error("Function error:", error);
    throw error;
  }
}


export default getShuttleTimes;