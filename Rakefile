require File.join(File.dirname(__FILE__), 'app.rb')

namespace :generate do

  desc 'Generate the temperature interior and save it to CSV for plotting with R'
  task :temp_int, [:number_of_years] do |t, args|
    temp_int = IntTemperature.new
     args[:number_of_years].each_hours_to_now(:temp_int, %w(DateTime Average_Temperature)) do |hour|
       temp_int.generate
       [hour, temp_int.last_temperature]
     end
  end

  desc 'Generate the heating energy'
  task :energy do
    energy = Energy.new
    headers = ['DateTime'] + energy.to_hash.map {|k, v| k} + %w(Temperature_Exterior Sun Temperature_Interior)
    temp_int = IntTemperature.new
    CSV.open('datas/r/energy.csv', 'wb') do |csv|
      csv << headers
      Weather.read_csv('datas/weather/meteo-cressier-2014.csv') do |weather|
        temp_int.generate
        energy.generate(weather, temp_int)
        csv << [weather.date] + energy.to_hash.map {|k, v| v} + [weather.temperature, weather.sun, temp_int.last_temperature]
      end
    end
  end

  desc 'Generate the multiplicity of sensors'
  task :m_sensors do
    energy = Energy.new
    m_sensors = MultiplySensors.new
    headers = ['DateTime'] + m_sensors.to_hash.map {|k, v| k}
    temp_int = IntTemperature.new
    CSV.open('datas/r/m_sensors.csv', 'wb') do |csv|
      csv << headers
      Weather.read_csv('datas/weather/meteo-cressier-2014.csv') do |weather|
        temp_int.generate
        energy.generate(weather, temp_int)
        m_sensors.generate(energy, temp_int, weather)
        csv << [weather.date] + m_sensors.to_hash.map {|k, v| v}
      end
    end
  end

  desc 'Generate the water part'
  task :water do
    water = Water.new
    headers = ['DateTime'] + water.to_hash.map {|k, v| k}
    CSV.open('datas/r/water.csv', 'wb') do |csv|
      csv << headers
      Weather.read_csv('datas/weather/meteo-cressier-2014.csv') do |weather|
        water.generate(weather.rain, weather.date)
        csv << [weather.date] + water.to_hash.map {|k, v| v}
      end
    end
  end

  desc 'Generate all datas to CSV'
  task :all do
    Task.invoke[:m_sensors, :energy]
  end

  desc 'Save meteo datas to elasticsearch'
  task :es do
    int_temperature = IntTemperature.new
    water = Water.new
    energy = Energy.new
    m_sensors = MultiplySensors.new
    Dir.glob('datas/weather/meteo-cressier-*').each do |file|
      CSV.foreach(File.join(File.dirname(__FILE__), file), encoding: 'ISO-8859-1', col_sep: ';') do |row|
        next if $. <= 3
        weather = Weather.new(*row)
        water.generate(weather.rain, weather.date)
        int_temperature.generate
        energy.generate(weather, int_temperature)
        m_sensors.generate(energy, int_temperature, weather)
        save('datas', body: weather.to_hash.merge(water.to_hash).merge(energy.to_hash).merge({moy_temp_interior: int_temperature.last_temperature}).merge(m_sensors.to_hash))
      end
      puts "file #{file} saved to es"
    end
  end
end
