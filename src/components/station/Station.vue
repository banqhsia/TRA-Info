<template>

  <div class="ui grid stackable container">

    <Loading v-if="status == 'loading'"></Loading>

    <div class="row">

      <div class="ui sixteen wide column">
        <div class="ui red segment">
          <h2 class="ui header">{{ station.WebsiteName }}
            <p>{{ station.Station_EName }} Station</p>
            <div class="sub header">
              {{ period.humanize }}，共有 {{ trainInfo.length }} 班列車。
              <a class="ui label" v-if="!period.today" @click="backToday()"><i class="reply icon"></i>回到今天</a>
            </div>

          </h2>

          <div class="ui list">
            <div class="item">
              <div class="ui orange horizontal label">電話</div>
              {{ station.Telephone }}
            </div>
            <div class="item">
              <div class="ui green horizontal label">地址</div>
              {{ station.ChineseAddress }}
            </div>
          </div>

          <!-- 隱藏已離站列車 toggle -->
          <div class="ui toggle checkbox" v-if="period.today && trainInfo">
            <input type="checkbox" v-model="hideDepartured">
            <label>隱藏已離站列車</label>
          </div>

        </div>

      </div>
    </div>


    <div class="row">
      <div class="ui sixteen wide column">

        <div class="ui two buttons">
          <div class="ui button" :class=" (direction == 0) ? 'active' : '' " @click="directionSwitch(0)">順行</div>
          <div class="ui button" :class=" (direction == 1 ) ? 'active' : ''  " @click="directionSwitch(1) ">逆行</div>
        </div>

      </div>
    </div>

    <!-- COMPUTER TABLET ONLY -->
    <div class="computer tablet only row ">

      <div class="ui sixteen wide column ">

        <table class="ui selectable striped definition table ">
          <thead>
            <th class="two wide ">詳細資料</th>

            <th class="one wide center aligned ">
              <h4 class="ui header ">經由
                <div class="sub header ">Via</div>
              </h4>
            </th>

            <th class="two wide center aligned ">
              <h4 class="ui header ">開車時間
                <div class="sub header ">Departure</div>
              </h4>
            </th>

            <th class="two wide center aligned "></th>
            <th class="two wide center aligned ">
              <h4 class="ui header ">終點站
                <div class="sub header ">Destination</div>
              </h4>
            </th>
            <th class="one wide left aligned " v-if="delay">
              <h4 class="ui header ">誤點
                <div class="sub header ">Delay</div>
              </h4>
            </th>

          </thead>
          <tbody>
            <tr class="pointer " v-show="(!period.today || !hideDepartured || !isDeparture( item.DepartureTime ))" v-for="item in trainInfoList">
              <!-- 車次 -->
              <td>
                <h3 class="ui header" :class="[$options.filters.trainClassZH(item.TrainClassificationName, true)]">
                  {{ item.TrainClassificationName | trainClassZH }}
                  <!-- {{ item.TrainClassificationName || '無' }} -->
                  <div class="sub header ">{{ item.TrainNo }}</div>
                </h3>
              </td>

              <!-- 經由 -->
              <td class="center aligned ">
                <a class="ui circular basic label" :class="[$options.filters.tripLine(item.TripLine, true)]" v-if="item.TripLine">
                     {{ item.TripLine | tripLine }}
                  </a>
              </td>

              <!-- 出發時間 -->
              <td class="center aligned departure-time ">{{ item.DepartureTime }}</td>

              <!-- 途經 -->
              <td class="center aligned">
                <h5 class="ui trip icon header ">
                  <i class="arrow right icon "></i>
                  <div class="sub header ">
                    <!-- Arrow Note -->
                  </div>
                </h5>
              </td>

              <!-- 終點站 -->
              <td class="center aligned ">
                <h5 class="ui header ">
                  {{ searchStation(item.EndingStationID).Station_Name }}
                  <div class=" sub header ">
                    {{ searchStation(item.EndingStationID).Station_EName }}
                  </div>
                </h5>
              </td>

              <!-- 誤點 -->
              <td v-if="delay">
                <div v-if="isDelay(item.TrainNo, delayInfo, true)">
                  <div class="ui circular empty horizontal medium label delay-indicator" :class="isDelay(item.TrainNo, delayInfo, true)"></div>
                  <span>{{ isDelay( item.TrainNo, delayInfo ) }}</span>
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
  export default {
    data() {
      return {
        station: '',
        trainInfo: [],
        delayInfo: [],
        direction: undefined,
        hideDepartured: true,
        status: 'loading',
      }
    },
    methods: {
      /**
       * Get a station object
       */
      getStation: function () {
        this.station = this.searchStation(this.$route.params.station);

        // Station not exists
        if (!this.station) {
          this.$router.push('/station');
        }

        this.getTrainInfo();
      },
      /**
       * Send a request to get train info
       */
      getTrainInfo: function () {

        axios.get(
            'https://ptx.transportdata.tw/MOTC/v2/Rail/TRA/DailyTimetable/Station/' +
            this.station.Station_Code_4 + '/' +
            this.period.date +
            '?$format=JSON'
          )
          .then(
            (response) => {
              this.trainInfo = response.data;
              this.status = true;
            },
            (error) => {
              this.status = false;
            }
          );

        // If it's today, send live board reuqest
        this.getLiveboard(this.station.Station_Code_4).then(
          (response) => {
            this.delayInfo = response.data;
          }
        ) && this.period.today;

      },
      /**
       * Switch direction
       */
      directionSwitch: function (d) {

        this.direction = (d == this.direction) ?
          undefined :
          d;
      },
      /**
       * Back today
       */
      backToday: function () {
        this.period = this.searchDate()
        this.status = 'loading'
        this.getTrainInfo()
        this.$router.replace({
          params: {
            date: this.period.date
          }
        })
      }
    },
    computed: {
      /**
       * Check if it's qualify to show delay information
       */
      delay: function () {
        return (!!this.delayInfo.length && this.period.today) || false;
      },

      /**
       * Train info search
       */
      trainInfoList: function () {

        if (this.direction == undefined) {
          return this.trainInfo
        }

        return this.trainInfo.filter((train) => {
          return train.Direction == this.direction
        })
      }

    },
    mounted() {
      this.getStation();
    },
  }

</script>
