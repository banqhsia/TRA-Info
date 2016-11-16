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
		templateUrl: 'views/timetable/search.html',
		controller: 'TimetableCtrl'
	})

	.state('train', {
		url: '/timetable/:train/:date',
		templateUrl: 'views/timetable/train.html',
		controller: 'TrainInfoCtrl'
	})


	$urlRouterProvider.otherwise('/station');

}])
.directive('onEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.onEnter);
                });

                event.preventDefault();
            }
        });
    };
});


// Initialize moment.js locale `zh-tw`
moment.locale('zh-tw');
