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

	.state('about', {
		url: '/about',
		templateUrl: 'views/templates/about.html',
		controller: ''
	})

	.state('train', {
		url: '/timetable/:train/:date',
		templateUrl: 'views/timetable/train.html',
		controller: 'TrainInfoCtrl'
	})

	.state('stationinfo', {
		url: '/station/:station/:date',
		templateUrl: 'views/timetable/station.html',
		controller: 'StationInfoCtrl'
	})


	$urlRouterProvider.otherwise('/timetable');

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

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-40661556-5', 'auto');
ga('send', 'pageview');
