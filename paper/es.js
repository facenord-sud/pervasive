aggs: {
  data_over_time: {
    date_histogram: {
      field: "date",
      interval: "6H"
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
          gte: "2014-01-01",
          lte: "2015-01-01"
        }
      }
    }
  }
},
sort: {
  date: {order: "asc"}
}
