class Weather

  attr_accessor :rain, :temperature, :wind, :sun, :date

  def initialize(date, temperature, rain, wind, sun)
    @rain = rain.to_f
    @temperature = temperature.to_f
    @wind = wind.to_f
    @sun = sun.to_f
    @date = Time.strptime(date, "%d.%m.%Y %H:%M")
  end

  def date_to_s
    @date.strftime('%Y-%m-%dT%H:%M:00')
  end

  def to_hash
    {rain: rain, ext_temperature: temperature, wind: wind, sun: sun, date: date_to_s}
  end

  def self.read_csv(name, &block)
    CSV.foreach(name, encoding: 'ISO-8859-1', col_sep: ';') do |row|
      next if $. <= 3
      block.call Weather.new(*row)
    end
  end
end
