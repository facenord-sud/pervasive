class Water

  attr_accessor :tank # Le volume (l) d'eau de la citerne
  attr_accessor :buy_water # L'eau achetée pour compléter la citerne

  MAX_WATER = 120000 # Le volumne (l) maximale de la citerne
  MIN_WATER = 24000 # Le volume (l) minimal de la citerne acceptable
  MIN_DEBIT = 200 # Le débit minimum (l/h)
  MAX_DEBIT = 500 # Le débit d'eau max pendant les jours ouvrables (l/h)
  MAX_DEBIT_HOLIDAY = 350 # Le debit d'eau max en période de congé (l/h)
  SURFACE_WATER = 1000 # La surface de récuperation d'eaz de pluie en m^2

  def initialize
    @tank = rand(MIN_WATER..MAX_WATER)
    @buy_water = 0
  end

  def generate(rain, date)
    liter_rain = rain * SURFACE_WATER # Le nombre de litres récoltés
    @tank += liter_rain
    holidays?(date) ? @tank -= rand(MIN_DEBIT..MAX_DEBIT_HOLIDAY) : @tank -= rand(MIN_DEBIT..MAX_DEBIT)
    @tank = MAX_WATER if @tank >= MAX_WATER # Pas plus que 120'000 litres
    diff = MIN_WATER - tank
    if diff > 0 # En dessous du niveau minimale --> achat d'eau
      @tank = MIN_WATER
      @buy_water = diff
    else
      @buy_water = 0
    end
  end

  private

  # Test si la date donnée est un jour ouvrable (vrai si c'est un jour de congé)
  def holidays?(date)
    Holidays.on(date, :ch_ne).any? or date.saturday? or date.sunday?
  end
end
