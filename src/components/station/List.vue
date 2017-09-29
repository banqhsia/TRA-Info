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

            <router-link tag="tr" class="pointer" v-for="station in station" :to="
              {
                name: 'Station.view',
                params: {
                  station: station.Station_Code_4,
                  date: period.date
                }
              }" :key="station.$id">
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
            </router-link>
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
        stations: stations,
      }
    },
    computed: {
      /**
       * Find in stations
       **/
      station: function () {

        if (!this.keyword) return this.stations

        return new Fuse(this.stations, {
          // Fuse.js Fuzzy searching score
          threshold: 0.1,
          // Define which field to find
          keys: ['Station_Name', 'Station_EName', 'Station_Code_3', 'ChineseAddress', 'Telephone'],
        }).search(this.input.keyword)

      },
      keyword: function () {
        return this.taiTransform(this.input.keyword);
      }
    }
  }

</script>
