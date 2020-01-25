<template>
  <div class="ui grid stackable container">
    <div class="row">
      <div class="ui sixteen wide column">
        <div class="ui form">
          <div class="field" :class="{ error: isEmptyResult }">
            <input type="text" placeholder="車站名稱、代碼" autofocus v-model.trim="input.keyword" />
          </div>
        </div>
      </div>
    </div>

    <Loading v-if="_.isEmpty(stations)" />

    <div class="row">
      <div class="ui sixteen wide column">
        <!-- Station Not Found Message -->
        <div class="ui orange message" v-if="isEmptyResult">查無此車站，請重新輸入車站名稱或車站代碼查詢</div>

        <table class="ui definition table" v-else>
          <thead>
            <tr>
              <th class="two wide"></th>
              <th class="one wide">
                <h4 class="ui header">
                  編號
                  <div class="sub header">Code</div>
                </h4>
              </th>
              <th class="three wide">
                <h4 class="ui header">
                  電話
                  <div class="sub header">Telephone</div>
                </h4>
              </th>
              <th class="five wide">
                <h4 class="ui header">
                  地址
                  <div class="sub header">Address</div>
                </h4>
              </th>
            </tr>
          </thead>
          <tbody>
            <router-link
              tag="tr"
              class="pointer"
              v-for="station in stationsRendered"
              :to="
              {
                name: 'Station.view',
                params: {
                  station: station.StationID,
                  date: period.date
                }
              }"
              :key="station.$id"
            >
              <td>
                <h4 class="ui header">
                  <i class="icon grey">{{ stationClass(station.StationClass) }}</i>
                  <div class="content pointer">
                    {{ station.StationName.Zh_tw }}
                    <div class="sub header">{{station.StationName.En }}</div>
                  </div>
                </h4>
              </td>
              <td>{{ station.StationID }}</td>
              <td>{{ station.StationPhone }}</td>
              <td>{{ station.StationAddress }}</td>
            </router-link>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      input: {
        keyword: ""
      },
      stations: []
    };
  },
  methods: {
    stationClass: function(givenLevel) {
      let levels = {
        "0": "特",
        "4": "簡",
        "5": "招"
      };

      return _.get(levels, givenLevel, givenLevel);
    }
  },
  computed: {
    isEmptyResult: function() {
      return !_.isEmpty(this.stations) && _.isEmpty(this.stationsRendered);
    },
    stationsRendered: function() {
      if (_.isEmpty(this.keyword)) {
        return _.orderBy(this.stations, ["StationID"], "asc");
      }

      return new Fuse(this.stations, {
        threshold: 0.2,
        keys: [
          "StationID",
          "StationName.Zh_tw",
          "StationName.En",
          "StationAddress",
          "StationPhone"
        ]
      }).search(this.keyword);
    },
    keyword: function() {
      return this.taiTransform(this.input.keyword);
    }
  },
  mounted() {
    let stations = this.$ls.get("stations");

    if (!_.isNull(stations)) {
      return (this.stations = stations);
    }

    this.getStations().then(
      response => {
        this.stations = response.data.payload;

        let expireMs = this.moment()
          .add(6, "hours")
          .diff();

        this.$ls.set("stations", this.stations, expireMs);
      },
      error => {
        // this.status = false;
      }
    );
  }
};
</script>
