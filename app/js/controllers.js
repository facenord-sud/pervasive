var pervasiveController = angular.module('pervasiveController', []);

pervasiveController.controller('GraphCtrl', ['$scope', 'client', 'esFactory', function ($scope, client, esFactory) {
    $scope.isCollapsed = false;
    $scope.end_date = new Date();
    $scope.selectRange = function (interval, unit) {
        $scope.end_date = new Date();
        $scope.start_date = moment().subtract(interval, unit).toDate();
    };
    $scope.start_date = moment().subtract(1, 'year').toDate();
    var is_date_interval = function (interval, unit) {
        var start_date = moment($scope.start_date);
        var end_date = moment($scope.end_date);
        var diff_time = end_date - start_date;
        var should_start_date = moment($scope.end_date).subtract(interval, unit);
        return diff_time == (end_date - should_start_date)
    };
    $scope.isActive = function (interval, type) {
        if (type == 'custom' && !is_date_interval(1, 'day') && !is_date_interval(7, 'day') && !is_date_interval(1, 'month') && !is_date_interval(1, 'year')) {
            return 'active'
        } else {
            return (is_date_interval(interval, type) ? 'active' : '');
        }
    };
    var query = function (from_date, to_date) {
        from_date = moment(from_date).format("YYYY-MM-DDT00:00:00");
        to_date = moment(to_date).format("YYYY-MM-DDT00:00:00");
        var data_size = 500;
        var range_hours = Math.round((Math.abs(new Date(to_date) - new Date(from_date)) / 36e5) / data_size);
        var range = "";
        if (range_hours > 24) {
            range = Math.round(range_hours / 24).toString() + "d"
        } else if (range_hours > 12) {
            range = "1d";
        } else if (range_hours > 6) {
            range = "12h";
        } else if (range_hours > 2) {
            range = "3h"
        } else {
            range = "1h";
        }
        client.search({
            index: 'pervasive',
            type: 'datas',
            size: data_size,
            body: {
                aggs: {
                    data_over_time: {
                        date_histogram: {
                            field: "date",
                            interval: range
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
                            avg_sun_energy: {
                                avg: {
                                    field: "total_watt_of_sun"
                                }
                            },
                            avg_gaz_energy: {
                                avg: {
                                    field: "watt_of_gaz"
                                }
                            },
                            avg_rain: {
                                avg: {field: "rain"}
                            },
                            avg_used_water: {
                                avg: {field: "tank_water_liter"}
                            },
                            avg_buyed_water: {
                                avg: {field: "water_buyed"}
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
                    date: {order: "asc"}
                }
            }
        }).then(function (response) {
            var aggs = response.aggregations;
            var hits = aggs.data_over_time.buckets;
            var gaussed_results = $.Gauss(hits,
                ['avg_temperature.value', 'avg_sun.value', 'avg_sun_energy.value', 'avg_gaz_energy.value', 'avg_rain.value', 'avg_used_water.value', 'avg_buyed_water.value'],
                ['outside_temperature', 'sunshine', 'sun_energy', 'gaz_energy', 'rain', 'used_water', 'bought_water'], true);
            var items = gaussed_results.items;
            $scope.data = [];
            $scope.data_rain = [];
            var max_energy = gaussed_results.max_sun_energy / 500;
            console.log(max_energy);
            var min_temperature = 0;
            var temperature = 0;
            var buyed_water = 0;
            for (var i = 0; i < items.length; i++) {
                var x_date = new Date(hits[i + 2].key_as_string);
                temperature = items[i].outside_temperature;
                if (min_temperature > temperature) {
                    min_temperature = temperature
                }
                $scope.data[i] = {
                    x: x_date,
                    value: items[i].outside_temperature,
                    value_sun: items[i].sunshine,
                    value_gaz_energy: - items[i].gaz_energy,
                    value_sun_energy: items[i].sun_energy / 500
                };
                $scope.data_rain[i] = {
                    xASD: x_date,
                    rain: hits[i + 2].avg_rain.value,
                    used_water: items[i].used_water / 100,
                    buyed_water: - items[i].bought_water
                };
            }
            $scope.options = {
                axes: {
                    x: {
                        key: 'x', labelFunction: function (value) {
                            return moment(value).format("DD.MM.YYYY hh:mm:ss");
                        }, type: 'date', ticks: 2
                    },
                    y: {type: 'linear', min: min_temperature, max: gaussed_results.max_outside_temperature, ticks: 5},
                    y2: {type: 'linear', min: - gaussed_results.max_gaz_energy, max: max_energy, ticks: 5}
                },
                series: [
                    {
                        y: 'value',
                        color: 'steelblue',
                        thickness: '1px',
                        type: 'linear',
                        striped: true,
                        label: 'Outside temperature'
                    },
                    {y: "value_sun", label: "Sun (W/h)", color: "green", type: "column", axis: "y2", visible: false},
                    {
                        y: "value_sun_energy",
                        label: "Energy from the sun heater (W/h)",
                        color: "red",
                        type: "column",
                        axis: "y2"
                    },
                    {
                        y: "value_gaz_energy",
                        label: "Energy from the gaz heater (W/h)",
                        color: "black",
                        type: "column",
                        axis: "y2"
                    }
                ],
                tooltip: {
                    formatter: function (x, y, series) {
                        return y + " at " + moment(x).format("DD.MM.YYYY hh:mm:ss");
                    }
                },
                lineMode: 'linear',
                tension: 0.7,
                drawLegend: true,
                drawDots: true,
                columnsHGap: 5
            };
            $scope.options_rain = {
                axes: {
                    x: {
                        key: 'xASD', labelFunction: function (value) {
                            return moment(value).format("DD.MM.YYYY hh:mm:ss");
                        }, type: 'date', ticks: 2
                    },
                    y: {type: 'linear', min: -1, max: 1, ticks: 10},
                    y2: {type: 'linear', min: - gaussed_results.max_bought_water, max: gaussed_results.max_used_water / 100, ticks: 5}
                },
                series: [
                    {
                        y: 'rain',
                        color: 'steelblue',
                        thickness: '1px',
                        type: 'column',
                        striped: true,
                        label: 'Precipitations (mm/h)'
                    },
                    {
                        y: "used_water",
                        label: "Tank level (hectoliters)",
                        color: "red",
                        type: "area",
                        striped: true,
                        drawDots: false,
                        axis: "y2"
                    },
                    {y: "buyed_water", label: "Additional water (l)", color: "black", type: "column", axis: "y2"}
                ],
                tooltip: {
                    formatter: function (x, y, series) {
                        return y + " at " + moment(x).format("DD.MM.YYYY hh:mm:ss");
                    }
                },
                lineMode: 'linear',
                tension: 0.7,
                drawLegend: true,
                drawDots: true,
                columnsHGap: 5
            };
        }).catch(function (error) {
            console.log(error)
        });
    };
    var watch_changes = function () {
        var print_date = function () {
            if ($scope.start_date > $scope.end_date) {
                $scope.start_date = moment($scope.end_date).subtract(1, 'day');
            }
            query($scope.start_date, $scope.end_date);
            if (is_date_interval(1, 'day')) {
                return 'of last day'
            }
            else if (is_date_interval(7, 'day')) {
                return 'of last week'
            }
            else if (is_date_interval(1, 'month')) {
                return 'of last month'
            }
            else if (is_date_interval(1, 'year')) {
                return 'of last year'
            }
            else {
                return "from: " + moment($scope.start_date).format("Do MMMM YYYY") + " to " + moment($scope.end_date).format("Do MMMM YYYY")
            }
        };
        $scope.printDateSelection = 'Data selection ' + print_date();
    };
//  query($scope.start_date, $scope.end_date);
    $scope.$watch('start_date', function () {
        watch_changes();
    });
    $scope.$watch('end_date', function () {
        watch_changes();
    });
}]);
