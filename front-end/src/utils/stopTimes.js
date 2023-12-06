import axios from "axios";

async function getShuttleTimes(stopName, route) {
  const url = `http://localhost:4000/stopfind/${stopName}/${route}`;
  console.log(url);
  return axios
    .get(url)
    .then((response) => {
      //console.log(response.data);
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
    if(response.stop === undefined){
      return [];
    }
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
    return upcomingTimes;
  } catch (error) {
    console.error("Function error:", error);
    throw error;
  }
}

export async function getMatchingName(stopName, route){
  if (route === "A") {
    if(stopName==="Cadman Plaza & Clark Street"){
      return "Cadman Plaza & Clark St."
    } else if(stopName==="6 Metro Tech Center" || stopName==="Metro Tech Way"){
      return "Metro Tech Way"
    } else if(stopName==="80 Lafayette Street"){
      return "80 Lafayette"
    } else if(stopName==="Broadway & Broome St."){
      return "Broadway & Broome St."
    } else if(stopName==="715 Broadway"){
      return "715 Broadway Departure"
    } else if(stopName==="Cleveland Pl & Spring St"){
      return "Cleveland & Spring St."
    }
  } else if (route === "B") {
    if(stopName==="Lafayette & E. 4th St"){
      return "Layfayette & E 4th St."
    } else if(stopName==="Cleveland Pl & Spring St"){
      return "Cleveland Pl & Spring St."
    } else if(stopName==="80 Lafayette Street"){
      return "80 Lafayette"
    } else if(stopName==="715 Broadway"){
      return "715 Broadway Departure"
    } else if(stopName==="Broadway & Broome St."){
      return "Broadway & Broome St."
    }
  } else if (route === "C") {
    if(stopName==="Avenue C At 14th Street"){
      return "Ave. C & 14th St."
    } else if(stopName==="Avenue C At 16th Street"){
      return "Ave. C & 16th St."
    } else if(stopName==="Avenue C At 18th Street"){
      return "Ave C & 18th St."
    } else if(stopName==="20th Street At Loop Exit"){
      return "20th St & Loop Exit"
    } else if(stopName==="14th Street At 1st Avenue"){
      return "14th St. & 1st Ave."
    } else if(stopName==="Third Avenue At 13th Street"){
      return "3rd Ave. & 13th St."
    } else if(stopName==="715 Broadway"){
      return "715 Broadway Arrival"
    } else if(stopName==="14th Street At Avenue A"){
      return "14th St. & Ave. A"
    } else if(stopName==="14th Street At Avenue B"){
      return "14th St. & Ave. B"
    }
  } else if (route === "E") {
    if(stopName==="First Avenue At 17th Street"){
      return "1st Ave. at 17th St."
    } else if(stopName==="First Avenue At 24th Street"){
      return "1st Ave. at 24th St."
    } else if(stopName==="First Avenue At 26th Street"){
      return "1st Ave. at 26th St."
    } else if(stopName==="NYU Langone Health"){
      return "NYU Langone Health"
    } else if(stopName==="Lexington Avenue At 31st Street"){
      return "Lexington Ave. at 31st St."
    } else if(stopName==="Gramercy Green"){
      return "Gramercy Green"
    } else if(stopName==="Third Avenue At 17th Street S"){
      return "3rd Ave. at 17th St."
    } else if(stopName==="14th Street At Third Avenue"){
      return "14th St at 3rd Ave."
    } else if(stopName==="14th St At Irving Place WB"){
      return "14th St. at Irving Place (WB)"
    } else if(stopName==="14th St At Irving Place EB"){
      return "14th St. at Irving Place (EB)"
    } else if(stopName==="715 Broadway"){
      return "715 Broadway Departure"
    }
  } else if (route === "F") {
    if(stopName==="Third Avenue At 30th Street"){
      return "3rd Ave. at 30th St."
    } else if(stopName==="Lexington Avenue At 31st Street"){
      return "Lexington Ave. at 31st St."
    } else if(stopName==="Gramercy Green"){
        return "Gramercy Green"
    } else if(stopName==="Opposite Gramercy Green"){
        return "Opposite Gramercy Green"
    } else if(stopName==="Third Avenue At 17th Street N"){
        return "3rd Ave. at 17th St."
    } else if(stopName==="Third Avenue At 17th Street S"){
        return "3rd Ave. at 17th St."
    } else if(stopName==="Third Avenue At 14th Street"){
        return "3rd Ave. at 14th St."
    } else if(stopName==="14th St At Irving Place EB"){
        return "14th St. at Irving Place (EB)"
    } else if(stopName==="Third Avenue At 13th Street"){
        return "3rd Ave. at 13th St."
    } else if(stopName==="Third Avenue At 11th Street (NB)"){
        return "3rd Ave. at 11th St. (NB)"
    } else if(stopName==="Third Avenue At 11th Street (SB)"){
        return "3rd Ave. at 11th St. (SB)"
    } else if(stopName==="715 Broadway"){
        return "715 Broadway Departure"
    }
  } else if (route === "W") {
    if(stopName==="Lexington Avenue At 31st Street"){
      return "Lexington Ave. at 31 St."
    } else if(stopName==="First Avenue At 26th Street"){
      return "1St. Ave. at 26th St."
    } else if(stopName==="First Avenue At 24th Street"){
      return "1St. Ave. at 24th St."
    } else if(stopName==="First Avenue At 17th Street"){
      return "1St. Ave. at 17th St.."
    } else if(stopName==="Gramercy Green"){
      return "Gramercy Green"
    } else if(stopName==="Third Avenue At 17th Street N"){
      return "3rd Ave. at 17th St."
    } else if(stopName==="Third Avenue At 14th Street"){
      return "14th St. at 3rd Ave."
    } else if(stopName==="14th St At Irving Place EB"){
      return "14th St. at Irving Place (EB)"
    } else if(stopName==="14th St At Irving Place WB"){
      return "14th St. at Irving Place (WB)"
    } else if(stopName==="Lafayette & E. 4th St"){
      return "Lafayette & E 4th St."
    } else if(stopName==="715 Broadway"){
      return "715 Broadway Departure"
    } else if(stopName==="Cleveland Pl & Spring St"){
      return "Cleveland Pl & Spring St."
    } else if(stopName==="80 Lafayette Street"){
      return "80 Lafayette"
    } else if(stopName==="Broadway & Broome St."){
      return "Broadway & Broome St."
    }    
  }
    return stopName;
  }

  export async function timeRemaining(stopName, route) {
    try {
      const currentTime = new Date();
      const allTimes = await getNextTimes(stopName, route);
  
  
      const upcomingTimes = allTimes.map(timeString => {
        const [hours, minutes, period] = timeString.split(/:| /);
        const dateWithTime = new Date(1970, 0, 1, parseInt(hours), parseInt(minutes), 0, 0);
        if (period.toLowerCase() === 'pm') {
          dateWithTime.setHours(dateWithTime.getHours() + 12);
        }
  
        return dateWithTime;
      });
  
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
