TRAExt
.controller('StationCtrl', function($scope) {

	$scope.stations = JSON.parse(JSON.stringify(stations));

})

.controller('TimetableCtrl', function($scope, $filter, Data, Request) {

	$scope.keyword = '中壢 臺北 明天';

	$scope.search = function () {

		$scope.timeTables = false;

		// Replace Whitespace more than 1
		$scope.keywordArray = $scope.keyword.replace(/\s{1,}/ig, ' ').split(' ');

		Request.dailyTimeTableOD(
			Data.searchStation( $scope.keywordArray[0] ).Station_Code_4,
			Data.searchStation( $scope.keywordArray[1] ).Station_Code_4
		).then(function(){
			$scope.timeTables = Request.getData();
		})

	}

})

// Transform `TrainClassificationID` into train class
// wantsColor[Boolean] determine if the call wants color.
.filter('trainClass', function($filter){
	return function(c, wantsColor){
		return (wantsColor)
			? $filter('filter')( trainClass, { classNo: c }, true )[0].classColor
			: $filter('filter')( trainClass, { classNo: c }, true )[0].classDesc;
	}
})
// Transform `TripLine` into trip line description
.filter('tripLine', function($filter){
	return function(l){
		return $filter('filter')( tripLine, { lineNo: l } )[0].lineDesc;
	}
})
// Formatting note. Strip `每日行駛。` from note.
.filter('noteFormat', function($filter){
	return function(n){
		n = n || '';
		return n.replace('每日行駛。', '');
	}
})
// Time subtract, return difference (string)
// Use moment.js, and strip `0小時` from the result.
.filter('timeDiff', function(){
	return function(s, e){
		return moment.utc(
			moment(e,'HH:mm').diff(
			moment(s,'HH:mm'))
		).format('H[小時]m[分鐘]').replace(/^0小時/g, '');
	}
})

.service('Data', function($filter) {

	// Transform `台` into `臺` in order to search the station.
	// return string with `臺`
	this.taiTransform = function (s) {
		return s.replace('台', '臺') || '';
	}

	// Search stations by a given key/value set.
	// return JSON Object
	this.searchStation = function (s) {
		return $filter('filter')( stations, { Station_Name: this.taiTransform(s) || false }, true )[0];
	}

	// Search period by a given key/value set.
	// return Time
	this.searchPeriod = function (p) {
		return $filter('filter')( period, { Station_Name: p || false }, true )[0];
	}

})

.service('Request', function($http, $q) {

	this.dailyTimeTableOD = function (original, destination) {

		var deferred = $q.defer();

		// Declare that original and destination is not falsy.
		// original =  original || false;
		// destination = destination || false;
		//
		// if ( original || destination ) {
		// 	return null;
		// }

		$http.get('http://ptx.transportdata.tw/MOTC/v2/Rail/TRA/DailyTimetable/OD/'+ original +'/to/'+ destination +'/2016-11-13?$format=JSON')
		.success( function(response) {
			data = response;
			deferred.resolve();
			// return ( response ) ? response : false;

		})
		.error ( function(response) {
			// console.log(xhr);
			// return false;
		});

		return deferred.promise;
	}

	// Return HTTP request response.
	this.getData = function() {
		return data;
	};

})


;
