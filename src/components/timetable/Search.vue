<template>
  <div class="ui grid stackable container">

    <Loading v-if="status == 'loading'"></Loading>

    <div class="row">

      <div class="ui sixteen wide column">

        <div class="ui form">

          <div class="field">
            <div class="ui left action icon input">
              <button class="ui icon button" @click="searchEmpty()"><i class="trash icon"></i></button>
              <input type="text" ref="keyword" v-model.trim="input.keyword" @keypress.enter="search()" placeholder="中壢 台北 明天 自強號" autofocus>
              <i class="inverted circular search link icon" @click="search()"></i>
            </div>
          </div>
        </div>

      </div>

    </div>

    <div class="row">

      <div class="ui sixteen wide column">

        <div class="ui green message" v-if="!timeTablesList.length && status != false && status != 'loading'">
          <div class="header">請輸入關鍵字查詢列車時刻</div>
          <p>輸入起迄站 (+時間) (+車種) 即可。「中壢 新竹」「新左營 鳳山 11/7」「嘉義 民雄 週四 莒光號」</p>
        </div>

        <div class="ui red message" v-if="status == false && status != 'loading'">
          <div class="header">查無此站或格式錯誤</div>
          <p>請輸入起迄站(時間)「中壢 新竹」「新左營 鳳山 週四」「高雄 嘉義 1/18 自強號」。可用 1/18、1月18日、1-18、星期四、週四。車站請輸入全名，沒有簡稱 (北車 高火)</p>
        </div>

        <!-- Info Segment -->
        <div class="ui secondary segment" v-if="timeTablesList.length">
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
                      <h5 class="ui red header">
                        自強
                        <div class="sub header">
                          T.C.
                        </div>
                      </h5>
                    </th>
                    <th class="three wide">
                      <h5 class="ui orange header">
                        莒光
                        <div class="sub header">
                          C.K.
                        </div>
                      </h5>
                    </th>
                    <th class="three wide">
                      <h5 class="ui header">
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
                    <td>{{ trainFare('1100') }} </td>
                    <td>{{ trainFare('1110') }} </td>
                    <td>{{ trainFare('1120') }} </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- END OF SIX WIDE COLUMN -->
          </div>
        </div>
        <!-- END OF SECONDARY SEGMENT -->

        <!-- 隱藏已離站列車 toggle -->
        <div class="ui toggle checkbox" v-if="period.today && !_.isEmpty(timeTablesList) ">
          <input type="checkbox" v-model="hideDepartured">
          <label>隱藏已離站列車</label>
        </div>

      </div>

    </div>

    <!-- COMPUTER ONLY ROW -->
    <div class="computer only row" v-if="timeTablesList.length > 0">
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
                <h4 class="ui header">開車時間
                  <div class="sub header">Departure</div>
                </h4>
              </th>
              <th class="two wide center aligned"></th>
              <th class="two wide center aligned">
                <h4 class="ui header">抵達時間
                  <div class="sub header">Arrival</div>
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

            <tr class="pointer" v-show="(!period.today || !hideDepartured || !isDeparture( item.OriginStopTime.DepartureTime ))" v-for="item in timeTablesList">

              <!-- 車次 -->
              <td>
                <h3 class="ui header" :class="[$options.filters.trainClass(item.DailyTrainInfo.TrainClassificationID, true)]">{{ item.DailyTrainInfo.TrainClassificationID | trainClass }}
                  <div class="sub header">
                    {{ item.DailyTrainInfo.TrainNo }}<br>
                    <!-- 終點站 -->
                    {{ searchStation(item.DailyTrainInfo.EndingStationID).Station_Name }}
                  </div>

                </h3>
              </td>

              <!-- 經由 -->
              <td class="center aligned">
                <a class="ui circular basic label" :class="[$options.filters.tripLine(item.DailyTrainInfo.TripLine, true)]" v-if="item.DailyTrainInfo.TripLine">
                  {{ item.DailyTrainInfo.TripLine | tripLine }}
                </a>
              </td>

              <!-- 出發時間 -->
              <td class="center aligned departure-time">{{ item.OriginStopTime.DepartureTime }}</td>

              <!-- 途經 -->
              <td class="center aligned">
                <h5 class="ui trip icon header">
                  <i class="arrow right icon"></i>
                  <div class="sub header">
                    {{ item.OriginStopTime.DepartureTime | timeDiff(item.DestinationStopTime.ArrivalTime) }}
                  </div>
                </h5>
              </td>

              <!-- 抵達時間 -->
              <td class="center aligned">{{ item.DestinationStopTime.ArrivalTime }}</td>

              <td>
                <div class="ui basic grey horizontal medium label">
                  {{ item.DestinationStopTime.StopSequence - item.OriginStopTime.StopSequence}}站
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

                <div class="ui yellow horizontal medium label" v-if="$options.filters.DMULabel(item.DailyTrainInfo.Note.Zh_tw)">
                  柴聯
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

            </tr>
          </tbody>
        </table>

      </div>

    </div>
    <!-- END OF COMPUTER ONLY ROW  -->

    <!-- MOBILE TABLET ONLY -->
    <div class="mobile tablet only row" ng-if="timeTables.length > 0">

      <div class="ui sixteen wide column">
        <!-- ngRepeat: item in timeTables | trainClassFilter: trainClassMap.list -->
        <div class="ui fluid card pointer" ng-hide="( hideDepartured ) &amp;&amp; (item.OriginStopTime.DepartureTime | isDepartured: period.date)"
          ng-repeat="item in timeTables | trainClassFilter: trainClassMap.list" ng-click="goToTrainInfo(item.DailyTrainInfo.TrainNo)">

          <div class="content">

            <!-- 經由 -->
            <div class="right floated ui">
              <a class="ui circular basic blue label" ng-if="item.DailyTrainInfo.TripLine">
                海線
              </a>
            </div>

            <!-- 誤點 -->
            <div class="right floated ui">
            </div>

            <!-- 車次 -->
            <div>
              <h4 class="ui orange header">莒光
                <div class="sub header ng-binding">653</div>
              </h4>
            </div>

            <div class="description">
              <div class="ui grid">
                <!-- 出發時間 -->
                <div class="three wide column departure-time ng-binding">11:25</div>
                <!-- 箭頭 -->
                <div class="two wide column"><i class="arrow right icon"></i></div>
                <!-- 抵達 -->
                <div class="three wide column ng-binding">19:56</div>
                <!-- 途經 -->
                <div class="five wide center aligned column ng-binding">8小時31分鐘</div>
                <!-- 票價 -->
                <div class="three wide right aligned column">
                  <p ng-if="fares" class="ng-binding">
                    $672
                  </p>
                  <!-- end ngIf: fares -->
                </div>

              </div>

            </div>
          </div>
          <div class="extra content ng-binding">

            <div class="ui basic grey horizontal medium label ng-binding">
              41站
            </div>

            <div class="ui blue horizontal medium label" ng-if="item.DailyTrainInfo.WheelchairFlag">
              輪椅
            </div>

          </div>
        </div>

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
          keyword: '自強 中壢 桃園 明天',
        },
        sdStations: {
          startStation: null,
          destStation: null,
        },
        timeTables: false,
        delayInfo: [],
        trainClassMap: {},
        hideDepartured: true,
        fares: false,
        status: null,
        keywordArray: [],
        orderByField: 'OriginStopTime.DepartureTime',
      }
    },
    methods: {
      /**
       * Search Handler
       */
      search: function () {

        // Split input keyword into an array
        this.keywordArray = this.strToArray(this.keyword) || false;

        if (!this.keyword) return false;

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
        this.trainClassMap = this.searchTrainClass(this.keywordArray[trainClassIndex]) || {};

        // Remove the train class description from `keywordArray` to prevent impacting others
        (trainClassIndex != -1) && this.keywordArray.splice(trainClassIndex, 1)

        // ---- END of finding trainClassIndex

        // Override `this.peroid`
        this.period = this.searchDate(this.keywordArray[2]);

        this.sdStations = {
          startStation: this.searchStation(this.keywordArray[0]),
          destStation: this.searchStation(this.keywordArray[1])
        }

        // Check if both startStation and destStation exists
        if (this.sdStations.startStation && this.sdStations.destStation) {

          this.status = 'loading';

          this.getODFare()
          this.getDailyTimeTableOD();

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
       * Get the fares between startStation and destStation
       */
      getODFare: function () {

        axios.get(
            'https://ptx.transportdata.tw/MOTC/v2/Rail/TRA/ODFare/' +
            this.sdStations.startStation.Station_Code_4 + '/to/' +
            this.sdStations.destStation.Station_Code_4 +
            '?$format=JSON'
          )
          .then(
            (response) => {
              this.fares = response.data[0].Fares;
            },
            (error) => {
              this.status = false;
            }
          );
      },

      /**
       * Get daily timetable with Origin and Destination
       */
      getDailyTimeTableOD: function () {

        axios.get(
            'https://ptx.transportdata.tw/MOTC/v2/Rail/TRA/DailyTimetable/OD/' +
            this.sdStations.startStation.Station_Code_4 +
            '/to/' +
            this.sdStations.destStation.Station_Code_4 +
            '/' +
            this.period.date +
            '?$format=JSON'
          )
          .then(
            (response) => {
              this.timeTables = response.data;
              this.status = true;
            },
            (error) => {
              this.status = false;
            }
          );
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
      },

      /**
       * Remove the trainClassMap filter in order to show all the trains.
       */
      clearFilter: function () {
        this.trainClassMap = {};
      },

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

        let r = this.timeTables || [];

        // return the original array if the list not sets.
        if (!_.isEmpty(this.trainClassMap)) {

          r = r.filter((item) => {
            return this.trainClassMap.list.indexOf(Number(item.DailyTrainInfo.TrainClassificationID)) != -1;
          })

        }


        //'OriginStopTime.DepartureTime'

        r = _.orderBy(r, this.orderByField)

        return r;

      }
    }
  }

</script>
