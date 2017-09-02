<template>
  <div id="app">
		<div class="ui grid stackable container">
			<h2 class="row">
				<div class="ui sixteen wide column">

					<h2 class="ui header">
						<!-- logo image -->
						<img class="ui image rounded" src="static/img/logo.png">
						<!-- header text -->
						<div class="content">
							臺鐵資訊查詢
							<div class="ui sub header">
								TRA Information
							</div>
						</div>
					</h2>

				</div>
			</h2>

			<div class="row">
				<div class="ui computer tablet only sixteen wide column">
					<div class="fb-like" data-href="http://benyi.tw/trainfo/" data-layout="standard" data-action="like" data-size="small" data-show-faces="false" data-share="true"></div>
				</div>
			</div>

			<div class="row">
				<div class="ui secondary menu">
					<a class="item" href="#/timetable">時刻表查詢</a>
					<a class="item" href="#/station">車站資訊查詢</a>
					<a class="item" href="#/about">關於</a>
				</div>
			</div>

		</div>


  </div>
</template>

<script>

// Google Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-40661556-5', 'auto');
ga('send', 'pageview');


// Facebook JavaScript SDK
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/zh_TW/sdk.js#xfbml=1&version=v2.8";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

export default {
  name: 'app'
}
</script>

<style>
#app {
  margin-top: 60px;
}

</style>
