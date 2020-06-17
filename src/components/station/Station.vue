<template>
  <div class="ui grid stackable container">
    <Loading v-if="_.isNull(station)"></Loading>

    <div class="row" v-if="station">
      <div class="ui sixteen wide column">
        <div class="ui red segment">
          <h2 class="ui header">
            {{ station.StationName.Zh_tw }}
            <p>{{ station.StationName.En }}</p>
            <div class="sub header">
              {{ query.dateHumanize }}
              <span v-if="!_.isEmpty(trains)">，共有 {{ trains.length }} 班列車</span>。
              <a class="ui label" v-if="!query.isToday" @click="backToday()">
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
          <div class="ui toggle checkbox" v-if="query.isToday && trainsRendered">
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
            @click="directionSwitch('0')"
          >順行</div>
          <div
            class="ui button"
            :class=" (direction == 1 ) ? 'active' : ''  "
            @click="directionSwitch('1') "
          >逆行</div>
        </div>
      </div>
    </div>

    <!-- COMPUTER TABLET ONLY -->
    <div class="computer tablet only row" v-if="station && trainsRendered">
      <div class="ui sixteen wide column">
        <Loading v-if="_.isEmpty(trainsRendered)"></Loading>

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
          </thead>
          <tbody>
            <TrainItem
              class="pointer"
              :key="train.TrainInfo.TrainNo"
              :train="train"
              v-for="train in trainsRendered"
              v-show="(!query.isToday || !hideDepartured || !isDeparture( train.TrainInfo.DepartureTime ))"
              @click.native="toTrainDetail(train)"
            />
          </tbody>
        </table>
      </div>
    </div>

    <!-- MOBILE TABLET ONLY -->
    <div class="mobile only row">
      <div class="ui sixteen wide column">
        <TrainItemMobile
          class="pointer"
          :key="train.TrainInfo.TrainNo"
          :train="train"
          v-for="train in trainsRendered"
          v-show="(!query.isToday || !hideDepartured || !isDeparture( train.TrainInfo.DepartureTime ))"
          @click.native="toTrainDetail(train)"
        ></TrainItemMobile>
      </div>
      <!-- END OF 16 WIDE COLUMN -->
    </div>
    <!-- END OF MOBILE ONLY ROW  -->
  </div>
</template>


<script>
import TrainItem from "./TrainItem.vue";
import TrainItemMobile from "./TrainItemMobile.vue";

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
     * 導航到列車詳細資訊
     */
    toTrainDetail: function(train) {
      this.$router.push({
        name: "Timetable.train",
        params: {
          train: train.TrainInfo.TrainNo,
          date: this.query.date
        }
      });
    },
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
      let filtered = _.isUndefined(this.direction)
        ? this.trains
        : _.filter(this.trains, {
            TrainInfo: { Direction: this.direction }
          });

      return _.orderBy(filtered, "TrainInfo.DepartureTime", "asc");
    }
  },
  components: {
    TrainItem,
    TrainItemMobile
  },
  mounted() {
    this.init();
  }
};
</script>
