import axios from 'axios'
import moment from 'moment'

const convertToF = (value) => ((value * (9 / 5)) + 32).toFixed(1)
const convertToC = (value) => ((value - 32) * (5 / 9)).toFixed(1)
const convertToMM = (value) => (value * 25.4).toFixed(2)
const convertToInches = (value) => (value / 25.4).toFixed(2)
const convertToMPH = (value) => (value * 2.2369362920544).toFixed(2)
const convertToMS = (value) => (value * 0.44704).toFixed(2)

export default {
  getWeather() {
    return axios
      .get('http://localhost:8080/data')
  },
  addHistoryWeatherData(data) {
    return axios.post('http://localhost:8080/data', data);
  },
  getPrediction(){
    return axios
      .get('http://localhost:8080/forecast')
  },
  getWeatherInRange(weatherData, city, start, end) {

    //all data that matches the range
    let allWeatherDataInRange = [...weatherData.filter(item => (moment(item.time).isAfter(start) || moment(item.time).isSame(start)) && (moment(item.time).isBefore(end) || moment(item.time).isSame(end)) && item.place === city)]

    //groups data by date
    const weatherGroups = allWeatherDataInRange.reduce((groups, weatherItem) => {
      const date = weatherItem.time.split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(weatherItem);
      return groups;
    }, {});

    // returns groups in an array format instead
    return Object.keys(weatherGroups).map((date) => {
      return {
        date,
        weather: weatherGroups[date]
      };
    }).reverse();
  },
  getWeatherForecast(weatherData, city, start, end) {

    //all data that matches the range
    let allForecastDataInRange = [...weatherData.filter(item => item.place === city)]


    //groups data by date
    const weatherGroups = allForecastDataInRange.reverse().reduce((groups, weatherItem) => {
      const date = weatherItem.time;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(weatherItem);
      return groups;
    }, {});


    // returns groups in an array format instead
    return Object.keys(weatherGroups).map((date) => {
      return {
        date,
        weather: weatherGroups[date]
      };
    });
  },
  getIcon(weatherData, lang) {
    if (lang) {
      switch (true) {
        case weatherData.temperature > 20 :
          return 'sun'
        case weatherData.temperature > 12 && weatherData.cloudCoverage > 40 && weatherData.cloudCoverage < 50 :
          return 'cloudy'
        case weatherData.cloudCoverage > 50 && weatherData.precipitation < 11 && weatherData.temperature > 0:
          return 'clouds'
        case weatherData.precipitation > 11 && weatherData.windSpeed < 10  && weatherData.temperature > 0:
          return 'drop'
        case weatherData.windSpeed > 10 && weatherData.temperature > 0:
          return 'wind'
        case weatherData.temperature < 0 :
          return 'snowflake'
        default: return 'sun'
        // code block
      }
    } else {
      switch (true) {
        case weatherData.temperature > 68 :
          return 'sun'
        case weatherData.temperature > 50 && weatherData.cloudCoverage > 40 && weatherData.cloudCoverage < 50 :
          return 'cloudy'
        case weatherData.cloudCoverage > 50 && weatherData.precipitation < 0.23 && weatherData.temperature > 32 :
          return 'clouds'
        case weatherData.precipitation > 0.23 && weatherData.temperature > 32  :
          return 'drop'
        case weatherData.windSpeed > 22 && weatherData.temperature > 32 :
          return 'wind'
        case weatherData.temperature < 32 :
          return 'snowflake'
        default:
        // code block
      }
    }
  },
  getMaxValue(object, type){
  return Math.max.apply(Math,[...object.filter(item => item.type === type)].filter(item => item.type === type).map(function (o) {
      return o.value;
    }))
  },
  getMinValue(object, type){
   return Math.min.apply(Math,[...object.filter(item => item.type === type)].map(function (o) {
      return o.value;
    }))
  },

  convertToC, convertToF, convertToInches, convertToMM, convertToMPH, convertToMS
}
