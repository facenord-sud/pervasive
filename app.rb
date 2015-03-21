require File.join(File.dirname(__FILE__), 'boot.rb')

def elasticsearch
  @elasticsearch ||= Elasticsearch::Client.new
end

def save(type, body: {})
  elasticsearch.index(index: 'pervasive', type: type, body: body)
end
