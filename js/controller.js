TRAExt
.controller('StationCtrl', function($scope, $state, Data) {

	$scope.stations = JSON.parse(JSON.stringify(stations));

	// Watch & trigger `taiTransform` on keyword change
	$scope.$watch('keyword', function (n, o) {
		$scope.keywordTransform = Data.taiTransform($scope.keyword);
	}, true);

	// Handle station name buttom on click. Redirect to station info.
	$scope.goToStationInfo = function (s) {
		$state.go('stationinfo', { station: s });
	}

})

.controller('TimetableCtrl', function($scope, $filter, $state, $stateParams, Data, Request) {

	// get item from the localStorage
	$scope.keyword = localStorage.getItem('keyword');
	$scope.timeTables = JSON.parse(localStorage.getItem('timeTables') ) || false;
	$scope.sdStations = JSON.parse(localStorage.getItem('sdStations') );
	$scope.period = JSON.parse(localStorage.getItem('period') );
	$scope.fares = JSON.parse(localStorage.getItem('fares')) || undefined;

	// Search Handler
	$scope.search = function () {

		$scope.keyword = $scope.keyword || '';
		if ( !$scope.keyword ) return false;

		// Initialize before starting a new search
		$scope.fares = false;
		$scope.timeTables = false;

		// Split string by whitespace
		var keywordArray = Data.strToArray($scope.keyword) || false;

		// Get date. Return array.
		$scope.period = Data.searchDate(keywordArray[2]);

		// Search station code
		// sdStations: startStation & destStation
		$scope.sdStations = {
			'startStation': Data.searchStation( keywordArray[0] ),
			'destStation': Data.searchStation( keywordArray[1] )
		}

		if ( $scope.sdStations.startStation && $scope.sdStations.destStation ) {

			$scope.success =  { "status" : "loading" }

			// Send fare request
			Request.ODFare(
				$scope.sdStations.startStation.Station_Code_4,
				$scope.sdStations.destStation.Station_Code_4
			).then(function(){
				$scope.fares = Request.getData()[0].Fares;
			})

			// Request for the delay information if is today.
			if ( $scope.period.today ) {
				Request.liveBoard(
					$scope.sdStations.startStation.Station_Code_4
				).then(function(){
					$scope.delay = Request.getData();
				});
			}

			// Send time table request
			Request.dailyTimeTableOD(
				$scope.sdStations.startStation.Station_Code_4,
				$scope.sdStations.destStation.Station_Code_4,
				$scope.period.date
			).then(function(){
				$scope.success =  { "status" : true }
				$scope.timeTables = $filter('orderBy')(Request.getData(), 'OriginStopTime.DepartureTime');

				// Set items in localStorage.
				Data.setItem('keyword', $scope.keyword);
				Data.setItem('timeTables', $scope.timeTables);
				Data.setItem('sdStations', $scope.sdStations);
				Data.setItem('period', $scope.period);
				Data.setItem('fares', $scope.fares);
			})
		}
		else {
			// Error message
			$scope.success =  {
				"status" : false,
				"title": "查無此站或格式錯誤。",
				"msg": "請輸入起迄站(時間)「中壢 新竹」「新左營 鳳山 週四」。可用 1/18、1月18日、1-18、星期四、週四。車站請輸入全名，沒有簡稱 (北車 高火)"
			}
		}
	}

	// Clear Search <input>, then focus it.
	$scope.searchEmpty = function () {

		// Set variables `undefined` to clear all the result.
		$scope.keyword = undefined;
		$scope.timeTables = undefined;
		$scope.fares = undefined;

		// Focus on the <input>
		angular.element('input[ng-model=keyword]').trigger('focus');

		// Clear localStorage.
		localStorage.clear();
	}

	// Handle table row onclick. Redirect to train info.
	$scope.goToTrainInfo = function (t) {
		$state.go('train', { train: t, date: $scope.period.date });
	}
	// Handle station name buttom on click. Redirect to station info.
	$scope.goToStationInfo = function (s) {
		$state.go('stationinfo', { station: s, date: $scope.period.date });
	}

})

// Train Info Controller
.controller('TrainInfoCtrl', function($scope, $stateParams, $state, Data, Request) {

	$scope.success =  { "status" : "loading" }

	var t = $stateParams.train;
	var d = $stateParams.date;

	$scope.period = Data.searchDate(d);

	// Send Request to TRA, get specific train information
	Request.dailyTimeTable(
		t, $scope.period.date
	).then(function(){
		$scope.success =  { "status" : true }
		$scope.trainInfo = Request.getData()[0];
	});

	// Handle back button click. Redirect to time table.
	$scope.goToTimeTable = function () {
		$state.go('timetable');
	}

	// Handle station name buttom on click. Redirect to station info.
	$scope.goToStationInfo = function (s) {
		$state.go('stationinfo', { station: s, date: $scope.period.date });
	}

})

