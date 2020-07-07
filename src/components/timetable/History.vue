<template>
  <div class="field">
    <div
      class="ui label pointer"
      v-for="keyword in history"
      :key="keyword"
      @click="$emit('historyLabelClicked', keyword)"
    >{{ keyword }}</div>
  </div>
</template>


<script>
export default {
  props: ["history"]
};
</script>