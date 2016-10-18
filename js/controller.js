TRAExt
.controller('StationCtrl', ['$scope', function($scope) {

	$scope.stations = JSON.parse(JSON.stringify(stations));

}]);
