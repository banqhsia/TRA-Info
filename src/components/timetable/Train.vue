<template>

  <div class="ui grid stackable container">

    <Loading v-if="status == 'loading'"></Loading>

    <div class="row" v-if="status == false">

      <div class="ui sixteen wide column">
        <div class="ui red message">
          <div class="header">查無列車資料</div>
          <p>這個時間點，或是你指定的車次，找不到任何列車的資訊。</p>
        </div>
      </div>

    </div>

    <div class="ui mobile only sixteen wide column">
      <router-link tag="button" class="ui fluid icon button" :to="{name: 'Timetable'}">
        <i class="chevron left icon"></i> 返回
      </router-link>
    </div>

    <div class="row" v-if="trainInfo">

      <div class="ui sixteen wide column">

        <div class="ui segment" :class="[trainClass(trainInfo.DailyTrainInfo.TrainClassificationID, true)]">
          <h2 class="ui header">{{ trainInfo.DailyTrainInfo.TrainNo }} {{ trainClass(trainInfo.DailyTrainInfo.TrainClassificationID) }}
            <div class="sub header">
              {{ period.humanize }}，

              <router-link :to="{
                name: 'Station.view',
                params: {
                  station: trainInfo.DailyTrainInfo.StartingStationID,
                  date: period.date
                }
              }"><b>{{ searchStation(trainInfo.DailyTrainInfo.StartingStationID ).Station_Name }}</b>
              </router-link>到
              <router-link :to="{
                name: 'Station.view',
                params: {
                  station: trainInfo.DailyTrainInfo.EndingStationID,
                  date: period.date
                }
              }"><b>{{ searchStation(trainInfo.DailyTrainInfo.EndingStationID ).Station_Name }}</b>
              </router-link>

              <a class="ui label" v-if="!period.today" @click="backToday()"><i class="reply icon"></i>回到今天</a>

            </div>
          </h2>

          <div class="ui circular horizontal basic label" :class="[tripLine(trainInfo.DailyTrainInfo.TripLine, true)]" v-if="trainInfo.DailyTrainInfo.TripLine">
            {{ tripLine(trainInfo.DailyTrainInfo.TripLine) }}
          </div>

          <div class="ui blue horizontal medium label" v-if="trainInfo.DailyTrainInfo.WheelchairFlag">
            輪椅
          </div>

          <div class="ui pink horizontal medium label" v-if="trainInfo.DailyTrainInfo.BreastFeedingFlag">
            哺乳室
          </div>

          <div class="ui green horizontal medium label" v-if="trainInfo.DailyTrainInfo.BikeFlag">
            自行車
          </div>

          <div class="ui yellow horizontal medium label" v-if="trainInfo.DailyTrainInfo.Note.Zh_tw | DMULabel ">
            柴聯
          </div>

          {{ trainInfo.DailyTrainInfo.Note.Zh_tw | noteFormat }}
        </div>

      </div>
    </div>

    <div class="row" v-if="trainInfo">

      <div class="ui sixteen wide column">
        <table class="ui unstackable basic definition table">
          <thead>
            <tr>
              <th class="four wide">詳細資料</th>
              <th class="four wide">
                <h4 class="ui header">抵達時間
                  <div class="sub header">
                    Arrival
                  </div>
                </h4>
              </th>
              <th class="four wide">
                <h4 class="ui header">開車時間
                  <div class="sub header">
                    Departure
                  </div>
                </h4>
              </th>
              <th class="four wide">
                <h4 class="ui header">行車時間
                  <div class="sub header">
                    Travel Time
                  </div>
                </h4>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, $index) in trainInfo.StopTimes">
              <td>
                <h4 class="ui header">
                  <i class="icon grey">{{ $index+1 }}</i>
                  <router-link class="content pointer" tag="div" :to="'/station/'+item.StationID">

                    {{ searchStation(item.StationID).Station_Name }}
                    <div class="sub header">{{ searchStation(item.StationID).Station_EName }}</div>

                  </router-link>

                </h4>
              </td>
              <td>{{ item.ArrivalTime }}</td>
              <td>{{ item.DepartureTime }}</td>
              <td v-if="$index">{{ timeDiff(trainInfo.StopTimes[$index-1].DepartureTime, item.ArrivalTime).humanize || '' }}</td>
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
        trainInfo: false,
        status: null,
      }
    },
    methods: {
      /**
       * Page initialization
       */
      init: function () {

        this.status = 'loading'

        // Get DailyTimeTable
        this.getDailyTimeTable(
          this.$route.params.train
        ).then(
          (response) => {

            if (!response.data.length) {
              return this.status = false;
            }

            // [!] Notice: The TRA API returns an array even if there's only one object.
            this.trainInfo = response.data[0]
            this.status = true;

          },
          (error) => {
            this.status = false;
          }
        );
      },
      /**
       * Back today
       */
      backToday: function () {
        this.period = this.searchDate()
        this.trainInfo = false;
        this.init();
        this.$router.replace({
          params: {
            date: this.period.date
          }
        })
      }
    },
    mounted() {
      this.init();
    }
  }

</script>
