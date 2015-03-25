class String

  def each_hours_to_now(file_name, headers: nil, &block)
    CSV.open("datas/r/#{file_name}.csv", 'wb') do |csv|
      csv << headers if headers.is_a? Array
      (to_i.years.ago.to_datetime..DateTime.now).each do |day_date|
        (0..23).each do |hour|
          csv << block.call(day_date.change hour: hour)
        end
      end
    end
  end
end