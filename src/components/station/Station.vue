<template>
  <div class="ui grid stackable container">
    <Loading v-if="status == 'loading'"></Loading>

    <div class="row">
      <div class="ui sixteen wide column">
        <div class="ui red segment">
          <h2 class="ui header">
            {{ station.StationName.Zh_tw }}
            <p>{{ station.StationName.En }}</p>
            <div class="sub header">
              {{ query.dateHumanize }}
              <!-- ，共有 {{ trainInfo.length }} 班列車 -->
              。
              <a class="ui label" v-if="!period.today" @click="backToday()">
                <i class="reply icon"></i>回到今天
              </a>
            </div>
          </h2>

          <div class="ui list">
            <div class="item">
              <div class="ui orange horizontal label">電話</div>
              {{ station.StationPhone }}
            </div>
            <div class="item">
              <div class="ui green horizontal label">地址</div>
              {{ station.StationAddress }}
            </div>
          </div>

          <!-- 隱藏已離站列車 toggle -->
          <div class="ui toggle checkbox" v-if="period.today && trainInfo">
            <input type="checkbox" v-model="hideDepartured" />
            <label>隱藏已離站列車</label>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="ui sixteen wide column">
        <div class="ui two buttons">
          <div
            class="ui button"
            :class=" (direction == 0) ? 'active' : '' "
            @click="directionSwitch(0)"
          >順行</div>
          <div
            class="ui button"
            :class=" (direction == 1 ) ? 'active' : ''  "
            @click="directionSwitch(1) "
          >逆行</div>
        </div>
      </div>
    </div>

    <!-- COMPUTER TABLET ONLY -->
    <div class="computer tablet only row">
      <div class="ui sixteen wide column">
        <table class="ui selectable striped definition table">
          <thead>
            <th class="two wide">詳細資料</th>

            <th class="one wide center aligned">
              <h4 class="ui header">
                經由
                <div class="sub header">Via</div>
              </h4>
            </th>

            <th class="two wide center aligned">
              <h4 class="ui header">
                開車時間
                <div class="sub header">Departure</div>
              </h4>
            </th>

            <th class="two wide center aligned"></th>
            <th class="two wide center aligned">
              <h4 class="ui header">
                終點站
                <div class="sub header">Destination</div>
              </h4>
            </th>
            <th class="one wide left aligned" v-if="delay">
              <h4 class="ui header">
                誤點
                <div class="sub header">Delay</div>
              </h4>
            </th>
          </thead>
          <tbody>
            <!-- Link; Rendered as <tr> -->
            <!-- v-show="(!period.today || !hideDepartured || !isDeparture( item.DepartureTime ))" -->

            <router-link
              tag="tr"
              class="pointer"
              :key="item.TrainInfo.TrainNo"
              v-for="item in trains"
              :to="{
                name: 'Timetable.train',
                params: {
                  train: item.TrainInfo.TrainNo,
                  date: query.date
                }
              }"
            >
              <!-- 車次 -->
              <td>
                <h3 class="ui header">
                  {{ item.TrainInfo.TrainTypeName.Zh_tw }}
                  <div class="sub header">{{ item.TrainInfo.TrainNo }}</div>
                </h3>
              </td>

              <!-- 經由 -->
              <td class="center aligned">
                <div
                  class="ui circular basic label"
                  :class="[tripLine(item.TrainInfo.TripLine, true)]"
                  v-if="item.TrainInfo.TripLine"
                >{{ tripLine(item.TrainInfo.TripLine) }}</div>
              </td>

              <!-- 出發時間 -->
              <td class="center aligned departure-time">{{ item.TrainInfo.DepartureTime }}</td>

              <!-- 途經 -->
              <td class="center aligned">
                <h5 class="ui trip icon header">
                  <i class="arrow right icon"></i>
                  <div class="sub header">
                    <!-- Arrow Note -->
                  </div>
                </h5>
              </td>

              <!-- 終點站 -->
              <td class="center aligned">
                <h5 class="ui header">
                  {{ item.TrainInfo.EndingStationName.Zh_tw }}
                  <div class="sub header">{{ item.TrainInfo.EndingStationName.En }}</div>
                </h5>
              </td>
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
      query: null,
      station: null,
      trains: [],

      trainInfo: false,
      delayInfo: [],
      direction: undefined,
      hideDepartured: true,
      status: true
    };
  },
  methods: {
    /**
     * Page initialization
     */
    init: function() {
      this.getStationDetail(
        this.$route.params.station,
        this.$route.params.date
      ).then(
        response => {
          this.query = response.data.query;
          this.station = response.data.payload;

          /** handle 找不到此站 */
          // this.$router.push('/station');

          this.getTimetableByStationNo(
            this.$route.params.station,
            this.$route.params.date
          ).then(
            response => {
              this.trains = response.data.payload;
              // this.status = true;
            },
            error => {
              // this.status = false;
            }
          );
        },
        error => {}
      );

      // If it's today, send live board reuqest
      this.getLiveboard(this.station.Station_Code_4).then(response => {
        this.delayInfo = response.data;
      }) && this.period.today;
    },
    /**
     * Switch direction
     */
    directionSwitch: function(d) {
      this.direction = d == this.direction ? undefined : d;
    },
    /**
     * Back today
     */
    backToday: function() {
      this.period = this.searchDate();
      this.status = "loading";
      this.trainInfo = false;
      this.init();
      this.$router.replace({
        params: {
          date: this.period.date
        }
      });
    }
  },
  computed: {
    trainsRendered: function() {
      return _.flatten(this.trains)[0];
    },

    /**
     * Check if it's qualify to show delay information
     */
    delay: function() {
      return (!!this.delayInfo.length && this.period.today) || false;
    },

    /**
     * Train info search
     */
    trainInfoList: function() {
      if (this.direction == undefined) {
        return this.trainInfo;
      }

      return this.trainInfo.filter(train => {
        return train.Direction == this.direction;
      });
    }
  },
  mounted() {
    this.init();
  }
};
</script>
