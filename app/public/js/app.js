var pervasiveApp = angular.module('pervasiveApp', ['ngRoute', 'elasticsearch', 'n3-line-chart', 'pervasiveController']);

pervasiveApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'partials/graph.html',
            controller: 'GraphCtrl'
        }).otherwise({
            redirectTo: '/'
        });
    }]);

pervasiveApp.service('client', ['esFactory', function (esFactory) {
    return esFactory({
        host: 'localhost:9200',
        apiVersion: '1.5',
        log: 'trace'
    });
}]);