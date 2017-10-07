<template>
  <div class="ui grid stackable container">

    <Loading v-if="status == 'loading'"></Loading>

    <div class="row">

      <div class="ui sixteen wide column">

        <div class="ui form">

          <div class="field">
            <div class="ui left action icon input">
              <button class="ui icon button" @click="searchEmpty()"><i class="trash icon"></i></button>
              <input type="text" ref="keyword" v-model.trim="input.keyword" @keypress.enter="search()" placeholder="中壢 台北 明天 自強號" :disabled="status == 'loading'">
              <i class="inverted circular search link icon" @click="search()"></i>
            </div>
          </div>
        </div>

      </div>

    </div>

    <div class="row">

      <div class="ui sixteen wide column">

        <div class="ui green message" v-if="!timeTablesList && status != false && status != 'loading'">
          <div class="header">請輸入關鍵字查詢列車時刻</div>
          <p>輸入起迄站、時間、車種即可。「中壢 新竹」「鳳山 新左 11/7」「106 108」「嘉義 民雄 星期四 莒光」</p>
        </div>

        <div class="ui red message" v-if="status == false && status != 'loading'">
          <div class="header">查無此站或格式錯誤</div>
          <p>請輸入起迄站、時間、車種即可。「中壢 新竹」「新左營 鳳山 週四」「高雄 嘉義 1/18 自強號」。可用 1/18、1月18日、1-18、星期四、週四。車站可以進行模糊搜尋「鳳山 新左」「Tapei Xiny」，但沒有簡稱 (北車 高火)。可以輸入車種以過濾「台北 花蓮 傾斜式」「中壢 台北 對號」。
            <router-link :to="{
              name: 'About'
            }">
              詳細說明
            </router-link>
          </p>
        </div>

        <!-- Info Segment -->
        <div class="ui secondary segment" v-if="timeTablesList">
          <div class="ui grid stackable">

            <div class="eleven wide column message">
              <h3 class="ui header">

                {{ period.humanize }}

                <div class="ui sub header">

                  <router-link :to="{
                    name: 'Station.view',
                    params: {
                      station: sdStations.startStation.Station_Code_4,
                      date: period.date
                    }
                  }">{{sdStations.startStation.Station_Name}}
                  </router-link> 到

                  <router-link :to="{
                    name: 'Station.view',
                    params: {
                      station: sdStations.destStation.Station_Code_4,
                      date: period.date
                    }
                  }">{{sdStations.destStation.Station_Name}}
                  </router-link> 的

                  <span class="ui pointer" @click="clearFilter()">
                    {{ trainClassMap.desc || '所有列車' }}
                    <i class="delete red icon" v-if="!_.isEmpty(trainClassMap)"></i>
                  </span>

                </div>

              </h3>
              <p>
                共有 {{ timeTables.length }} 班列車
                <span v-if="!_.isEmpty(trainClassMap)">，顯示 {{ timeTablesList.length }} 個結果</span>
              </p>
            </div>

            <!-- Fares Table -->
            <div class="ui five wide column" v-if="fares">
              <table class="ui very compact unstackable very basic table">
                <thead>
                  <tr>
                    <th class="three wide"></th>
                    <th class="three wide">
                      <h5 class="ui red header pointer" @click="setTrainClassMap('tc')">
                        自強
                        <div class="sub header">
                          T.C.
                        </div>
                      </h5>
                    </th>
                    <th class="three wide">
                      <h5 class="ui orange header pointer" @click="setTrainClassMap('ck')">
                        莒光
                        <div class="sub header">
                          C.K.
                        </div>
                      </h5>
                    </th>
                    <th class="three wide">
                      <h5 class="ui header pointer" @click="setTrainClassMap('lt')">
                        區間
                        <div class="sub header">
                          L.T.
                        </div>
                      </h5>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>票價</td>
                    <td>{{ trainFare(1100) }} </td>
                    <td>{{ trainFare(1110) }} </td>
                    <td>{{ trainFare(1120) }} </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- END OF SIX WIDE COLUMN -->
          </div>
        </div>
        <!-- END OF SECONDARY SEGMENT -->

        <!-- 隱藏已離站列車 toggle -->
        <div class="ui toggle checkbox" v-if="period.today && timeTablesList">
          <input type="checkbox" v-model="hideDepartured">
          <label>隱藏已離站列車</label>
        </div>

      </div>

    </div>

    <!-- COMPUTER ONLY ROW -->
    <div class="computer only row" v-if="timeTablesList">
      <div class="ui sixteen wide column">

        <table class="ui selectable striped definition table">
          <thead>
            <tr>
              <th class="two wide"></th>
              <th class="one wide center aligned">
                <h4 class="ui header">經由
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

                <h4 class="ui header pointer" @click="setOrderBy('DestinationStopTime.ArrivalTime')">
                  <i class="icon sort" :class="[ orderByClass('DestinationStopTime.ArrivalTime') ]"></i>
                  <div class="content">
                    抵達時間
                    <div class="sub header">Arrival</div>
                  </div>
                </h4>

              </th>
              <th class="five wide">
                <h4 class="ui header">其他
                  <div class="sub header">Information</div>
                </h4>
              </th>

              <th class="one wide" v-if="delay">
                <h4 class="ui header">誤點
                  <div class="sub header">Delay</div>
                </h4>
              </th>
              <th class="one wide">
                <h4 class="ui header">票價
                  <div class="sub header">Fare</div>
                </h4>
              </th>
            </tr>
          </thead>
          <tbody>

            <!-- Link; Rendered as <tr> -->
            <router-link class="pointer" tag="tr" :key="item.DailyTrainInfo.TrainNo" :to="{
              name: 'Timetable.train',
              params: {
                train: item.DailyTrainInfo.TrainNo,
                date: period.date
              }
            }" v-show="(!period.today || !hideDepartured || !isDeparture( item.OriginStopTime.DepartureTime ))" v-for="item in timeTablesList">

              <!-- 列車資訊 -->
              <td>
                <div class="ui grid">
                  <div class="row">

                    <!-- 車種 -->
                    <div class="sixteen wide column">
                      <h3 class="ui header" :class="[$options.filters.trainClass(item.DailyTrainInfo.TrainClassificationID, true)]">
                        {{ item.DailyTrainInfo.TrainClassificationID | trainClass }}
                        <h5 class="ui right floated header">
                          <div class="sub header">
                            {{ item.DailyTrainInfo.TrainNo }}
                          </div>
                        </h5>
                      </h3>

                    </div>

                    <!-- 終點站 -->
                    <div class="sixteen wide column">
                      <h5 class="ui header">
                        <div class="sub header">
                          {{ searchStation(item.DailyTrainInfo.StartingStationID).Station_Name }}<i class="arrow right icon inline-icon"></i>{{searchStation(item.DailyTrainInfo.EndingStationID).Station_Name}}
                        </div>
                      </h5>
                    </div>

                  </div>
                </div>
              </td>

              <!-- 經由 -->
              <td class="center aligned">
                <div class="ui circular basic label" :class="[$options.filters.tripLine(item.DailyTrainInfo.TripLine, true)]" v-if="item.DailyTrainInfo.TripLine">
                  {{ item.DailyTrainInfo.TripLine | tripLine }}
                </div>
              </td>

              <!-- 出發時間 -->
              <td class="center aligned departure-time">{{ item.OriginStopTime.DepartureTime }}</td>

              <!-- 途經 -->
              <td class="center aligned">
                <h5 class="ui trip icon header">
                  <i class="arrow right icon"></i>
                  <div class="sub header">
                    {{ item.TravelTime.humanize }}
                  </div>
                </h5>
              </td>

              <!-- 抵達時間 -->
              <td class="center aligned">{{ item.DestinationStopTime.ArrivalTime }}</td>

              <td>

                <div class="ui basic grey horizontal medium label">
                  {{ item.DestinationStopTime.StopSequence - item.OriginStopTime.StopSequence }}站
                </div>

                <div class="ui blue horizontal medium label" v-if="item.DailyTrainInfo.WheelchairFlag">
                  輪椅
                </div>

                <div class="ui pink horizontal medium label" v-if="item.DailyTrainInfo.BreastFeedingFlag">
                  哺乳室
                </div>

                <div class="ui green horizontal medium label" v-if="item.DailyTrainInfo.BikeFlag">
                  自行車
                </div>

                <div class="ui yellow horizontal medium label" v-if="DMULabel(item.DailyTrainInfo.Note.Zh_tw)">
                  柴聯
                </div>

                <div class="ui brown horizontal medium label" v-if="acrossDayLabel(item.DailyTrainInfo.Note.Zh_tw)">
                  跨日
                </div>

                {{ item.DailyTrainInfo.Note.Zh_tw | noteFormat }}

              </td>

              <!-- 誤點 -->
              <td v-if="delay">
                <div v-if="isDelay(item.DailyTrainInfo.TrainNo , delayInfo, true)">
                  <div class="ui circular empty horizontal medium label delay-indicator" :class="isDelay(item.DailyTrainInfo.TrainNo , delayInfo, true)"></div>
                  <span>{{ isDelay( item.DailyTrainInfo.TrainNo , delayInfo ) }}</span>
                </div>
              </td>

              <!-- 票價 -->
              <td>
                <p v-if="fares">
                  {{ trainFare(item.DailyTrainInfo.TrainClassificationID) }}

                </p>
              </td>

            </router-link>
          </tbody>
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
          <div class="item active">
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
              <i class="icon mini sort" :class="[ orderByClass('DestinationStopTime.ArrivalTime') ]"></i>
              <div class="content">
                抵達時間
                <div class="sub header">Arrival</div>
              </div>
            </h5>
          </div>

        </div>

        <!-- Link; Rendered as <div> -->
        <router-link class="ui fluid card pointer" tag="div" :key="item.DailyTrainInfo.TrainNo" :to="{
              name: 'Timetable.train',
              params: {
                train: item.DailyTrainInfo.TrainNo,
                date: period.date
              }
            }" v-show="(!period.today || !hideDepartured || !isDeparture( item.OriginStopTime.DepartureTime ))" v-for="item in timeTablesList">

          <div class="content">

            <div class="ui grid">
              <div class="row">

                <!-- 車種 -->
                <div class="four wide column">
                  <h3 class="ui header" :class="[$options.filters.trainClass(item.DailyTrainInfo.TrainClassificationID, true)]">
                    {{ item.DailyTrainInfo.TrainClassificationID | trainClass }}
                    <div class="sub header">
                      {{ item.DailyTrainInfo.TrainNo }}
                    </div>
                  </h3>
                </div>

                <!-- 起迄站 -->
                <div class="five wide column">
                  <h5 class="ui header center aligned">
                    <div class="sub header">
                      {{ searchStation(item.DailyTrainInfo.StartingStationID).Station_Name }}<i class="arrow right icon inline-icon"></i>{{searchStation(item.DailyTrainInfo.EndingStationID).Station_Name}}
                    </div>
                  </h5>
                </div>

                <!-- 誤點 -->
                <div class="three wide column">
                  <div class="left floated ui" v-if="delay">

                    <div v-if="isDelay(item.DailyTrainInfo.TrainNo , delayInfo, true)">
                      <div class="ui circular empty horizontal medium label delay-indicator" :class="isDelay(item.DailyTrainInfo.TrainNo , delayInfo, true)"></div>
                      <span>{{ isDelay( item.DailyTrainInfo.TrainNo , delayInfo ) }}</span>
                    </div>

                  </div>
                </div>

                <!-- 經由 -->
                <div class="four wide column">
                  <div class="ui right floated">

                    <div class="ui circular basic label" :class="[$options.filters.tripLine(item.DailyTrainInfo.TripLine, true)]" v-if="item.DailyTrainInfo.TripLine">
                      {{ item.DailyTrainInfo.TripLine | tripLine }}
                    </div>

                  </div>
                </div>

              </div>

            </div>

            <div class="description">
              <div class="ui grid">
                <!-- 出發時間 -->
                <div class="three wide column departure-time">
                  {{ item.OriginStopTime.DepartureTime }}
                </div>

                <!-- 箭頭 -->
                <div class="two wide column"><i class="arrow right icon"></i></div>

                <!-- 抵達 -->
                <div class="three wide column">
                  {{ item.DestinationStopTime.ArrivalTime }}
                </div>

                <!-- 途經 -->
                <div class="five wide center aligned column">
                  {{ item.TravelTime.humanize }}
                </div>

                <!-- 票價 -->
                <div class="three wide right aligned column">
                  <p v-if="fares">
                    {{ trainFare(item.DailyTrainInfo.TrainClassificationID) }}
                  </p>
                </div>
              </div>

            </div>
          </div>
          <div class="extra content">

            <div class="ui basic grey horizontal medium label">
              {{ item.DestinationStopTime.StopSequence - item.OriginStopTime.StopSequence }}站
            </div>

            <div class="ui blue horizontal medium label" v-if="item.DailyTrainInfo.WheelchairFlag">
              輪椅
            </div>

            <div class="ui pink horizontal medium label" v-if="item.DailyTrainInfo.BreastFeedingFlag">
              哺乳室
            </div>

            <div class="ui green horizontal medium label" v-if="item.DailyTrainInfo.BikeFlag">
              自行車
            </div>

            <div class="ui yellow horizontal medium label" v-if="DMULabel(item.DailyTrainInfo.Note.Zh_tw)">
              柴聯
            </div>

            <div class="ui brown horizontal medium label" v-if="acrossDayLabel(item.DailyTrainInfo.Note.Zh_tw)">
              跨日
            </div>

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
  import trainClasses from '../../../static/trainclasses.json'

  export default {
    data() {
      return {
        input: {
          keyword: this.$ls.get('input.keyword', ''),
        },
        sdStations: this.$ls.get('sdStations', {
          startStation: null,
          destStation: null,
        }),
        timeTables: this.$ls.get('timeTables', false),
        delayInfo: [],
        trainClassMap: this.$ls.get('trainClassMap', {}),
        hideDepartured: true,
        fares: this.$ls.get('fares', false),
        status: null,
        keywordArray: [],
        orderByField: this.$ls.get('orderByField', {
          field: 'OriginStopTime.DepartureTime',
          order: 'asc',
        }),
        orderByFieldClass: {}
      }
    },
    methods: {

      /**
       * Test if user wants to query by TrainNo
       */
      retTrainNo: function () {

        if ((this.keywordArray.length <= 2) && (/^\d{2,4}$/.test(this.keywordArray[0])) && !(/^\d{1,}$/.test(this.keywordArray[
            1]))) {

          this.period = this.searchDate(this.keywordArray[1]);

          this.$ls.set('input.keyword', this.keyword);

          this.$router.push({
            name: 'Timetable.train',
            params: {
              train: this.keywordArray[0],
              date: this.period.date
            }
          })

        }

      },
      /**
       * Search Handler
       */
      search: function () {

        // Split input keyword into an array
        this.keywordArray = this.strToArray(this.keyword) || false;

        if (!this.keyword) return false;

        /**
         * Retrieve If user wants a certain train.
         */
        this.retTrainNo();

        /**
         * Search initialization
         */
        this.fares = false;
        this.timeTables = false;

        /* ---- START of finding trainClassList (for filter)
         * trainClassIndex : Find which index of the array is train class definition `自強`, `莒光`...
         * trainClassMap   : Find the list of class description. eg [1100, 1101, 1102, 1107, 1108] for `自強號`
         */
        let trainClassIndex = this.keywordArray.findIndex((item) => {
          return this.searchTrainClass(item);
        });

        // Set trainClassMap filter
        this.setTrainClassMap(this.keywordArray[trainClassIndex]);

        // Remove the train class description from `keywordArray` to prevent impacting others
        (trainClassIndex != -1) && this.keywordArray.splice(trainClassIndex, 1)

        // ---- END of finding trainClassIndex

        // Override `this.peroid`
        this.period = this.searchDate(this.keywordArray[2]);
        // Set period result to localStorage
        this.$ls.set('period.date', this.period.date)

        this.sdStations = {
          startStation: this.searchStation(this.keywordArray[0], true),
          destStation: this.searchStation(this.keywordArray[1], true)
        }

        // Check if both startStation and destStation exists
        if (this.sdStations.startStation && this.sdStations.destStation) {

          // Set sdStations, input.keyword to localStorage
          this.$ls.set('sdStations', this.sdStations);
          this.$ls.set('input.keyword', this.keyword);

          // Set result to Query params.
          this.setResultParams();

          this.status = 'loading';

          /**
           * Get fares between two station.
           */
          this.getODFare(
            this.sdStations.startStation.Station_Code_4,
            this.sdStations.destStation.Station_Code_4
          ).then(
            (response) => {
              this.fares = response.data[0].Fares;
              // Set Fares info to localStorage
              this.$ls.set('fares', this.fares);

            }
          );

          /**
           * Get Daily TimeTable.
           */
          this.getDailyTimeTableOD(
            this.sdStations.startStation.Station_Code_4,
            this.sdStations.destStation.Station_Code_4
          ).then(
            (response) => {
              this.timeTables = response.data;

              /**
               * Create a field called `TravelTime` for sorting
               */
              this.timeTables.forEach((item) => {
                item.TravelTime = this.timeDiff(item.OriginStopTime.DepartureTime, item.DestinationStopTime.ArrivalTime)
              })

              // Set time tables result to localStorage
              this.$ls.set('timeTables', this.timeTables);

              this.status = true;
            },
            (error) => {
              this.status = false;
            }
          );;

          // If it's today, send live board reuqest
          this.getLiveboard(this.sdStations.startStation.Station_Code_4).then(
            (response) => {
              this.delayInfo = response.data;
            }
          ) && this.period.today;

        } else {
          this.status = false;
        }

      },


      /**
       * Return the train fare by searching request result
       */
      trainFare: function (c) {

        if (!c || !this.fares) return 'N/A';

        let classFare = trainClasses.find((trainclass) => {
          return trainclass.classNo == c
        }).classFare

        return '$' + this.fares.find((fare) => {
          return fare.TicketType == classFare
        }).Price

      },

      /**
       * Empty the search field and set focus
       */
      searchEmpty: function () {

        this.input.keyword = null;
        this.$refs.keyword.focus()

        this.timeTables = false;
        this.fares = false;

        this.orderByField = {
          field: 'OriginStopTime.DepartureTime',
          order: 'asc',
        };

        this.$router.replace({
          query: null,
        })

        // Clear all localStorage result
        this.$ls.clear();
      },

      /**
       * Remove the trainClassMap filter in order to show all the trains.
       */
      clearFilter: function () {
        this.trainClassMap = {};
      },

      /**
       * Set TrainClassMap after calling this.searchTrainClass.
       * Return empty object if find no result.
       */
      setTrainClassMap: function (c) {
        this.trainClassMap = this.searchTrainClass(c) || {};
        // Set trainClassMap to localStorage
        this.$ls.set('trainClassMap', this.trainClassMap)
      },

      /**
       * Set Order By
       */
      setOrderBy: function (f) {

        // If it's same field, toggle `asc` or `desc`
        if (f == this.orderByField.field) {
          this.orderByField.order = (this.orderByField.order == 'asc') ? 'desc' : 'asc'
        }

        // Otherwise change field
        this.orderByField.field = f

        // Set result to Query params.
        this.setResultParams();

        // Set orderByField to localStorage
        this.$ls.set('orderByField', this.orderByField);

      },

      /**
       * Set result to Query params in order to get same query next time.
       */
      setResultParams: function () {
        this.$router.push({
          query: {
            k: this.input.keyword,
            f: this.orderByField.field,
            o: this.orderByField.order,
          }
        })
      },

      /**
       * Return order by fields' icon class name
       */
      orderByClass: function (f) {

        return (f == this.orderByField.field) && (
          (this.orderByField.order == 'asc') ? 'red ascending' : 'red descending'
        )

      }

    },
    computed: {
      keyword: function () {
        return this.taiTransform(this.input.keyword)
      },
      /**
       * Check if it's qualify to show delay information
       */
      delay: function () {
        return (!!this.delayInfo.length && this.period.today) || false;
      },
      timeTablesList: function () {

        // Retrive train result
        let r = this.timeTables

        // Return false if there's no such result.
        if (!r) return false;

        // return the original array if the list not sets.
        if (!_.isEmpty(this.trainClassMap)) {

          r = r.filter((item) => {
            return this.trainClassMap.list.indexOf(Number(item.DailyTrainInfo.TrainClassificationID)) != -1;
          })

        }

        // OrderBy a field
        r = _.orderBy(r, this.orderByField.field, this.orderByField.order)

        return r;

      },
    },
    mounted() {

      if (this.$route.query.f) {
        this.orderByField.field = this.$route.query.f
      }

      if (this.$route.query.o) {
        this.orderByField.order = this.$route.query.o
      }

      if (this.$route.query.k) {
        this.input.keyword = this.$route.query.k;
        this.search();
      }

      this.$refs.keyword.focus()

    }
  }

</script>
