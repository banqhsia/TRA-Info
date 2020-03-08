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
            <TrainItem :key="train.TrainInfo.TrainNo" v-for="train in trainsRendered" :train="train" />
            <!--
 <router-link
      v-show="(!query.isToday || !hideDepartured || !isDeparture( item.TrainInfo.DepartureTime ))"
      tag="tr"
      class="pointer"
      :key="item.TrainInfo.TrainNo"
      v-for="item in trainsRendered"
      :to="{
                name: 'Timetable.train',
                params: {
                  train: item.TrainInfo.TrainNo,
                  date: query.date
                }
              }"
            >-->
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>


<script>
import TrainItem from "./TrainItem.vue";

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
    },

    /**
     * Check if it's qualify to show delay information
     */
    delay: function() {
      return (!!this.delayInfo.length && this.period.today) || false;
    }
  },
  components: {
    TrainItem
  },
  mounted() {
    this.init();
  }
};
</script>
