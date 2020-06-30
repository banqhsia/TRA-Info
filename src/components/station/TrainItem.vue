<template>
  <tr>
    <!-- 車次 -->
    <td>
      <h3 class="ui header" :class="trainTypeColor(train.TrainInfo.TrainTypeCode)">
        {{ getName(train) }}
        <div class="sub header">{{ train.TrainInfo.TrainNo }}</div>
      </h3>
    </td>

    <!-- 經由 -->
    <td class="center aligned">
      <div
        class="ui circular basic label"
        :class="[tripLine(train.TrainInfo.TripLine, true)]"
        v-if="train.TrainInfo.TripLine != 0"
      >{{ tripLine(train.TrainInfo.TripLine) }}</div>
    </td>

    <!-- 出發時間 -->
    <td class="center aligned departure-time">{{ train.TrainInfo.DepartureTime }}</td>

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
        {{
        _.get(train, 'TrainInfo.EndingStationName.Zh_tw', '未知') }}
        <div class="sub header">
          {{
          _.get(train, 'TrainInfo.EndingStationName.En', 'Unknown') }}
        </div>
      </h5>
    </td>
  </tr>
</template>

<script>
export default {
  props: ["train"],
  methods: {
    getName: function(train) {
      let name = _.get(train, "TrainInfo.TrainTypeName.Zh_tw", "");

      if ("" === name) {
        return "列車";
      }

      return name;
    }
  }
};
</script>