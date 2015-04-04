require 'rubygems'
require 'bundler/setup'

Bundler.require(:data)

require 'csv'

require_all File.join(File.dirname(__FILE__), 'lib')
