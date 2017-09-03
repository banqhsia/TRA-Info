import Vue from 'vue'

Vue.mixin({
  methods: {
    /**
	   * Transform `台` into `臺` in order to search the station.
	   * return string with `臺`
     */
    taiTransform: function (word) {
      return word.replace('台', '臺') || '';
    }
  }
})
