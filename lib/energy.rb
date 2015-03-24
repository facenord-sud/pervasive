class Energy

  attr_accessor :sun_energy, :gaz_energy, :tank_heat, :delta_tank, :debit, :delta_t_needed, :tot_watt, :input_sun_water, :lost_temperature

  def initialize
    @tank_heat = 60.0
    @sun_energy = 0.0
    @gaz_energy = 0.0
    @gained_temperature = 0.0
    @debit = 0.0
  end

  SURFCACE_PANEL = 1200.0 # Surface des panneaux en m^2
  DEBIT_PANEL = 450.0 # l'eau envoyée dans les panneaux en l/h
  MASSIC_HEAT = 4.85 # Chaleur massique de l'eau (J/g) pour 1 C
  MASS_VOLUMIC = 998.0 # Masse voulmique de l'eau
  TANK_VOLUME = 25000.0 * 1000 # Volume (l) de la citerne d'eau chaude --> 25'000m^3
  MAX_TANK_HEAT = 95.0 # La chaleure maximale de la cuve
  MAX_DEBIT = 500 # debit max pour le chaufage (l/h)
  MIN_DEBIT = 400 # dbit minum dépend si les gens ferment les radiateurs on non.
  STOP_HEATING = 18.0 # Le température extérieure à laquelle on arrête de chauffer
  MAX_ENERGY = MAX_DEBIT * MASS_VOLUMIC * MASSIC_HEAT * LOST_TEMPERATURE# L'énergie maximale que peut envoyer le chauffage dans le bâtiment
  LOST_TEMPERATURE = 10.0 # Valeure arbitraire qui dit que l'on perd 10˚C de température pour l'eau qui circule dans le chauffage. Toujours.

  # Nous partons du principe qu'au débit maximal La température de chaque pièce est maintenue à 21C par -25 et que l'eau retournée à perdue 10˚C
  # À partir de 18˚C le chauffage est arrêté. La fonction pour calculer l'énergie nécessaire pour chauffer le bâtiment en fonction de la température extérieurs est linéeaire
  # chaleure résiduelle pas prise en compte ni le vent.
  def generate(date, temp_ext, sun)
    @tot_watt = sun * SURFCACE_PANEL
    @input_sun_water = (@tot_watt / (MASSIC_HEAT * DEBIT_PANEL * MASS_VOLUMIC)).to_f # En 1 heure la température de 450l d'eau s'ect accrue de delta_t
    previous_tank_t = @tank_heat
    @tank_heat = ((@tank_heat * TANK_VOLUME) + ((@input_sun_water + @tank_heat) * DEBIT_PANEL)) / (TANK_VOLUME + DEBIT_PANEL) # L'accroissement de température de la citerne
    @gained_temperature = @tank_heat - previous_tank_t
    @tank_heat = MAX_TANK_HEAT if @tank_heat > MAX_TANK_HEAT
    if temp_ext >= STOP_HEATING# On chauffe pas si il fait plus que 20 extérieur
      @sun_energy = 0.0
      @gaz_energy = 0.0
    end
    @debit = rand(MIN_DEBIT..MAX_DEBIT) # Le debit du chauffage. Dépend si les gens ferment les radiateurs on non. Valeur totalement arbitraire et au hasard.
    energy_needed = energy_from_temp_exterior(temp_ext) # On a besoin d'une telle énérgie pour chauffer le bâtiment
    @delta_t_needed = energy_needed / (@debit * MASS_VOLUMIC * MASSIC_HEAT) # La différence de température qu'il faut injecter dans le bâtiment pour obtenir une telle énergie
    @sun_energy = @debit * MASS_VOLUMIC * MASSIC_HEAT * @delta_t_needed # énergie que l'on peut obtenir du soleil pour delta de température requis pour une quantité d'un débit donnée
    @gaz_energy = energy_needed - @sun_energy # énergie que l'on a besoin pour compléter le soleil
    @gaz_energy = 0 if @gaz_energy < 0
    previous_tank_t = @tank_heat
    @tank_heat = @tank_heat * TANK_VOLUME - LOST_TEMPERATURE * @debit / (@debit * TANK_VOLUME)
    @lost_temperature = previous_tank_t - @tank_heat
  end

  private

  # Calcule la différence de température pour une une quantitée d'eau donnée (l) et une énergie(W)
  def delta_from_debit(debit, energy)
    energy / (debit * MASS_VOLUMIC * MASSIC_HEAT)
  end

  def energy_from_temp_exterior(temp_ext)
    return MAX_ENERGY if temp_ext <= -25.0
    return 0 if temp_ext >= STOP_HEATING
   (-temp_ext + MAX_ENERGY) / (MAX_ENERGY / STOP_HEATING)
  end
end