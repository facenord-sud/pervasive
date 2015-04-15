var pervasiveController = angular.module('pervasiveController', []);

pervasiveController.controller('GraphCtrl', ['$scope', 'client', 'esFactory', function($scope, client, esFactory) {
    var data_size = 1000;
    var from_date = "2008-11-01T00:00:00";
    var to_date = "2015-01-01T00:00:00";
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
                        avg_sun: {
                            avg: {
                                field: "sun"
                            }
                        },
                        avg_energy: {
                            avg: {
                                field: "watt_needed_for_heating"
                            }
                        },
                        avg_gaz_energy: {
                            avg: {
                                field: "watt_of_gaz"
                            }
                        }
                    }
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
        var max_energy = 0;
        var min_temperature = 0;
        var max_temperature = 0;
        var temperature = 0;
        for(var i=0; i < hits.length; i++) {
            temperature = hits[i].avg_temperature.value;
            if (max_energy < hits[i].avg_sun.value) {
                max_energy = hits[i].avg_sun.value
            }
            if(max_energy < hits[i].avg_energy.value) {
                max_energy = hits[i].avg_energy.value
            }
            if(max_energy < hits[i].avg_gaz_energy.value) {
                max_energy = hits[i].avg_gaz_energy.value
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
                value_sun: hits[i].avg_sun.value,
                value_energy: hits[i].avg_energy.value,
                value_gaz_energy: - parseInt(hits[i].avg_gaz_energy.value)
            };
        }
        $scope.options = {
            axes: {
                x: {key: 'x', labelFunction: function(value) {return value;}, type: 'date', ticks: 2},
                y: {type: 'linear', min: min_temperature, max: max_temperature.value, ticks: 5},
                y2: {type: 'linear', min: -500, max: 500, ticks: 5}
            },
            series: [
                {y: 'value', color: 'steelblue', thickness: '1px', type: 'linear', striped: true, label: 'Outside temperature'},
                {y: "value_sun", label: "Sun (W/h)", color: "green", type: "column", axis: "y2"},
                {y: "value_gaz_energy", label: "Energy from the gaz heater (W/h)", color: "black", type: "area", axis: "y2"}
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
