<template>
  <div class="ui grid stackable container">
    <div class="row">
      <div class="ui sixteen wide column">
        <div class="ui form">
          <div class="field" :class="{ error: !station.length }">
            <input type="text" placeholder="車站名稱、代碼" autofocus v-model.trim="input.keyword" />
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="ui sixteen wide column">
        <!-- Station Not Found Message -->
        <div class="ui orange message" v-if="!station.length">查無此車站，請重新輸入車站名稱或車站代碼查詢</div>

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
              v-for="station in station"
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
                  <router-link
                    class="content pointer"
                    tag="div"
                    :to="'/station/'+station.StationID"
                  >
                    {{ station.StationName.Zh_tw }}
                    <div class="sub header">{{station.StationName.En }}</div>
                  </router-link>
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
    station: function() {
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
    this.getStations().then(
      response => {
        this.stations = response.data.payload;
      },
      error => {
        // this.status = false;
      }
    );
  }
};
</script>
