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
                <i class="arrow right icon inline-icon"></i>
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