<template>
  <div class="ui fluid card pointer">
    <div class="content">
      <div class="ui grid">
        <!-- 車次 -->
        <div class="twelve wide column">
          <h3 class="ui header" :class="trainTypeColor(train.TrainInfo.TrainTypeCode)">
            {{ train.TrainInfo.TrainTypeName.Zh_tw }}
            <div class="sub header">{{ train.TrainInfo.TrainNo }}</div>
          </h3>
        </div>

        <!-- 經由 -->
        <div class="four wide column">
          <div class="right floated ui">
            <div
              class="ui circular basic label"
              :class="[tripLine(train.TrainInfo.TripLine, true)]"
              v-if="train.TrainInfo.TripLine != 0"
            >{{ tripLine(train.TrainInfo.TripLine) }}</div>
          </div>
        </div>
      </div>

      <div class="description">
        <div class="ui grid">
          <!-- 出發時間 -->
          <div class="five wide column departure-time">{{ train.TrainInfo.DepartureTime }}</div>
          <!-- 箭頭 -->
          <div class="one wide column">
            <i class="arrow right icon"></i>
          </div>
          <!-- 終點站 -->
          <div class="six wide column">
            {{ train.TrainInfo.EndingStationName.Zh_tw }}
            {{ train.TrainInfo.EndingStationName.En }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["train"]
};
</script>