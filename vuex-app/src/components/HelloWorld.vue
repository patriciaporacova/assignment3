<template>
  <div class="wrapper">
    <div class="weatherContainer">
      <div class="leftContainer">
        <div class="header">

          <p class="text">
            Current weather in {{ city }}</p>
          <v-icon @click="loadCurrentWeather(this.city)" name="sync-alt"
                  class="iconInCircle"/>
        </div>

        <div class="leftContainerContent"
             style="height: 100%; display: flex; flex-direction: column; justify-content: space-evenly ">

          <div class="weatherImageContainer">
            <img class=weatherImage :src="setImage" alt="image">
          </div>

          <div>
            <div class="temperatureContainer">
              <p class="temperature">{{ getCurrentWeather.temperature }}<span
                class="temperatureType">{{ this.lang ? intUnits.temp : usUnits.temp }}</span>
              </p>
            </div>
            <div class="dateTimeContainer">
              <sync-loader v-if="this.loading_historic"
                           class="loaderDots"
                           :size="6"
                           :loading="loading_historic"
              />
              <p v-if="!this.loading_historic" class="day">{{ getCurrentWeather.time | moment("dddd, MMM Do 'YY") }},
                <span class="lightText"> {{ getCurrentWeather.time | moment("HH:mm") }} </span>
              </p>
            </div>

            <div style="height: 1%; margin: 3% 0">
              <hr>
            </div>

            <div class="prediction">
              <v-icon name="cloud" class="iconInCircle" style=" margin-right: 10px;"/>
              <p class="text">Cloud coverage - {{ getCurrentWeather.cloudCoverage }}% </p>

            </div>

            <div class="prediction">
              <v-icon name="cloud-rain" class="iconInCircle" style=" margin-right: 10px;"></v-icon>
              <p class="text">Rain - {{
                  getCurrentWeather.precipitation
                }}{{ this.lang ? intUnits.rain : usUnits.rain }}</p>
            </div>
          </div>

          <div
            class="cityImageContainer">
            <p class="cityTitle">{{ city }}</p>
            <div class="overlay"></div>
            <img class=cityImage :src=cityImage>
          </div>

        </div>
      </div>

      <div class="rightContainer">

        <div class="rightHeader">
          <div class="cityButtons">
            <p class="cityTogglButton"
               :class="{cityButtonInactive: this.city !='Horsens',cityButtonActive:this.city=='Horsens'}"
               @click="loadCurrentWeather('Horsens')">Horsens</p>
            <p class="cityTogglButton"
               :class="{cityButtonInactive: this.city !='Aarhus',cityButtonActive:this.city=='Aarhus'}"
               @click="loadCurrentWeather('Aarhus')">Aarhus</p>
            <p class="cityTogglButton"
               :class="{cityButtonInactive: this.city !='Copenhagen',cityButtonActive:this.city=='Copenhagen'}"
               @click="loadCurrentWeather('Copenhagen')">Copenhagen</p>
          </div>

          <div class="langButtons">
            <p @click="toggleUnits('int')" class="langButton"
               :class="{langButtonActive: this.lang, langButtonInactive: !this.lang }">INT</p>
            <p @click="toggleUnits('us')" class="langButton"
               :class="{langButtonActive: !this.lang, langButtonInactive: this.lang }">US</p>
          </div>
        </div>

        <div style=" width: 100%; margin-top: 5%;">
          <p class="title">Choose timeframe of historic data you want to swipe
            trough</p>
          <div class="inputCalendar">
            <input placeholder="yyyy-mm-dd" v-model="startDate" min="2020-11-02" max="2020-11-09"
                   type="date">
            <input style="margin-left: 2%; " placeholder="yyyy-mm-dd" min="2020-11-02" max="2020-11-09"
                   v-model="endDate" type="date">
          </div>

          <div class="slider carousel" v-if="!this.loading_historic">
            <swiper ref="mySwiper" class="swiper" :options="swiperOptions">
              <swiper-slide v-for="(weather, index) in this.weatherInRange " :key="index">
                <weather_historic
                  :day="weather.date | moment('ddd')"
                  :image="require(`../assets/${getValues(weather.weather).icon}.png`)"
                  :max-temp="getValues(weather.weather).max"
                  :min-temp="getValues(weather.weather).min">
                </weather_historic>
              </swiper-slide>
              <div class="swiper-pagination" slot="pagination"></div>
            </swiper>
          </div>
        </div>


        <sync-loader v-if="this.loading_historic"
                     class="loaderDots"
                     :size="6"
                     :loading="loading_historic"
        />

        <div style=" width: 100%; margin-top: 5%;">
          <p class="title">Add your historic data</p>
          <div style="margin-top: 3%; display: flex;flex-direction: row; justify-content: start">
            <select v-model="newData.type" required>
              <option disabled value="">Type</option>
              <option>temperature</option>
              <option>wind speed</option>
              <option>cloud coverage</option>
              <option>precipitation</option>
            </select>
            <select v-model="precipitation_type" v-if="newData.type == 'precipitation'" required>
              <option disabled value="">precipitation type</option>
              <option>rain</option>
              <option>sleet</option>
              <option>hail</option>
              <option>snow</option>
            </select>
            <select v-if="newData.type == 'wind speed'" v-model="windDirection" required>
              <option disabled value="">direction</option>
              <option>East</option>
              <option>West</option>
              <option>South</option>
              <option>North</option>
              <option>SouthWest</option>
              <option>SouthEast</option>
              <option>NorthEast</option>
              <option>NorthWest</option>
            </select>
            <input v-model="newData.value" required type="number" placeholder="value"></input>
            <input v-model="newData.date" required type="date" placeholder="date"></input>
            <input v-model="newData.time" required type="time" placeholder="time"></input>
            <button @click="sendNewData()">send</button>
          </div>
        </div>

        <div style=" width: 100%; margin-top: 5%;">
          <p class="title">Choose timeframe of prediction data you want to swipe
            trough</p>
          <div class="inputCalendar">
            <input placeholder="yyyy-mm-dd" min="2020-11-10" max="2020-11-11" v-model="predictionStartDate"
                   type="date">
            <input style="margin-left: 2%; " min="2020-11-10 " max="2020-11-11" placeholder="yyyy-mm-dd"
                   v-model="predictionEndDate" type="date">
          </div>

          <div class="slider carousel" v-if="!this.loading_historic">
            <swiper ref="mySwiper" class="swiper" :options="swiperOptions2">
              <swiper-slide v-for="(weather, index) in this.predictionInRange " :key="index">
                <div class="sliderItem predictionsContainer">
                  <div style="height: 20%">
                    <p class="predictionDay">{{ weather.date | moment('ddd') }}</p>
                    <p class="text" style="margin-bottom: 15px">{{ weather.date | moment('HH:mm') }}</p>
                  </div>
                  <div class="predictionContainer">
                    <v-icon name="temperature-low" class="iconInCircle"
                            style=" margin-right: 10px;"/>
                    <p class="text">from: </p>
                    <b>{{ weather.weather[0].from }}°C </b>
                    <p class="text"> to: </p>
                    <b>{{ weather.weather[0].to }}°C </b>
                  </div>

                  <div class="predictionContainer">
                    <v-icon name="cloud" class="iconInCircle"
                            style=" margin-right: 10px;"/>
                    <p class="text">from: </p>
                    <b>{{ weather.weather[3].from }}%</b>
                    <p class="text"> to: </p>
                    <b>{{ weather.weather[3].to }}%</b>
                  </div>

                  <div class="predictionContainer">
                    <v-icon name="umbrella" class="iconInCircle"
                            style=" margin-right: 10px;"/>
                    <p class="text">from: </p>
                    <b>{{ weather.weather[1].from }}mm </b>
                    <p class="text"> to: </p>
                    <b>{{ weather.weather[1].to }}mm </b>
                  </div>
                  <p style="margin: 0;width: 80%;font-size: 0.8em"> precipitation types: <span
                    v-for="(types, index) in weather.weather[1].precipitation_types"
                    :key="index"> {{ types }}, </span></p>

                  <div class="predictionContainer">
                    <v-icon name="wind" class="iconInCircle"
                            style=" margin-right: 10px;"/>
                    <p class="text">from: </p>
                    <b>{{ weather.weather[2].from }}m/s </b>
                    <p class="text"> to: </p>
                    <b>{{ weather.weather[2].to }}m/s </b>
                  </div>
                  <p style="margin: 0;width: 80%;font-size: 0.8em"> wind direction: <span
                    v-for="(types, index) in weather.weather[2].directions"
                    :key="index"> {{ types }}, </span></p>
                </div>
              </swiper-slide>
              <div class="swiper-pagination" slot="pagination"></div>
            </swiper>
          </div>
        </div>

        <sync-loader v-if="this.loading_historic"
                     class="loaderDots"
                     :size="6"
                     :loading="loading_historic"
        />
      </div>
    </div>
  </div>
