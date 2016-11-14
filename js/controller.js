TRAExt
.controller('StationCtrl', function($scope) {

	$scope.stations = JSON.parse(JSON.stringify(stations));

})

.controller('TimetableCtrl', function($scope, $filter, Data, Request) {

	$scope.keyword = '中壢 臺北 明天';

	$scope.search = function () {

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
.filter('trainClass', function($filter){
	return function(c){
		return $filter('filter')( trainClass , { classNo: c } )[0].classDesc;
	}
})
// Transform `TripLine` into trip line description
.filter('tripLine', function($filter){
	return function(l){
		return $filter('filter')( tripLine , { lineNo: l } )[0].lineDesc;
	}
})
// Formatting note. Strip `每日行駛。` from note.
.filter('noteFormat', function($filter){
	return function(n){
		n = n || '';
		return n.replace('每日行駛。', '');
	}
})

.service('Data', function($filter) {

	// Search stations by a given key/value set.
	// return JSON Object
	this.searchStation = function (s) {
		return $filter('filter')( stations , { Station_Name: s || false } )[0];
	}

	// Search period by a given key/value set.
	// return Time
	this.searchPeriod = function (p) {
		return $filter('filter')( this.station() , { Station_Name: p || false } )[0];
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
