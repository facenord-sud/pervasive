class MultiplySensors

  class << self
    def generate_tank_sensors(energy)
      each_sensors(:tank_temp, 11) { variation(energy.tank_heat) }
    end

    def generate_room_sensors(temp_int)
      each_sensors(:room_temp, 150) { variation(temp_int.last_temperature, max: 0.5) }
    end

    def generate_ext_temperature(weather)
      north = each_sensors(:north_temp, 4) { variation(weather.temperature, max: 0.5) }
      east = each_sensors(:east_temp, 4) do
        temp = ( weather.date.hour < 12 ? weather.temperature + 2 : weather.temperature)
        variation(temp, max: 0.5)
      end
      south = each_sensors(:south_temp, 4) do
        temp = ( weather.date.hour > 8 and weather.date.hour < 17 ? weather.temperature + 2.5 : weather.temperature)
        variation(temp, max: 0.5)
      end
      west = each_sensors(:west_temp, 4) do
        temp = ( weather.date.hour > 12 ? weather.temperature + 2 : weather.temperature)
        variation(temp, max: 0.5)
      end
      north.merge(east).merge(south).merge(west)
    end

    private

    def each_sensors(name, qty, &block)
      sensors = {}
      (0..qty).each do |i|
        sensors["#{name}_#{i}"] = block.call
      end
    end

    def plus_minus
      [:-, :+].sample
    end

    def variation(temp, options = {})
      min = options[:min] || 0.0
      max = options[:max] || 0.3
      temp.method(plus_minus).call(rand(min..max))
    end
  end
end