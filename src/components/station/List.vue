<template>

  <div class="ui grid stackable container">

    <div class="row">

      <div class="ui sixteen wide column">

        <div class="ui form">
          <div class="field" :class="{ error: !station.length }">
            <input type="text" placeholder="車站名稱、代碼" autofocus="" v-model.trim="input.keyword">
          </div>
        </div>

      </div>

    </div>

    <div class="row">

      <div class="ui sixteen wide column">

        <!-- Station Not Found Message -->
        <div class="ui orange message" v-if="!station.length">
          查無此車站，請重新輸入車站名稱或車站代碼查詢
        </div>

        <table class="ui definition table" v-else>
          <thead>
            <tr>
              <th class="two wide"></th>
              <th class="one wide">
                <h4 class="ui header">編號
                  <div class="sub header">Code</div>
                </h4>
              </th>
              <th class="three wide">
                <h4 class="ui header">電話
                  <div class="sub header">Telephone</div>
                </h4>
              </th>
              <th class="five wide">
                <h4 class="ui header">地址
                  <div class="sub header">Address</div>
                </h4>
              </th>
            </tr>
          </thead>
          <tbody>

            <tr class="pointer" v-for="station in station" ng-click="goToStationInfo()">
              <td>
                <h3 class="ui header">{{ station.Station_Name }}
                  <div class="sub header">{{ station.EnglishName }}</div>
                </h3>
              </td>
              <td>{{ station.Station_Code_3 }}</td>
              <td>{{ station.Telephone }}</td>
              <td>
                {{ station.ChineseAddress }}
                <div class="content">
                  {{ station.EnglishAddress }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

      </div>

    </div>
  </div>

</template>

<script>
  import stations from '../../../static/stations.json'

  export default {
    data() {
      return {
        input: {
          keyword: ''
        },
        stations: stations
      }
    },
    computed: {
      /**
       * Find in stations
       **/
      station: function () {

        let keyword = this.keyword;

        if (!keyword) return this.stations

        // Define which field to find
        let target = (/(\d)/.test(this.input.keyword)) ? "Station_Code_3" : "Station_Name";

        // Find in stations list
        return this.stations.filter(function (station) {
          return station[target].toString().includes(keyword)
        });
      },
      keyword: function () {
        return this.taiTransform(this.input.keyword);
      }
    }
  }

</script>