// Train Info Controller
.controller('StationInfoCtrl', function($scope, $stateParams, $state, Data, Request) {

	$scope.success =  { "status" : "loading" }

	var s = $stateParams.station;
	var d = $stateParams.date;

	$scope.station = Data.searchStation(s);
	$scope.period = Data.searchDate(d);

	// Request for the delay information if is today.
	if ( $scope.period.today ) {
		Request.liveBoard(
			$scope.station.Station_Code_4
		).then(function(){
			$scope.delay = Request.getData();
		});
	}

	// Send Request to TRA, get specific train information
	Request.dailyTimeTableStation(
		$scope.station.Station_Code_4,
		$scope.period.date
	).then(function(){
		$scope.success =  { "status" : true }
		$scope.trainInfo = Request.getData();
	});

	// Toggle clockwise or counterclockwise trains.
	// Click again for dismiss
	$scope.directionSwitch = function (d) {
		$scope.direction = (d == $scope.direction)
			? undefined
			: d;
	}

	// Handle back button click. Redirect to time table.
	$scope.goToTimeTable = function () {
		$state.go('timetable');
	}

	// Handle table row onclick. Redirect to train info.
	$scope.goToTrainInfo = function (t) {
		$state.go('train', { train: t, date: $scope.period.date });
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
.filter('trainClassZH', function($filter){
	return function(t, wantsColor){
		var r = t.replace(/自強\(普悠瑪\)/g, '普悠瑪').replace(/自強\(太魯閣\)/g, '太魯閣')
				.replace(/自強\(DMU2800、2900、3000型柴聯及 EMU型電車自強號\)/g, '自強')
				.replace(/區間快/g, '區間快車').replace(/\(.+\)/g, '');
		return (wantsColor)
			? $filter('filter')( trainClass, { classDesc: r }, true )[0].classColor
			: r;
	}
})
// Search Fare by fares[Array] given from controller->view
// c: TrainClassificationID
.filter('trainFare', function($filter){
	return function(c, fares){
		return $filter('filter')( fares, {
			TicketType: $filter('filter')( trainClass, { classNo: c }, true )[0].classFare
		}, true )[0].Price;
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
.filter('noteFormat', function(){
	return function(n){
		n = n || '';
		return n.replace('每日行駛。', '').replace(/柴聯自強號(，|。)/ig, '');
	}
})
// Return TRUE if the DMU note exists.
.filter('DMULabel', function($filter){
	return function(n){
		return /柴聯自強號(，|。)/ig.test(n);
	}
})
// Time subtract, return difference (string)
// Use moment.js, and strip `0小時` from the result.
.filter('timeDiff', function(){
	return function(s, e){
		var r = moment.utc(
			moment(e,'HH:mm').diff(
			moment(s,'HH:mm'))
		).format('H[小時]m[分鐘]').replace(/^0小時/g, '');
		// Handle `Invalid date`. Avoid to display.
		return ( r == 'Invalid date' ) ? '' : r;
	}
})

// Search Date filter. Alias for Data.searchDate
// d (date), m (mode). Set m = TRUE to ask for humanize format.
// Return Date (String)
.filter('searchDate', function(Data){
	return function(d, m){
		var r = Data.searchDate(d);
		return (m) ? r.humanize : r.date;
	}
})

// Determine if the train has departured
// Return 'disabled' (String) (Semantic UI class)
.filter('isDepartured', function(){
	return function(departure, date){

		var today = moment().format('YYYY-MM-DD');
		var now	= moment().format('HH:mm');

		return ( !moment(today).isSame(date) )
			? ''
			: ( moment(now, 'HH:mm').isAfter( moment(departure, 'HH:mm')) )
				? 'display-none'
				: '';

	}
})
// Determine if the train is delay.
// t: TrainNo, delay: Delay info given from controller->view
.filter('isDelay', function($filter){
	return function(t, delay){
		try {
			return $filter('filter')( delay, { TrainNo: t }, true )[0].DelayTime
		} catch(e) {
			return false
		}
	}
})


.service('Data', function($filter) {

	this.setItem = function (k, v) {
		v = ( typeof v == 'object' ) ? JSON.stringify(v) : v;
		localStorage.setItem(k, v);
		return true;
	}

	// Transform `台` into `臺` in order to search the station.
	// return string with `臺`
	this.taiTransform = function (s) {
		s = s || '';
		return s.replace('台', '臺');
	}

	// Replace whitespace more than 1, split into array
	// return keyword Array
	this.strToArray = function (s) {
		return s.replace(/\s{1,}/ig, ' ').split(' ');
	}

	// Trun date description into date offset. Calculated by moment.js
	// return Date String
	this.searchDate = function (d) {

		d = d || '';

		if ( d.match(/(週|星期)(一|二|三|四|五|六|日)|(星期天)/) ) {
			var m = moment().days(d);
		}
		else {

			// Determine if the date is almost valid
			if ( moment(d, 'YYYY-MM-DD').isValid() || moment(d, 'MM-DD').isValid() ) {

				// To know what they really is, return a moment() object.
				var m = ( moment(d, 'YYYY-M-D', true).isValid() || moment(d, 'YYYY年M月D日', true).isValid() || moment(d, 'YYYY/M/D', true).isValid() )
					? m = moment(d, 'YYYY-M-D')
					: ( moment(d, 'M-D', true).isValid() || moment(d, 'M月D日', true).isValid() || moment(d, 'M/D', true).isValid() )
						? m = moment(d, 'MM-DD')
						: m = moment();
			}
			else {

				try {
					var v = $filter('filter')( period, { dateDefine: d || false }, true )[0].dateValue;
				} catch (e) {
					var v = 0;
				}
				var m = moment().add(v, 'DAYS');
			}
		}

		return {
			'date': m.format('YYYY-MM-DD'),
			'humanize': m.format('MM月DD日 (dddd)'),
			'today': moment( moment().format('YYYY-MM-DD') ).isSame( m.format('YYYY-MM-DD') ),
		};
	}

	// Search stations by a given key/value set.
	// return JSON Object
	// s: station Name/station Code.
	this.searchStation = function (s) {
		try {
			return ( s.match(/^\d{4}$/) )
				// 	Matches `Station_Code_4`. eg. 1008, 1017...
				? $filter('filter')( stations, { Station_Code_4: Number(s) || false }, true )[0]
				: ( s.match(/^\d{1,3}$/) )
					// Matches `Station_Code_3`. eg. 2, 4, 26, 100, 108
					? $filter('filter')( stations, { Station_Code_3: Number(s) || false }, true )[0]
					// Else: Search `Station_Name`.
					: $filter('filter')( stations, { Station_Name: this.taiTransform(s) || false }, true )[0];
		} catch (e) {
			return false;
		}
	}

})

.service('Request', function($http, $q) {

	// Get Daily Timetable with Origin and Destination
	this.dailyTimeTableOD = function (original, destination, date) {

		var deferred = $q.defer();

		$http.get('http://ptx.transportdata.tw/MOTC/v2/Rail/TRA/DailyTimetable/OD/'+ original +'/to/'+ destination +'/'+ date +'?$format=JSON')
		.success( function(response) {
			data = response;
			deferred.resolve();
		})
		.error ( function(response) {
			return false;
		});

		return deferred.promise;
	}

	// Get the specific train information by TrainNo.
	this.dailyTimeTable = function (train, date) {

		var deferred = $q.defer();

		$http.get('http://ptx.transportdata.tw/MOTC/v2/Rail/TRA/DailyTimetable/'+ train +'/'+ date +'?$format=JSON')
		.success( function(response) {
			data = response;
			deferred.resolve();
		})
		.error ( function(response) {
			return false;
		});

		return deferred.promise;
	}

	// Get the all train information by StationCode
	this.dailyTimeTableStation = function (station, date) {

		var deferred = $q.defer();

		$http.get('http://ptx.transportdata.tw/MOTC/v2/Rail/TRA/DailyTimetable/Station/'+ station +'/'+ date +'?$format=JSON')
		.success( function(response) {
			data = response;
			deferred.resolve();
		})
		.error ( function(response) {
			return false;
		});

		return deferred.promise;
	}

	// Get the fares between startStation and destStation.
	this.ODFare = function (original, destination) {

		var deferred = $q.defer();

		$http.get('http://ptx.transportdata.tw/MOTC/v2/Rail/TRA/ODFare/'+ original +'/to/'+ destination +'?$format=JSON')
		.success( function(response) {
			data = response;
			deferred.resolve();
		})
		.error ( function(response) {
			return false;
		});

		return deferred.promise;
	}

	// Get Live PIDS(Passenger Information Display System) information.
	this.liveBoard = function (original) {

		var deferred = $q.defer();

		$http.get('http://ptx.transportdata.tw/MOTC/v2/Rail/TRA/LiveBoard/'+ original +'?$format=JSON')
		.success( function(response) {
			data = response;
			deferred.resolve();
		})
		.error ( function(response) {
			return false;
		});

		return deferred.promise;
	}

	// Return HTTP request response.
	this.getData = function() {
		return data;
	};

})


;
