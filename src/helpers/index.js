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
  mounted() {
    /**
     * Control user reload & clear local storage manually
     */
    let ver = '201807111859';
    let refresh = this.$ls.get('app.refresh', false);

    if ( !refresh || refresh !== ver ) {
        this.$ls.clear();
        this.$ls.set('app.refresh', ver);
        location.reload();
    }

  }
})
