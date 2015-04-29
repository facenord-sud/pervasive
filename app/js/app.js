var pervasiveApp = angular.module('pervasiveApp', ['ngRoute', 'elasticsearch', 'n3-line-chart', 'ui.bootstrap', 'pervasiveController']);

pervasiveApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'partials/graph.html',
            controller: 'GraphCtrl'
        }).otherwise({
            redirectTo: '/'
        });
    }]);
pervasiveApp.config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
}]);

pervasiveApp.service('client', ['esFactory', function (esFactory) {
    return esFactory({
        host: 'localhost:9200',
        apiVersion: '1.5',
        log: 'trace'
    });
}]);