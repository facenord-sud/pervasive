var pervasiveController = angular.module('pervasiveController', []);

pervasiveController.controller('GraphCtrl', ['$scope', 'client', 'esFactory', function($scope, client, esFactory) {
  $scope.isCollapsed = false;
  $scope.end_date = new Date();
  $scope.start_date = moment().subtract(1, 'year').toDate();
  var is_date_interval = function(interval, unit) {
      var start_date = moment($scope.start_date);
      var end_date = moment($scope.end_date);
      var diff_time = end_date - start_date;
      var should_start_date = moment($scope.end_date).subtract(interval, unit);
      return diff_time == (end_date - should_start_date)
    }
  $scope.isActive = function(interval, type) {
    if(type == 'custom' && !is_date_interval(1, 'day') && !is_date_interval(7, 'day') && !is_date_interval(1, 'month') && !is_date_interval(1, 'year')) {
      return 'active'
    } else {
      return (is_date_interval(interval, type) ? 'active' : '');
    }
  };
  var query = function(from_date, to_date) {
    from_date = moment(from_date).format("YYYY-MM-DDT00:00:00")
    to_date = moment(to_date).format("YYYY-MM-DDT00:00:00")
    var data_size = 500;
    var range_hours = Math.round((Math.abs(new Date(to_date) - new Date(from_date)) / 36e5) / data_size);
    var range = "";
    if(range_hours > 24) {
        range = Math.round(range_hours/24).toString() + "d"
    } else if(range_hours > 18) {
      range = "1d";
    } else if(range_hours > 6) {
      range = "12h";
    } else if(range_hours > 3) {
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
        var max_gaz_energy = 0;
        var min_temperature = 0;
        var max_temperature = 0;
        var temperature = 0;
        for(var i=0; i < hits.length; i++) {
            temperature = hits[i].avg_temperature.value;
            if (max_energy < hits[i].avg_sun.value) {
                max_energy = hits[i].avg_sun.value
            }
            if(max_energy < hits[i].avg_sun_energy.value) {
                max_energy = hits[i].avg_sun_energy.value
            }
            if(max_gaz_energy < hits[i].avg_gaz_energy.value) {
                max_gaz_energy = hits[i].avg_gaz_energy.value
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
                value_gaz_energy: - parseInt(hits[i].avg_gaz_energy.value),
                value_sun_energy: parseInt(hits[i].avg_sun_energy.value) / 500
            };
        }
        max_energy = max_energy / 500;
        $scope.options = {
            axes: {
                x: {key: 'x', labelFunction: function(value) {return value;}, type: 'date', ticks: 2},
                y: {type: 'linear', min: min_temperature, max: max_temperature.value, ticks: 5},
                y2: {type: 'linear', min: - max_gaz_energy, max: max_energy, ticks: 5}
            },
            series: [
                {y: 'value', color: 'steelblue', thickness: '1px', type: 'linear', striped: true, label: 'Outside temperature'},
                {y: "value_sun", label: "Sun (W/h)", color: "green", type: "column", axis: "y2", visible: false},
                {y: "value_sun_energy", label: "Energy from the sun heater (W/h)", color: "red", type: "column", axis: "y2"},
                {y: "value_gaz_energy", label: "Energy from the gaz heater (W/h)", color: "black", type: "column", axis: "y2"}
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
  };
  var watch_changes = function() {
    var print_date = function() {
      if($scope.start_date > $scope.end_date) {
        $scope.start_date = moment($scope.end_date).subtract(1, 'day');
      }
      query($scope.start_date, $scope.end_date);
      if(is_date_interval(1, 'day')) {return 'of last day'}
      else if(is_date_interval(7, 'day')) {return 'of last week'}
      else if(is_date_interval(1, 'month')) { return 'of last month'}
      else if(is_date_interval(1, 'year')) {return 'of last year'}
      else {return "from: " + moment($scope.start_date).format("Do MMMM YYYY") + " to " + moment($scope.end_date).format("Do MMMM YYYY")}
    }
    $scope.printDateSelection = 'Data selection ' + print_date();
  };
//  query($scope.start_date, $scope.end_date);
  $scope.$watch('start_date', function() {
    watch_changes();
  });
  $scope.$watch('end_date', function() {
    watch_changes();
  });
}]);
