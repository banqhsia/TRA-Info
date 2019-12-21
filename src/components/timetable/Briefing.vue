<template>
  <div class="ui secondary segment">
    <div class="ui grid stackable">
      <div class="eleven wide column message">
        <h3 class="ui header">
          {{ query.dateHumanize }}
          <div class="ui sub header">
            <router-link
              :to="{
                    name: 'Station.view',
                    params: {
                      station: query.origin.code,
                      date: query.date
                    }
                  }"
            >{{ query.origin.name }}</router-link>&nbsp;到
            <router-link
              :to="{
                    name: 'Station.view',
                    params: {
                      station: query.destination.code,
                      date: query.date
                    }
                  }"
            >{{ query.destination.name }}</router-link>&nbsp;的
            <span class="ui pointer" @click="clearFilter()">
              {{ trainClassMap.desc || '所有列車' }}
              <i
                class="delete red icon"
                v-if="!_.isEmpty(trainClassMap)"
              ></i>
            </span>
          </div>
        </h3>
        <p>
          共有 {{ trains.length }} 班列車
          <span
            v-if="!_.isEmpty(trainClassMap)"
          >，顯示 {{ timeTablesList.length }} 個結果</span>
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
                  <div class="sub header">T.C.</div>
                </h5>
              </th>
              <th class="three wide">
                <h5 class="ui orange header pointer" @click="setTrainClassMap('ck')">
                  莒光
                  <div class="sub header">C.K.</div>
                </h5> 
              </th>
              <th class="three wide">
                <h5 class="ui header pointer" @click="setTrainClassMap('lt')">
                  區間
                  <div class="sub header">L.T.</div>
                </h5>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>票價</td>
              <td>{{ fares['3'].price }}</td>
              <td>{{ fares['4'].price }}</td>
              <td>{{ fares['6'].price }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- END OF SIX WIDE COLUMN -->
    </div>
  </div>
  <!-- END OF SECONDARY SEGMENT -->
</template>


<script>
export default {
  props: ["query", "trains", "fares"]
};
</script>