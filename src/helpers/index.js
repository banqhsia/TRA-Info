import Vue from 'vue'

Vue.mixin({
  data() {
    return {
      /**
       * Get date from Route parameters
       */
      period: this.searchDate(this.$route.params.date || this.$ls.get('period.date'))
    }
  },
  methods: require('./methods.js').default,
  filters: require('./filters.js').default,
})
