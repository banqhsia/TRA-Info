import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'

Vue.use(Router)

export default new Router({
  linkActiveClass: 'active',
  base: '/trainfo/',
  routes: [
    {
      path: '/',
      redirect: '/timetable'
    },
    {
      path: '/timetable',
      name: 'Timetable',
      component: require('../components/timetable/Search.vue').default
    },
    {
      path: '/timetable/:train/:date?',
      name: 'Timetable.train',
      component: require('../components/timetable/Train.vue').default
    },
    {
      path: '/station',
      name: 'Station',
      component: require('../components/station/Stations.vue').default
    },
    {
      path: '/station/:station/:date?',
      name: 'Station.view',
      component: require('../components/station/Station.vue').default
    },
    {
      path: '/about',
      name: 'About',
      component: require('../components/templates/About.vue').default
    },
  ]
})
