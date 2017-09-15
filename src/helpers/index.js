import Vue from 'vue'

Vue.mixin({
  methods: require('./methods.js').default,
  filters: require('./filters.js').default,
})
