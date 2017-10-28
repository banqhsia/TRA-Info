// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios';
import moment from 'moment';
import fuse from 'fuse.js'
import VueLocalStorage from 'vue-ls';

/**
 * Style Files
 */
require('semantic-ui/dist/semantic.min.css');

/**
 * Extra Custom Scripts
 */
require('./helpers');


/**
 * Mount components
 */
Vue.component('Loading', require('./components/snippets/Loading.vue').default);



/**
 * Moment.js
 */
Vue.prototype.moment = moment;
/**
 * Lodash
 */
Vue.prototype._ = require('lodash');

moment.locale('zh_tw');

Vue.config.productionTip = false


window.Fuse = fuse;
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

Vue.use(VueLocalStorage);


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: {
    App
  }
})
