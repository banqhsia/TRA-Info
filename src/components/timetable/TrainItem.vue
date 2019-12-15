<template>
  <tbody>
    <td>
      <div class="ui grid">
        <div class="row">
          <!-- 車種 -->
          <div class="sixteen wide column">
            <h3 class="ui header">
              {{ train.TrainInfo.TrainTypeName.Zh_tw }}
              <h5 class="ui right floated header">
                <div class="sub header">{{ train.TrainInfo.TrainNo }}</div>
              </h5>
            </h3>
          </div>

          <!-- 終點站 -->
          <div class="sixteen wide column">
            <h5 class="ui header">
              <div class="sub header">
                {{ train.TrainInfo.StartingStationName.Zh_tw }}
                <i class="arrow right icon inline-icon"></i>
                {{ train.TrainInfo.EndingStationName.Zh_tw }}
              </div>
            </h5>
          </div>
        </div>
      </div>
    </td>

    <!-- 經由 -->
    <td class="center aligned">
      <div
        class="ui circular basic label"
        :class="[tripLine(train.TrainInfo.TripLine, true)]"
        v-if="train.TrainInfo.TripLine"
      >{{ tripLine(train.TrainInfo.TripLine) }}</div>
    </td>

    <!-- 出發時間 -->
    <td class="center aligned departure-time">{{ train.StopTimes[0].DepartureTime }}</td>
    <!-- 途經 -->
    <td class="center aligned">
      <h5 class="ui trip icon header">
        <i class="arrow right icon"></i>
        <div
          class="sub header"
        >{{ timeDiff( train.StopTimes[0].DepartureTime, train.StopTimes[1].ArrivalTime).humanize }}</div>
      </h5>
    </td>

    <!-- 抵達時間 -->
    <td class="center aligned">{{ train.StopTimes[1].ArrivalTime }}</td>

    <!-- 說明 -->
    <td>
      <div
        class="ui basic grey horizontal medium label"
      >{{ train.StopTimes[1].StopSequence - train.StopTimes[0].StopSequence }}站</div>

      <div class="ui blue horizontal medium label" v-if="train.TrainInfo.WheelChairFlag">輪椅</div>

      <div class="ui pink horizontal medium label" v-if="train.TrainInfo.BreastFeedFlag">哺乳室</div>

      <div class="ui green horizontal medium label" v-if="train.TrainInfo.BikeFlag">自行車</div>

      <div class="ui yellow horizontal medium label" v-if="DMULabel(train.TrainInfo.Note.Zh_tw)">柴聯</div>

      <div
        class="ui brown horizontal medium label"
        v-if="acrossDayLabel(train.TrainInfo.Note.Zh_tw)"
      >跨日</div>
      {{ train.TrainInfo.Note | noteFormat }}
    </td>
  </tbody>
</template>

<script>
export default {
  props: ["train"],
  data() {
    return {
      // trains: trains
    };
  },
  methods: {}
};
</script>