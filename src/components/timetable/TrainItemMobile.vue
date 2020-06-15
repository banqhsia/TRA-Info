<template>
  <div class="ui fluid card pointer">
    <div class="content">
      <div class="ui grid">
        <div class="row">
          <!-- 車種 -->
          <div class="four wide column">
            <h3 class="ui header" :class="trainTypeColor(train.TrainInfo.TrainTypeCode)">
              {{ train.TrainInfo.TrainTypeName.Zh_tw }}
              <div class="sub header">{{ train.TrainInfo.TrainNo }}</div>
            </h3>
          </div>

          <!-- 起迄站 -->
          <div class="five wide column">
            <h5 class="ui header center aligned">
              <div class="sub header">
                {{ train.TrainInfo.StartingStationName.Zh_tw }}
                <i
                  class="arrow right icon inline-icon"
                ></i>
                {{ train.TrainInfo.EndingStationName.Zh_tw }}
              </div>
            </h5>
          </div>

          <!-- 經由 -->
          <div class="four wide column">
            <div class="ui right floated">
              <div
                class="ui circular basic label"
                :class="[tripLine(train.TrainInfo.TripLine, true)]"
                v-if="train.TrainInfo.TripLine"
              >{{ tripLine(train.TrainInfo.TripLine) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="description">
        <div class="ui grid">
          <!-- 出發時間 -->
          <div class="three wide column departure-time">{{ train.StopTimes[0].DepartureTime }}</div>

          <!-- 箭頭 -->
          <div class="two wide column">
            <i class="arrow right icon"></i>
          </div>

          <!-- 抵達 -->
          <div class="three wide column">{{ train.StopTimes[1].ArrivalTime }}</div>

          <!-- 途經 -->
          <div
            class="five wide center aligned column"
          >{{ timeDiff( train.StopTimes[0].DepartureTime, train.StopTimes[1].ArrivalTime).humanize }}</div>

          <!-- 票價 -->
          <div class="three wide right aligned column">
            <p v-if="fares">{{ "$ " + getFare(train.TrainInfo.TrainTypeCode) }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="extra content">
      <div
        class="ui basic grey horizontal medium label"
      >{{ train.StopTimes[1].StopSequence - train.StopTimes[0].StopSequence }}站</div>

      <div class="ui blue horizontal medium label" v-if="train.TrainInfo.WheelChairFlag">輪椅</div>

      <div class="ui pink horizontal medium label" v-if="train.TrainInfo.BreastFeedFlag">哺乳室</div>

      <div class="ui green horizontal medium label" v-if="train.TrainInfo.BikeFlag">自行車</div>

      <div class="ui yellow horizontal medium label" v-if="DMULabel(train.TrainInfo.Note.Zh_tw)">柴聯</div>

      <div
        class="ui brown horizontal medium label"
        v-if="overNightLabel(train.TrainInfo.OverNightStationID)"
      >跨日</div>
      <div>{{ train.TrainInfo.Note | noteFormat }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["train", "fares"],
  data() {
    return {};
  },
  methods: {
    /**
     * 取得票價
     */
    getFare: function(code) {
      return this.fares[code].price;
    }
  }
};
</script>