import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'

Vue.use(Router)

export default new Router({
  mode: 'history',
  linkActiveClass: 'active',
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/timetable',
      name: 'Timetable',
      component: require('../components/timetable/Search.vue').default
    },
    {
      path: '/station',
      name: 'Station',
      component: require('../components/station/List.vue').default
    }

  ]
})
