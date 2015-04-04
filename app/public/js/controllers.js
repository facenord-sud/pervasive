var pervasiveController = angular.module('pervasiveController', []);

pervasiveController.controller('GraphCtrl', ['$scope', 'client', 'esFactory', function($scope, client, esFactory) {
    var data_size = 500;
    var from_date = "2014-11-01T00:00:00";
    var to_date = "2014-12-01T00:00:00";
    var range_hours = (Math.abs(new Date(to_date) - new Date(from_date)) / 36e5) / data_size;
    console.log(Math.abs(to_date - from_date) / 36e5);
    client.search({
        index: 'pervasive',
        type: 'datas',
        size: data_size,
        body: {
            aggs: {
                data_over_time: {
                    date_histogram: {
                        field: "date",
                        interval: range_hours + "h"
                    },
                    aggs: {
                        avg_temperature: {
                            avg: {
                                field: "ext_temperature"
                            }
                        },
                        avg_rain: {
                            avg: {
                                field: "rain"
                            }
                        },
                        avg_sun: {
                            avg: {
                                field: "sun"
                            }
                        }
                    }
                },
                max_rain: {
                    max: {field: "rain"}
                },
                max_ext_temperature: {
                    max: {field: "ext_temperature"}
                },
                min_ext_temperature: {
                    min: {field: "ext_temperature"}
                }
            },

            fields: ["ext_temperature", "date"],
            query: {
                filtered: {
                    filter: {
                        range: {
                            date: {
                                gte: from_date,
                                lte: to_date
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
        console.log(response);
        var aggs = response.aggregations;
        var hits = aggs.data_over_time.buckets;
        $scope.data = [];
        var max_rain = 0;
        var min_temperature = 0;
        var max_temperature = 0;
        var temperature = 0;
        for(var i=0; i < hits.length; i++) {
            temperature = hits[i].avg_temperature.value;
            if (max_rain < hits[i].avg_rain.value) {
                max_rain = hits[i].avg_rain.value
            }
            if(min_temperature > temperature) {
                min_temperature = temperature
            }
            if(max_temperature < temperature) {
                max_temperature = temperature
            }
            $scope.data[i] = {
                x: new Date(hits[i].key_as_string),
                value: temperature,
                value_rain: hits[i].avg_rain.value,
                value_sun: hits[i].avg_sun.value
            };
        }
        $scope.options = {
            axes: {
                x: {key: 'x', labelFunction: function(value) {return value;}, type: 'date', ticks: 2},
                y: {type: 'linear', min: min_temperature, max: max_temperature.value, ticks: 5},
                y2: {type: 'linear', min: 0, max: 500, ticks: 5}
            },
            series: [
                {y: 'value', color: 'steelblue', thickness: '1px', type: 'linear', striped: true, label: 'Outside temperature'},
                {y: "value_rain", label: "Rain", color: "#ff7f0e", type: "column", axis: "y2", visible: false},
                {y: "value_sun", label: "Sun (W/h)", color: "green", type: "column", axis: "y2"}
            ],
            lineMode: 'linear',
            tension: 0.7,
            drawLegend: true,
            drawDots: true,
            columnsHGap: 5
        }
    }).catch(function(error) {
        console.log(error)
    });
}]);