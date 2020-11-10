import services from '../../services/weatherService.js'
import moment from "moment";

const state = {
  weatherData: [],
  currentWeather: {},
  weatherDataInRange: [],
  latestRecord: '',
  loading: true,
  prediction: []
}

const getters = {
  getWeatherData: state => {
    return state.weatherData
  },
  getPredictionData: state => {
    return state.prediction
  },
  getCurrentWeather: state => {
    return state.currentWeather
  },
  getLoader: state => {
    return state.loading
  },
  getDataInRange: state => {
    return state.weatherDataInRange
  }
}

const mutations = {
  'SET_WEATHER_DATA' (state, weather) {
    state.weatherData = weather.reverse()
  },
  'SET_PREDICTION_DATA' (state, weather) {
    state.prediction = weather.reverse()
  },
  'SET_WEATHER_DATA_IN_RANGE' (state, weather) {
    state.weatherDataInRange = weather
  },
  'SET_CURRENT_WEATHER' (state, currentWeather) {
    state.currentWeather = {
      temperature: currentWeather.temperature,
      cloudCoverage: currentWeather.cloud,
      windSpeed: currentWeather.wind,
      precipitation: currentWeather.precipitation,
      time: currentWeather.time
    }
  },
  'SET_CONVERTED_VALUES' (state, currentWeather) {
    state.currentWeather.temperature = currentWeather.temperature
    state.currentWeather.windSpeed = currentWeather.windSpeed
    state.currentWeather.precipitation = currentWeather.precipitation
  },
  'END_LOADER' (state) {
    state.loading = false
  }


}

const actions = {
  fetchWeatherData: ({commit}) => {
    services.getWeather().then(response => {
      if (response.status === 200) {
        commit('SET_WEATHER_DATA', response.data)
      }
    })
  },
  fetchPrediction: ({commit}) => {
    services.getPrediction().then(response => {
      if (response.status === 200) {
        commit('SET_PREDICTION_DATA', response.data)
      }
    })
  },
  fetchCurrentWeather: ({commit}, payload) => {
    services.getWeather().then(response => {
      if (response.status === 200) {
        let latestRecord = new Date(Math.max(...response.data.map(e => new Date(e.time))));
        let latestDataInCity = [...response.data.filter(item => item.place === payload && new Date(item.time).getTime() === latestRecord.getTime())]
        commit('SET_CURRENT_WEATHER', {
          temperature: [...latestDataInCity.filter(item => item.type === 'temperature')][0].value,
          cloud: [...latestDataInCity.filter(item => item.type === 'cloud coverage')][0].value,
          wind: [...latestDataInCity.filter(item => item.type === 'wind speed')][0].value,
          precipitation: [...latestDataInCity.filter(item => item.type === 'precipitation')][0].value,
          time: latestRecord
        })
      }
    })
  },
  convertToUSValues: ({commit}, payload) => {
    commit('SET_CONVERTED_VALUES', {
      temperature: services.convertToF(payload.temperature),
      windSpeed: services.convertToMPH(payload.wind),
      precipitation: services.convertToInches(payload.precipitation)
    })
  },
  convertToIntValues: ({commit}, payload) => {
    commit('SET_CONVERTED_VALUES', {
      temperature: services.convertToC(payload.temperature),
      windSpeed: services.convertToMS(payload.wind),
      precipitation: services.convertToMM(payload.precipitation)
    })
  },
  fetchDataInRange: ({commit}, payload) => {
    let allWeatherDataInRange = [...payload.weatherData.filter(item => (moment(item.time).isAfter(payload.start) || moment(item.time).isSame(payload.start)) && (moment(item.time).isBefore(payload.end) || moment(item.time).isSame(payload.end)) && item.place === payload.city)]

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
    let arrayGroups =  Object.keys(weatherGroups).map((date) => {
      return {
        date,
        weather: weatherGroups[date]
      };
    }).reverse();
    commit('SET_WEATHER_DATA_IN_RANGE', arrayGroups)
  },
  addHistoricData: ({commit}, payload) => {
    services.addHistoryWeatherData(payload).then(response => {
      if (response.status === 200) {
        services.getWeather().then(response => {
          if (response.status === 200) {
            commit('SET_WEATHER_DATA', response.data)
          }
        })
      }
    });
  },

}

export default {
  state,
  getters,
  actions,
  mutations
}
