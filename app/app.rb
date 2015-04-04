require 'rubygems'
require 'bundler/setup'

Bundler.require(:app)

get '/' do
  File.read(File.join(File.dirname(__FILE__), 'public', 'index.html'))
end

get 'index.html' do
  redirect '/'
end