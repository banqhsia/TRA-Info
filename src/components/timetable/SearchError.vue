<template>
  <div class="ui red message">
    <div class="header">查無此站或格式錯誤</div>
    <p>
      請輸入起迄站、時間、車種即可。「中壢 新竹」「新左營 鳳山 週四」「高雄 嘉義 1/18 自強號」。可用 1/18、1月18日、1-18、星期四、週四。車站可以進行模糊搜尋「鳳山 新左」「Tapei Xiny」，但沒有簡稱 (北車 高火)。可以輸入車種以過濾「台北 花蓮 傾斜式」「中壢 台北 對號」。
      <router-link :to="{
            name: 'About'
        }">詳細說明</router-link>
    </p>
  </div>
</template>