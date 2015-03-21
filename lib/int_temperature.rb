class IntTemperature

  attr_accessor :last_temperature
  VARIATION_MIN = 0.1
  VARIATION_MAX = 0.3
  MAX = 22.0
  MIN = 21.0

  def initialize
    @last_temperature = rand(MIN..MAX)
  end

  def generate
    if minus?
      _variation = variation
      actual_temp = (last_temperature - _variation < MIN ? last_temperature + _variation : last_temperature - _variation).to_f
      last_temperature = actual_temp
    else
       _variation = variation
      actual_temp = (last_temperature + _variation > MAX ? last_temperature - _variation : last_temperature + _variation).to_f
      last_temperature = actual_temp
    end
    return last_temperature.to_f
  end

  private
  def minus?
    [true, false].sample
  end

  def variation
    rand(VARIATION_MIN..VARIATION_MAX)
  end
end