</template>

<script>

import {mapGetters} from 'vuex'
import weatherService from '../services/weatherService.js'
import weather_historic from './weather_historic.vue'
import moment from 'moment'
import {SyncLoader} from '@saeris/vue-spinners'

export default {

  mounted() {
    this.$store.dispatch('fetchWeatherData', 'Horsens').then(() => {
      this.loading_historic = false;
    })
    this.$store.dispatch('fetchPrediction', 'Horsens').then(() => {
      this.loading_predictive = false;
    })
    this.$store.dispatch('fetchCurrentWeather', 'Horsens')
    this.city = 'Horsens'
    this.cityImage = 'https://cdn.flixbus.de/styles/flixbus_w1600/s3/2017-08/horsens-general-info.jpg?itok=Im2kTfsy'

  },
  components: {weather_historic, SyncLoader},
  data() {
    return {
      newData: {type: '', date: '', time: '', value: ''},
      windDirection: '',
      precipitation_type: '',
      city: '',
      cityImage: '',
      loading_historic: true,
      loading_predictive: true,
      startDate: '2020-11-02',
      endDate: '2020-11-08',
      predictionStartDate: '2020-11-10',
      predictionEndDate: '2020-11-11',
      lang: true,
      usUnits: {temp: '° F', rain: 'inch'},
      intUnits: {temp: '° C', rain: 'mm'},
      swiperOptions: {
        slidesPerView: 6,
        spaceBetween: 12,
      },
      swiperOptions2: {
        slidesPerView: 4,
        spaceBetween: 15,
      }
    }
  },
  computed: {
    ...mapGetters([
      'getWeatherData',
      'getCurrentWeather',
      'getPredictionData'
    ]),
    setImage() {
      let value = weatherService.getIcon(this.getCurrentWeather, this.lang)
      if (value == undefined) {
        value = 'sun'
      }
      return require(`../assets/${value}.png`)
    },
    swiper() {
      return this.$refs.mySwiper.$swiper
    },
    weatherInRange() {
      return weatherService.getWeatherInRange(this.getWeatherData, this.city, this.startDate, this.endDate)
    },
    predictionInRange() {
      return weatherService.getWeatherForecast(this.getPredictionData, this.city, this.predictionStartDate, this.predictionEndDate)
    }
  },
  methods: {
    loadCurrentWeather(city) {
      this.city = city
      if (this.city === 'Horsens') {
        this.cityImage = 'https://cdn.flixbus.de/styles/flixbus_w1600/s3/2017-08/horsens-general-info.jpg?itok=Im2kTfsy'
      } else if (this.city === 'Aarhus') {
        this.cityImage = 'https://www.besttravelmonths.com/uploads/2018/06/beste-reistijd-aarhus-denemarken-1200x675.jpg'
      } else {
        this.cityImage = 'https://media.cntraveler.com/photos/5bfdb12a1b3466234d8136c5/master/w_1600%2Cc_limit/GettyImages-1045586638.jpg'
      }
      this.$store.dispatch('fetchCurrentWeather', city)
    },
    toggleUnits(value) {
      if (this.lang && value === 'us') {
        this.$store.dispatch('convertToUSValues', this.getCurrentWeather)
        this.lang = !this.lang
      } else if (!this.lang && value === 'int') {
        this.$store.dispatch('convertToIntValues', this.getCurrentWeather)
        this.lang = !this.lang
      }
    },
    getValues(object) {
      return {
        max: weatherService.getMaxValue(object, 'temperature'),
        min: weatherService.getMinValue(object, 'temperature'),
        icon: weatherService.getIcon(this.getGroupedAvgData(object), this.lang)
      }
    },

    getMedian(values) {
      if (values.length === 0) return 0;

      values.sort(function (a, b) {
        return a - b;
      });

      var half = Math.floor(values.length / 2);

      if (values.length % 2)
        return values[half];

      return (values[half - 1] + values[half]) / 2.0;
    },

    getGroupedAvgData(object) {
      let avgTemp = this.getMedian([...object.filter(item => item.type === 'temperature').map(item => item.value)]).toFixed(2)
      let sumPercipitation = this.getMedian([...object.filter(item => item.type === 'precipitation').map(item => item.value)]).toFixed(2)
      let avgWindSpeed = ([...object.filter(item => item.type === 'wind speed').map(item => item.value)].reduce((a, b) => (a + b), 0) / 24).toFixed(2)
      let avgCloudCoverage = this.getMedian([...object.filter(item => item.type === 'cloud coverage').map(item => item.value)]).toFixed(2)
      return {
        temperature: avgTemp,
        windSpeed: avgWindSpeed,
        precipitation: sumPercipitation,
        cloudCoverage: avgCloudCoverage
      }
    },
    getUnit(unit) {
      switch (unit) {
        case 'temperature' :
          return '˚C'
        case 'wind speed' :
          return 'm/s'
        case 'cloud coverage' :
          return '%'
        case 'precipitation' :
          return 'mm'
      }
    },
    sendNewData() {
      let time = `${this.newData.date}T${this.newData.time}:00.000Z`

      let toSend = {
        value: parseFloat(this.newData.value),
        type: this.newData.type,
        unit: this.getUnit(this.newData.type),
        time: time,
        place: this.city
      }

      if (toSend.type === 'precipitation') {
        toSend.precipitation_type = this.precipitation_type;
      }

      if (toSend.type === 'wind speed') {
        toSend.direction = this.windDirection;
      }

      this.$store.dispatch('addHistoricData', toSend)
    }

  }
}

