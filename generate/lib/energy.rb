class Energy

  SURFCACE_PANEL = 1200.0 # Surface des panneaux en m^2
  DEBIT_PANEL = 450.0 # l'eau envoyée dans les panneaux en l/h
  MASSIC_HEAT = 4.185 # Chaleur massique de l'eau (J/g) pour 1 C
  MASS_VOLUMIC = 1000.0 # Masse voulmique de l'eau
  TANK_VOLUME = 25000.0 * 100 # Volume (l) de la citerne d'eau chaude --> 25'000m^3
  MAX_TANK_HEAT = 95.0 # La chaleure maximale de la cuve
  MAX_DEBIT = 800 # debit max pour le chaufage (l/h)
  MIN_DEBIT = 600 # dbit minum dépend si les gens ferment les radiateurs on non.
  STOP_HEATING = 18.0 # Le température extérieure à laquelle on arrête de chauffer
  MAX_ENERGY = 800 * 1000.0 * 4.185 * 30.0 # L'énergie maximale que peut envoyer le chauffage dans le bâtiment en 1 heure
  LOST_TEMPERATURE = 15.0 # Valeure arbitraire qui dit que l'on perd 10˚C de température pour l'eau qui circule dans les panneaux. Toujours.
  HOUR_IN_SECOND = 3600
  COLDEST_TEMPERATURE = -25.0
  SUN_HEAT_CAPACITY = 0.2
  AMBIENT_TEMPERATURE = 21.0


  attr_accessor :total_watt_of_sun, :watt_available_from_tank, :watt_needed_for_heating, :tank_heat, :debit_heater,
                :diff_t_for_heating, :t_water_before_gaz, :t_water_after_gaz, :diff_t_tank_after_heating, :diff_t_tank_with_sun_water,
                :t_water_out_panels, :watt_of_gaz,

  def initialize
    exit 1
    puts 'salut'
    pourquoi ce code est pas appelé? putain de bordel de merde!
    @tank_heat = 60.0
    @total_watt_of_sun = 1.0
    @watt_available_from_tank = 1.0
    @watt_needed_for_heating = 1.0
    @debit_heater = 1.0
    @diff_t_for_heating = 1.0
    @t_water_before_gaz = 1.0
    @t_water_after_gaz = 1.0
    @diff_t_tank_after_heating = 1.0
    @diff_t_tank_with_sun_water = 1.0
    @t_water_out_panels = 1.0
    @watt_of_gaz = 1.0

  end

  def headers
    [:total_watt_of_sun, :watt_available_from_tank, :watt_needed_for_heating, :tank_heat, :debit_heater,
        :diff_t_for_heating, :t_water_after_gaz, :diff_t_tank_after_heating, :diff_t_tank_with_sun_water,
        :t_water_out_panels, :watt_of_gaz]
  end

  def to_hash
    hash = {}
    instance_variables.each do |ivar|
      hash[ivar.to_s.gsub('@', '').to_sym] = instance_variable_get ivar
    end
    hash
    {total_watt_of_sun: @total_watt_of_sun, watt_available_from_tank: @watt_available_from_tank, watt_needed_for_heating: @watt_needed_for_heating,
     tank_heat: @tank_heat, debit_heater: @debit_heater, diff_t_for_heating: @diff_t_for_heating, t_water_after_gaz: @t_water_after_gaz, t_water_before_gaz: @t_water_before_gaz,
     diff_t_tank_after_heating: @diff_t_tank_after_heating, diff_t_tank_with_sun_water: @diff_t_tank_with_sun_water,
     t_water_out_panels: @t_water_out_panels, watt_of_gaz: @watt_of_gaz}
  end

    # Nous partons du principe qu'au débit maximal La température de chaque pièce est maintenue à 21C par -25 et que l'eau retournée à perdue 10˚C
  # À partir de 18˚C le chauffage est arrêté. La fonction pour calculer l'énergie nécessaire pour chauffer le bâtiment en fonction de la température extérieurs est linéeaire
  # chaleure résiduelle pas prise en compte ni le vent.
  def generate(weather, temp_int)
    @tank_heat ||= 25.0
    sun = weather.sun
    temp_ext = weather.temperature
    temp_int = temp_int.last_temperature.to_f
    @total_watt_of_sun = sun * SURFCACE_PANEL
    total_joule_of_sun = @total_watt_of_sun * HOUR_IN_SECOND
    t_water_in_panels = @tank_heat
    @t_water_out_panels = t_water_in_panels - LOST_TEMPERATURE + (total_joule_of_sun * SUN_HEAT_CAPACITY) / (DEBIT_PANEL * MASS_VOLUMIC * MASSIC_HEAT)
    @diff_t_tank_with_sun_water = (@tank_heat * TANK_VOLUME + @t_water_out_panels * DEBIT_PANEL) / (TANK_VOLUME+DEBIT_PANEL) - @tank_heat
    @diff_t_tank_with_sun_water = 0 if @diff_t_tank_with_sun_water < 0
    @debit_heater = rand(MIN_DEBIT..MAX_DEBIT)
    @joule_needed_for_heating = energy_from_temp_exterior(temp_ext)
    @diff_t_for_heating = @joule_needed_for_heating / ( @debit_heater * MASS_VOLUMIC * MASSIC_HEAT )
    diff_t_of_tank_and_interior = @tank_heat - temp_int
    available_tank_joule_for_debit = @debit_heater * MASS_VOLUMIC * MASSIC_HEAT * diff_t_of_tank_and_interior
    diff_joule_needed_vs_available = available_tank_joule_for_debit - @joule_needed_for_heating
    diff_joule_needed_vs_available < 0 ? needed_joule_gaz = diff_joule_needed_vs_available : needed_joule_gaz = 0
    @t_water_before_gaz = @tank_heat
    @t_water_after_gaz = @tank_heat + @diff_t_for_heating
    @t_water_after_gaz = @t_water_before_gaz if diff_joule_needed_vs_available >= 0
    @diff_t_tank_after_heating = @tank_heat - (@tank_heat * TANK_VOLUME + @diff_t_for_heating * @debit_heater) / (TANK_VOLUME + @debit_heater)
    if @tank_heat >= MAX_TANK_HEAT
      @tank_heat = MAX_TANK_HEAT
    elsif @tank_heat <= AMBIENT_TEMPERATURE
      @tank_heat = AMBIENT_TEMPERATURE
    else
      @tank_heat = @tank_heat + @diff_t_tank_with_sun_water - @diff_t_tank_after_heating
    end
    @watt_needed_for_heating = to_watt @joule_needed_for_heating
    @watt_available_from_tank = to_watt available_tank_joule_for_debit
    @watt_of_gaz = -1 * to_watt(needed_joule_gaz)
  end

  private

  def to_watt(joule)
    joule / HOUR_IN_SECOND
  end

  # Calcule la différence de température pour une une quantitée d'eau donnée (l) et une énergie(W)
  def delta_from_debit(debit, energy)
    energy / (debit * MASS_VOLUMIC * MASSIC_HEAT)
  end

  def energy_from_temp_exterior(temp_ext)
    return MAX_ENERGY if temp_ext <= COLDEST_TEMPERATURE
    return 0 if temp_ext >= STOP_HEATING
   # (-temp_ext + MAX_ENERGY) / (MAX_ENERGY / STOP_HEATING)
    diff_t_heating = COLDEST_TEMPERATURE - STOP_HEATING
    -(((MAX_ENERGY * temp_ext) / diff_t_heating) + ((STOP_HEATING * MAX_ENERGY) / diff_t_heating))
  end
end
