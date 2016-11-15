TRAExt
.controller('StationCtrl', function($scope) {

	$scope.stations = JSON.parse(JSON.stringify(stations));

})

.controller('TimetableCtrl', function($scope, $filter, Data, Request) {

	$scope.keyword = '中壢 臺北 明天';

	$scope.search = function () {

		$scope.timeTables = false;

		// Split string by whitespace
		$scope.keywordArray = Data.strToArray($scope.keyword);

		$scope.period = Data.searchDate($scope.keywordArray[2]);

		Request.dailyTimeTableOD(
			Data.searchStation( $scope.keywordArray[0] ).Station_Code_4,
			Data.searchStation( $scope.keywordArray[1] ).Station_Code_4,
			$scope.period.date
		).then(function(){
			// $scope.timeTables in Request.getData() with orderBy filter.
			$scope.timeTables = $filter('orderBy')(Request.getData(), 'OriginStopTime.DepartureTime');
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
	return function(l, wantsColor){
		return (wantsColor)
			? $filter('filter')( tripLine, { lineNo: l } )[0].lineColor
			: $filter('filter')( tripLine, { lineNo: l } )[0].lineDesc;
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

// Determine if the train has departure
// Return 'disabled' (String) (Semantic UI class)
.filter('isDepartured', function(){
	return function(departure, date){

		var today = moment().format('YYYY-MM-DD');
		var now	= moment().format('HH:mm');

		return ( !moment(today).isSame(date) )
			? ''
			: ( moment(now, 'HH:mm').isAfter( moment(departure, 'HH:mm')) )
				? 'disabled'
				: '';

	}
})

.service('Data', function($filter) {

	// Transform `台` into `臺` in order to search the station.
	// return string with `臺`
	this.taiTransform = function (s) {
		return s.replace('台', '臺') || '';
	}

	// Replace whitespace more than 1, split into array
	// return keyword Array
	this.strToArray = function (s) {
		return s.replace(/\s{1,}/ig, ' ').split(' ');
	}

	// Trun date description into date offset. Calculated by moment.js
	// return Date String
	this.searchDate = function (d) {
		try {
			var v = $filter('filter')( period, { dateDefine: d || false }, true )[0].dateValue;
		} catch (e) {
			var v = 0;
		}
		var m = moment().add(v, 'DAYS');
		return {
			'date': m.format('YYYY-MM-DD'),
			'humanize': m.format('MM月DD日 (dddd)'),
		};
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

	this.dailyTimeTableOD = function (original, destination, date) {

		var deferred = $q.defer();

		// Declare that original and destination is not falsy.
		// original =  original || false;
		// destination = destination || false;
		//
		// if ( original || destination ) {
		// 	return null;
		// }

		$http.get('http://ptx.transportdata.tw/MOTC/v2/Rail/TRA/DailyTimetable/OD/'+ original +'/to/'+ destination +'/'+ date +'?$format=JSON')
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
