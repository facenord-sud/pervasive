var pervasiveController = angular.module('pervasiveController', []);

pervasiveController.controller('GraphCtrl', ['$scope', 'client', 'esFactory', function($scope, client, esFactory) {
    client.search({
        index: 'pervasive',
        type: 'datas',
        size: 30000,
        body: {
            fields: ["ext_temperature", "date"],
            query: {
                filtered: {
                    filter: {
                        range: {
                            date: {
                                gte: "2013-01-01",
                                lte: "now"
                            }
                        }
                    }
                }
            },
            sort: {
                date: { order: "asc" }
            }
        }
    }).then(function(response) {
        var hits = response.hits.hits;
        $scope.data = [];
        for(var i=0; i < hits.length; i++) {
            $scope.data[i] = {
                x: i,
                value: hits[i].fields.ext_temperature[0]
            };
        }
        $scope.options = {
            axes: {
                x: {key: 'x', labelFunction: function(value) {return value;}, type: 'linear', min: 0, max: 20000, ticks: 1},
                y: {type: 'linear', min: -10, max: 30, ticks: 5}
            },
            series: [
                {y: 'value', color: 'steelblue', thickness: '1px', type: 'linear', striped: true, label: 'Pouet'},
            ],
            lineMode: 'linear',
            tension: 0.7,
            drawLegend: true,
            drawDots: false,
            columnsHGap: 5
        }
    }).catch(function(error) {
        console.log(error)
    });
}]);