</script>

<style>

.loaderDots {
  margin: auto;
  display: block;
  position: absolute;
  top: 45%;
  left: 40%;
  transform: translate(-50%, -50%);
}


.wrapper {
  width: 80%;
  margin: 10vh auto;
  height: 80vh;
  border-radius: 2.5em;
  overflow: hidden;
}

.weatherContainer {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
}

.leftContainer {
  height: 100%;
  flex: 2;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: white;
  padding: 3% 4% 1% 4%;
}

.header {
  height: 3%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.text {
  font-size: 0.8em;
  color: #181414;
  margin: 0;
}

.prediction {
  display: flex;
  align-items: center;
  margin-top: 4%;
}

.weatherImageContainer {
  align-self: center;
  width: 70%;
  height: 25%;
  margin: 13% 0 10% 0;
}

.weatherImage {
  height: 100%;
  width: 100%;
  object-fit: contain;
}

.iconInCircle {
  color: gray;
  background-color: #dddddd;
  padding: 0.4em;
  border-radius: 20px
}

.iconInCircle:hover {
  cursor: pointer;
}

.temperatureContainer {
  margin: 0;
  height: 10vh
}

.temperature {
  margin-top: -10px;
  display: flex;
  font-size: 8vh;
  letter-spacing: -5px;
  font-weight: lighter;
}

.temperatureType {
  font-size: 0.5em;
  margin-top: 10px;
  margin-left: 7px;
  justify-content: start
}

.dateTimeContainer {
  height: 5%;
  display: flex;
  margin: 8% 0 0 0
}

.day {
  align-self: start;
  margin: 0;
  font-size: 0.9em;
  letter-spacing: 1px;
  font-weight: 500
}

.lightText {
  margin: 0;
  font-weight: 200;
  color: gray
}

hr {
  border-top: 1px solid #dddddd;
  border-left: none;
  margin: 7% auto 2% auto;
  width: 35%;
}

.cityImageContainer {
  height: 20%;
  border-radius: 20px;
  overflow: hidden;
  width: 100%;
  text-align: center;
  position: relative;
  align-self: center;
  margin: 10% 0 10% 0
}

.cityImage {
  height: 100%;
  width: 100%;
  position: absolut;
  object-fit: fill
}

.cityTitle {
  position: absolute;
  top: 30%;
  transform: translate(-50%, -50%);
  left: 50%;
  color: white;
  font-size: 3vh;
  font-weight: bolder;
}

.overlay {
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: rgba(20, 38, 76, 0.06);
}

.cityButtons {
  display: flex;
  flex-direction: row;
  height: 4%;
  align-items: center;
}

.cityButtonActive {
  border-bottom: 1px solid #000;
  font-weight: 500;
  font-size: 1.1em;
}

.cityButtonInactive {
  font-weight: 500;
  color: gray
}

.cityButtonInactive:hover {
  transform: scale(1.1);
  transition: all 0.5s ease-in-out;
}

.cityTogglButton {
  margin-right: 7%;
}

.cityTogglButton:hover {
  cursor: pointer;
}

.rightContainer {
  flex: 5;
  max-width: 70%;
  height: 100%;
  box-sizing: border-box;
  background: #dddddd;
  padding: 5px 30px;
}

.rightHeader {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.langButtons {
  display: flex;
  height: 4%;
  align-items: center;
}

.langButton {
  margin: 0 5px;
  border-radius: 25px;
  padding: 0.8em;
  width: 20px;
  font-size: 0.8em;
  font-weight: 200;
  height: 17px;
}

.langButton:hover {
  cursor: pointer;
}

.langButtonActive {
  background-color: #130d0d;
  color: white;
  font-weight: 800;
}

.langButtonInactive {
  color: #130d0d;
  background-color: white;
}

.button:hover, .button:active, .button:focus {
  background: #43A047;
}

.carousel {
  height: 15%;
  width: 100%;
  display: flex;
}

.swiper {
  width: 100%;
  height: 100%;
  margin: 0
}

.inputCalendar {
  display: flex;
  margin: 3% 0;
  align-items: center
}

.title {
  margin: 0;
  text-align: start;
  font-size: 1.3em;
  font-weight: bolder
}

input, select, button {
  display: inline-block;
  width: auto;
  margin: 0 0.6em;
  padding: 0 0.5em;
  outline: none !important;
  border: 3px solid transparent;
  border-radius: 0.5em;
  box-sizing: border-box;
  font-weight: bolder;
  height: 2vh;
  transition: all 0.5s ease-in-out;
}

button {
  background-color: gray;
  color: white;
  width: 5vw;
  text-transform: uppercase;
}

.predictionContainer {
  display: flex;
  width: 85%;
  margin: 0;
  flex-direction: row;
  align-items: center;
  justify-content: space-around
}

.predictionContainer p {
  margin: 10px 0
}

.predictionsContainer {
  height: 22vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  background-color: white;
  border-radius: 15px
}

.predictionDay {
  color: cornflowerblue;
  font-size: 1.3em;
  margin: 5px 0 0 0;
  text-transform: uppercase;
  font-weight: bolder
}


</style>
