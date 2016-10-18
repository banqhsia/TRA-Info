var TRAExt = angular.module('TRAExt', ['ui.router']);

TRAExt.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

	$stateProvider

	.state('station', {
		url: '/station',
		templateUrl: 'views/station/list.html',
		controller: 'StationCtrl'
	})


	.state('timetable', {
		url: '/timetable',
		templateUrl: 'views/timetable/search',
		controller: 'TimetableCtrl'
	})

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/station');

}]);
