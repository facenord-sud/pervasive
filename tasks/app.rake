namespace :app do
  desc 'Start the server'
  task :start do
    require File.join(File.dirname(__FILE__), '..', 'app', 'app.rb')
    Sinatra::Application.run!
  end
end