<template>
  <div class="ui grid stackable container">
    <Loading v-if="status == 'loading'" />

    <div class="ui three wide column">
      <router-link tag="button" class="ui fluid icon button left floated" :to="{name: 'Timetable'}">
        <i class="chevron left icon"></i> 返回查詢
      </router-link>
    </div>

    <div class="row" v-if="status == false">
      <div class="ui sixteen wide column">
        <div class="ui red message">
          <div class="header">查無列車資料</div>
          <p>這個時間點，或是你指定的車次，找不到任何列車的資訊。</p>
        </div>
      </div>
    </div>

    <div class="row" v-if="status == true">
      <div class="ui sixteen wide column">
        <div class="ui segment">
          <h2 class="ui header">
            {{ train.TrainInfo.TrainNo }} {{ train.TrainInfo.TrainTypeName.Zh_tw }}
            <div class="sub header">
              {{ query.dateHumanize }}，
              <router-link
                :to="{
                name: 'Station.view',
                params: {
                  station: train.TrainInfo.StartingStationID,
                  date: query.date
                }
              }"
              >
                <b>{{ train.TrainInfo.StartingStationName.Zh_tw }}</b>
              </router-link>&nbsp;到
              <router-link
                :to="{
                name: 'Station.view',
                params: {
                  station: train.TrainInfo.EndingStationID,
                  date: query.date
                }
              }"
              >
                <b>{{ train.TrainInfo.EndingStationName.Zh_tw }}</b>
              </router-link>
            </div>
          </h2>

          <div
            class="ui circular horizontal basic label"
            :class="[tripLine(train.TrainInfo.TripLine, true)]"
            v-if="train.TrainInfo.TripLine"
          >{{ tripLine(train.TrainInfo.TripLine) }}</div>

          <div class="ui basic grey horizontal medium label">{{ train.StopTimes.length }}站</div>

          <div class="ui blue horizontal medium label" v-if="train.TrainInfo.WheelChairFlag">輪椅</div>
          <div class="ui pink horizontal medium label" v-if="train.TrainInfo.BreastFeedFlag">哺乳室</div>
          <div class="ui green horizontal medium label" v-if="train.TrainInfo.BikeFlag">自行車</div>
          <div
            class="ui yellow horizontal medium label"
            v-if="DMULabel(train.TrainInfo.Note.Zh_tw)"
          >柴聯</div>

          <div
            class="ui brown horizontal medium label"
            v-if="overNightLabel(train.TrainInfo.OverNightStationID)"
          >跨日</div>
          {{ train.TrainInfo.Note | noteFormat }}
        </div>
      </div>
    </div>

    <div class="row" v-if="status == true">
      <div class="ui sixteen wide column">
        <table class="ui unstackable basic definition table">
          <thead>
            <tr>
              <th class="four wide">詳細資料</th>
              <th class="four wide">
                <h4 class="ui header">
                  抵達時間
                  <div class="sub header">Arrival</div>
                </h4>
              </th>
              <th class="four wide">
                <h4 class="ui header">
                  開車時間
                  <div class="sub header">Departure</div>
                </h4>
              </th>
              <th class="four wide">
                <h4 class="ui header">
                  行車時間
                  <div class="sub header">Travel Time</div>
                </h4>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, $index) in train.StopTimes" :key="item.StationID">
              <td>
                <h4 class="ui header">
                  <i class="icon grey">{{ $index+1 }}</i>
                  <router-link
                    class="content pointer"
                    tag="div"
                    :to="{
                    name: 'Station.view',
                    params: {
                      station: item.StationID,
                      date: query.date
                    }
                  }"
                  >
                    {{ item.StationName.Zh_tw }}
                    <div class="sub header">{{item.StationName.En }}</div>
                  </router-link>
                </h4>
              </td>
              <td>{{ item.ArrivalTime }}</td>
              <td>{{ item.DepartureTime }}</td>
              <td
                v-if="$index"
              >{{ timeDiff(train.StopTimes[$index-1].DepartureTime, item.ArrivalTime).humanize || '' }}</td>
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
      train: null,
      query: null
    };
  },
  computed: {
    status: function() {
      if (this.query === null) {
        return "loading";
      }

      if (this.query) {
        return !_.isEmpty(this.train) && this.train.StopTimes.length > 0;
      }

      return false;
    }
  },
  methods: {
    getTimetable: function() {
      this.searchTimetableByTrainNo(
        this.$route.params.train,
        this.$route.params.date
      ).then(
        response => {
          this.query = response.data.query;
          this.train = response.data.payload[0] || {};
        },
        error => {
          // handle
        }
      );
    }
  },
  mounted() {
    this.getTimetable();
  }
};
</script>
