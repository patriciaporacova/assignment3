// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store/store'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import moment from 'vue-moment'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import { VueSpinners } from '@saeris/vue-spinners';
import VueSwal from 'vue-swal';


// import style (>= Swiper 6.x)
import 'swiper/swiper-bundle.css'


Vue.use(VueSpinners);
Vue.use(VueSwal);

Vue.use(VueAwesomeSwiper, /* { default options with global component } */)

Vue.config.productionTip = false

Vue.component('v-icon', Icon)
Vue.use(moment);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App},
  template: '<App/>'
})
