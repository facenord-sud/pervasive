require File.join(File.dirname(__FILE__), 'app.rb')

namespace :generate do
  desc 'Save meteo datas to elasticsearch'
  task :all do
    int_temperature = IntTemperature.new
    water = Water.new
    max = 0
    CSV.foreach(File.join(File.dirname(__FILE__), 'datas/agrometeo.csv'), encoding: 'ISO-8859-1', col_sep: ';') do |row|
      next if $. <= 3
      weather = Weather.new(*row)
      # water.generate(weather.rain, weather.date)
      max = weather.sun if weather.sun < max
    end
    puts max
  end
end
