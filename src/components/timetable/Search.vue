<template>
  <div class="ui grid stackable container">
    <Loading v-if="status == 'loading'"></Loading>

    <div class="row">
      <div class="ui sixteen wide column">
        <div class="ui form">
          <div class="field">
            <div class="ui left action icon input">
              <button class="ui icon button" @click="searchEmpty()">
                <i class="trash icon"></i>
              </button>
              <input
                type="text"
                ref="keyword"
                v-model.trim="input.keyword"
                @keypress.enter="search()"
                placeholder="中壢 台北 明天 自強號"
                :disabled="status == 'loading'"
              />
              <i class="inverted circular search link icon" @click="search()"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="ui sixteen wide column">
        <!-- 查詢說明 -->
        <SearchTips v-if="!trains && status != false && status != 'loading'"></SearchTips>

        <!-- 查詢錯誤 -->
        <SearchError v-if="status == false && status != 'loading'"></SearchError>

        <!-- Info Segment -->
        <Briefing v-if="trains" :query="query" :trains="trains" :fares="fares"></Briefing>

        <!-- 隱藏已離站列車 toggle -->
        <div class="ui toggle checkbox" v-if="period.today && timeTablesList">
          <input type="checkbox" v-model="hideDepartured" />
          <label>隱藏已離站列車</label>
        </div>
      </div>
    </div>

    <!-- COMPUTER ONLY ROW -->
    <div class="computer only row" v-if="trains">
      <div class="ui sixteen wide column">
        <table class="ui selectable striped definition table">
          <thead>
            <tr>
              <th class="two wide"></th>
              <th class="one wide center aligned">
                <h4 class="ui header">
                  經由
                  <div class="sub header">Via</div>
                </h4>
              </th>

              <th class="two wide center aligned">
                <h4 class="ui header pointer" @click="setOrderBy('OriginStopTime.DepartureTime')">
                  <i class="icon sort" :class="[ orderByClass('OriginStopTime.DepartureTime') ]"></i>
                  <div class="content">
                    開車時間
                    <div class="sub header">Departure</div>
                  </div>
                </h4>
              </th>

              <th class="two wide center aligned">
                <h4 class="ui header pointer" @click="setOrderBy('TravelTime.value')">
                  <i class="icon sort" :class="[ orderByClass('TravelTime.value') ]"></i>
                  <div class="content">
                    行車時間
                    <div class="sub header">Travel Time</div>
                  </div>
                </h4>
              </th>
              <th class="two wide center aligned">
                <h4
                  class="ui header pointer"
                  @click="setOrderBy('DestinationStopTime.ArrivalTime')"
                >
                  <i class="icon sort" :class="[ orderByClass('DestinationStopTime.ArrivalTime') ]"></i>
                  <div class="content">
                    抵達時間
                    <div class="sub header">Arrival</div>
                  </div>
                </h4>
              </th>
              <th class="five wide">
                <h4 class="ui header">
                  其他
                  <div class="sub header">Information</div>
                </h4>
              </th>

              <th class="one wide" v-if="delay">
                <h4 class="ui header">
                  誤點
                  <div class="sub header">Delay</div>
                </h4>
              </th>
              <th class="one wide">
                <h4 class="ui header">
                  票價
                  <div class="sub header">Fare</div>
                </h4>
              </th>
            </tr>
          </thead>
          <TrainItem
            class="pointer"
            v-for="train in trains"
            @click.native="toTrainDetail(train)"
            :key="train.TrainInfo.TrainNo"
            :train="train"
          ></TrainItem>
        </table>
      </div>
    </div>
    <!-- END OF COMPUTER ONLY ROW  -->

    <!-- MOBILE TABLET ONLY -->
    <div class="mobile tablet only row" v-if="timeTablesList">
      <div class="ui sixteen wide column">
        <div class="ui small three item menu">
          <div class="item">
            <h5 class="ui header pointer" @click="setOrderBy('OriginStopTime.DepartureTime')">
              <i class="icon mini sort" :class="[ orderByClass('OriginStopTime.DepartureTime') ]"></i>
              <div class="content">
                開車時間
                <div class="sub header">Departure</div>
              </div>
            </h5>
          </div>
          <div class="item">
            <h5 class="ui header pointer" @click="setOrderBy('TravelTime.value')">
              <i class="icon mini sort" :class="[ orderByClass('TravelTime.value') ]"></i>
              <div class="content">
                行車時間
                <div class="sub header">Travel Time</div>
              </div>
            </h5>
          </div>
          <div class="item">
            <h5 class="ui header pointer" @click="setOrderBy('DestinationStopTime.ArrivalTime')">
              <i
                class="icon mini sort"
                :class="[ orderByClass('DestinationStopTime.ArrivalTime') ]"
              ></i>
              <div class="content">
                抵達時間
                <div class="sub header">Arrival</div>
              </div>
            </h5>
          </div>
        </div>

        <!-- Link; Rendered as <div> -->
        <router-link
          class="ui fluid card pointer"
          tag="div"
          :key="item.DailyTrainInfo.TrainNo"
          :to="{
              name: 'Timetable.train',
              params: {
                train: item.DailyTrainInfo.TrainNo,
                date: period.date
              }
            }"
          v-show="(!period.today || !hideDepartured || !isDeparture( item.OriginStopTime.DepartureTime ))"
          v-for="item in timeTablesList"
        >
          <div class="content">
            <div class="ui grid">
              <div class="row">
                <!-- 車種 -->
                <div class="four wide column">
                  <h3
                    class="ui header"
                    :class="[trainClass(item.DailyTrainInfo.TrainTypeID, true)]"
                  >
                    {{ trainClass(item.DailyTrainInfo.TrainTypeID) }}
                    <div class="sub header">{{ item.DailyTrainInfo.TrainNo }}</div>
                  </h3>
                </div>

                <!-- 起迄站 -->
                <div class="five wide column">
                  <h5 class="ui header center aligned">
                    <div class="sub header">
                      {{ searchStation(item.DailyTrainInfo.StartingStationID).Station_Name }}
                      <i
                        class="arrow right icon inline-icon"
                      ></i>
                      {{searchStation(item.DailyTrainInfo.EndingStationID).Station_Name}}
                    </div>
                  </h5>
                </div>

                <!-- 誤點 -->
                <div class="three wide column">
                  <div class="left floated ui" v-if="delay">
                    <div v-if="isDelay(item.DailyTrainInfo.TrainNo , delayInfo, true)">
                      <div
                        class="ui circular empty horizontal medium label delay-indicator"
                        :class="isDelay(item.DailyTrainInfo.TrainNo , delayInfo, true)"
                      ></div>
                      <span>{{ isDelay( item.DailyTrainInfo.TrainNo , delayInfo ) }}</span>
                    </div>
                  </div>
                </div>

                <!-- 經由 -->
                <div class="four wide column">
                  <div class="ui right floated">
                    <div
                      class="ui circular basic label"
                      :class="[tripLine(item.DailyTrainInfo.TripLine, true)]"
                      v-if="item.DailyTrainInfo.TripLine"
                    >{{ tripLine(item.DailyTrainInfo.TripLine) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="description">
              <div class="ui grid">
                <!-- 出發時間 -->
                <div
                  class="three wide column departure-time"
                >{{ item.OriginStopTime.DepartureTime }}</div>

                <!-- 箭頭 -->
                <div class="two wide column">
                  <i class="arrow right icon"></i>
                </div>

                <!-- 抵達 -->
                <div class="three wide column">{{ item.DestinationStopTime.ArrivalTime }}</div>

                <!-- 途經 -->
                <div class="five wide center aligned column">{{ item.TravelTime.humanize }}</div>

                <!-- 票價 -->
                <div class="three wide right aligned column">
                  <p v-if="fares">{{ trainFare(item.DailyTrainInfo.TrainTypeID) }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="extra content">
            <div
              class="ui basic grey horizontal medium label"
            >{{ item.DestinationStopTime.StopSequence - item.OriginStopTime.StopSequence }}站</div>

            <div
              class="ui blue horizontal medium label"
              v-if="item.DailyTrainInfo.WheelchairFlag"
            >輪椅</div>

            <div
              class="ui pink horizontal medium label"
              v-if="item.DailyTrainInfo.BreastFeedingFlag"
            >哺乳室</div>

            <div class="ui green horizontal medium label" v-if="item.DailyTrainInfo.BikeFlag">自行車</div>

            <div
              class="ui yellow horizontal medium label"
              v-if="DMULabel(item.DailyTrainInfo.Note.Zh_tw)"
            >柴聯</div>

            <div
              class="ui brown horizontal medium label"
              v-if="acrossDayLabel(item.DailyTrainInfo.Note.Zh_tw)"
            >跨日</div>
            {{ item.DailyTrainInfo.Note.Zh_tw | noteFormat }}
          </div>
        </router-link>
      </div>
      <!-- END OF 16 WIDE COLUMN -->
    </div>
    <!-- END OF MOBILE, TABLET ONLY ROW  -->
  </div>
</template>

<script>
import trainClasses from "../../../static/trainclasses.json";
import TrainItem from "./TrainItem.vue";
import SearchTips from "./SearchTips.vue";
import SearchError from "./SearchError.vue";
import Briefing from "./Briefing.vue";

export default {
  data() {
    return {
      input: {
        // keyword: this.$ls.get('input.keyword', ''),
        keyword: "中壢 台北"
      },
      sdStations: this.$ls.get("sdStations", {
        startStation: null,
        destStation: null
      }),
      timeTables: this.$ls.get("timeTables", false),
      delayInfo: [],
      trainClassMap: this.$ls.get("trainClassMap", {}),
      hideDepartured: true,
      fares: null,
      status: null,
      keywordArray: [],
      orderByField: this.$ls.get("orderByField", {
        field: "OriginStopTime.DepartureTime",
        order: "asc"
      }),
      orderByFieldClass: {},
      trains: null,
      query: null
    };
  },
  components: {
    TrainItem,
    SearchTips,
    SearchError,
    Briefing
  },
  methods: {
    toTrainDetail: function(train) {
      this.$router.push({
        name: "Timetable.train",
        params: {
          train: train.TrainInfo.TrainNo,
          date: query.date
        }
      });
    },
    /**
     * Test if user wants to query by TrainNo
     */
    retTrainNo: function() {
      if (
        this.keywordArray.length <= 2 &&
        /^\d{2,4}$/.test(this.keywordArray[0]) &&
        !/^\d{1,}$/.test(this.keywordArray[1])
      ) {
        this.period = this.searchDate(this.keywordArray[1]);

        this.$ls.set("input.keyword", this.keyword);

        this.$router.push({
          name: "Timetable.train",
          params: {
            train: this.keywordArray[0],
            date: this.query.date
          }
        });
      }
    },
    /**
     * Search Handler
     */
    search: function() {
      this.status = "loading";
      /**
       * Get Daily TimeTable.
       */
      this.searchTimetableBetweenOriginAndDestination(this.keyword).then(
        response => {
          this.trains = response.data.payload;
          this.query = response.data.query;
          this.fares = response.data.fares;

          this.status = true;
        },
        error => {
          console.log(error);

          this.status = false;
        }
      );
    },

    /**
     * Return the train fare by searching request result
     */
    trainFare: function(c) {
      if (!c || !this.fares) return "N/A";

      let classFare = trainClasses.find(trainclass => {
        return trainclass.classNo == c;
      }).classFare;

      return (
        "$" +
        this.fares.find(fare => {
          return fare.TicketType == classFare;
        }).Price
      );
    },

    /**
     * Empty the search field and set focus
     */
    searchEmpty: function() {
      this.input.keyword = null;
      this.$refs.keyword.focus();

      this.timeTables = false;
      this.fares = false;

      this.orderByField = {
        field: "OriginStopTime.DepartureTime",
        order: "asc"
      };

      this.$router.replace({
        query: null
      });

      // Clear all localStorage result
      this.$ls.clear();
    },

    /**
     * Remove the trainClassMap filter in order to show all the trains.
     */
    clearFilter: function() {
      this.trainClassMap = {};
    },

    /**
     * Set TrainClassMap after calling this.searchTrainClass.
     * Return empty object if find no result.
     */
    setTrainClassMap: function(c) {
      this.trainClassMap = this.searchTrainClass(c) || {};
      // Set trainClassMap to localStorage
      this.$ls.set("trainClassMap", this.trainClassMap);
    },

    /**
     * Set Order By
     */
    setOrderBy: function(f) {
      // If it's same field, toggle `asc` or `desc`
      if (f == this.orderByField.field) {
        this.orderByField.order =
          this.orderByField.order == "asc" ? "desc" : "asc";
      }

      // Otherwise change field
      this.orderByField.field = f;

      // Set result to Query params.
      this.setResultParams();

      // Set orderByField to localStorage
      this.$ls.set("orderByField", this.orderByField);
    },

    /**
     * Set result to Query params in order to get same query next time.
     */
    setResultParams: function() {
      this.$router.push({
        query: {
          k: this.input.keyword,
          f: this.orderByField.field,
          o: this.orderByField.order
        }
      });
    },

    /**
     * Return order by fields' icon class name
     */
    orderByClass: function(f) {
      return (
        f == this.orderByField.field &&
        (this.orderByField.order == "asc" ? "red ascending" : "red descending")
      );
    }
  },
  computed: {
    keyword: function() {
      return this.taiTransform(this.input.keyword);
    },
    /**
     * Check if it's qualify to show delay information
     */
    delay: function() {
      return (!!this.delayInfo.length && this.period.today) || false;
    },
    timeTablesList: function() {
      // Retrive train result
      let r = this.timeTables;

      // Return false if there's no such result.
      if (!r) return false;

      // return the original array if the list not sets.
      if (!_.isEmpty(this.trainClassMap)) {
        r = r.filter(item => {
          return (
            this.trainClassMap.list.indexOf(
              Number(item.DailyTrainInfo.TrainTypeID)
            ) != -1
          );
        });
      }

      // OrderBy a field
      r = _.orderBy(r, this.orderByField.field, this.orderByField.order);

      return r;
    }
  },
  mounted() {
    if (this.$route.query.f) {
      this.orderByField.field = this.$route.query.f;
    }

    if (this.$route.query.o) {
      this.orderByField.order = this.$route.query.o;
    }

    if (this.$route.query.k) {
      this.input.keyword = this.$route.query.k;
      this.search();
    }

    this.$refs.keyword.focus();
  }
};
</script>
